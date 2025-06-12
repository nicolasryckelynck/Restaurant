const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'mon-secret-jwt-super-secret';

// Configuration MySQL
const dbConfig = {
  host: process.env.DB_HOST     || '127.0.0.1',
  user: process.env.DB_USER     || 'root',
  password: process.env.DB_PASS || '',
  port: process.env.DB_PORT     || 8111,
  database: process.env.DB_NAME || 'restaurant_db'
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    next();
};

// Routes d'authentification
app.post('/signup', async (req, res) => {
    try {
        const { email, password, confirmPassword, firstName, lastName, phone } = req.body;

        // Validation des champs
        if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
        }

        const connection = await pool.getConnection();
        try {
            // Vérifier si l'email existe déjà
            const [existingUsers] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insérer le nouvel utilisateur
            const [result] = await connection.execute(
                'INSERT INTO users (email, password, firstName, lastName, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
                [email, hashedPassword, firstName, lastName, phone, 'client']
            );

            // Générer le token
            const token = jwt.sign(
                {
                    id: result.insertId,
                    email,
                    role: 'client',
                    firstName,
                    lastName
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Compte créé avec succès',
                token,
                user: {
                    id: result.insertId,
                    email,
                    role: 'client',
                    firstName,
                    lastName
                }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion pour:', email);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const connection = await pool.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            const user = users[0];
            if (!user) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Connexion réussie',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route du menu
app.get('/menu', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [menuItems] = await connection.execute(
                'SELECT * FROM menuitems ORDER BY category, name'
            );
            res.json(menuItems);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du menu:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes des tables
app.get('/tables', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [tables] = await connection.execute(
                'SELECT * FROM tables ORDER BY number'
            );
            res.json(tables);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des tables:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes des réservations (client)
app.get('/my-reservations', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [reservations] = await connection.execute(
                `SELECT r.*, GROUP_CONCAT(t.number) as tableNumbers 
                FROM reservations r 
                LEFT JOIN reservationtables rt ON r.id = rt.reservationId 
                LEFT JOIN tables t ON rt.tableId = t.id 
                WHERE r.userId = ? 
                GROUP BY r.id 
                ORDER BY r.date DESC, r.time DESC`,
                [req.user.id]
            );
            res.json(reservations);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Création d'une réservation
app.post('/reservations', authenticateToken, async (req, res) => {
    try {
        const { date, time, numberOfPeople, tableIds, note } = req.body;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Insérer la réservation
            const [result] = await connection.execute(
                'INSERT INTO reservations (userId, date, time, numberOfPeople, note, status) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.id, date, time, numberOfPeople, note, 'pending']
            );

            const reservationId = result.insertId;

            // Associer les tables à la réservation
            for (const tableId of tableIds) {
                await connection.execute(
                    'INSERT INTO reservationtables (reservationId, tableId) VALUES (?, ?)',
                    [reservationId, tableId]
                );
            }

            await connection.commit();

            res.status(201).json({
                message: 'Réservation créée avec succès',
                reservationId
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes admin
app.get('/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [reservations] = await connection.execute(`
                SELECT 
                    r.*,
                    u.firstName,
                    u.lastName,
                    u.email,
                    u.phone,
                    GROUP_CONCAT(t.number) as tableNumbers
                FROM reservations r
                JOIN users u ON r.userId = u.id
                LEFT JOIN reservationtables rt ON r.id = rt.reservationId
                LEFT JOIN tables t ON rt.tableId = t.id
                GROUP BY r.id
                ORDER BY r.date DESC, r.time DESC
            `);
            res.json(reservations);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Validation/Refus d'une réservation
app.patch('/admin/reservations/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE reservations SET status = ? WHERE id = ?',
                [status, id]
            );

            res.json({ message: 'Statut de la réservation mis à jour' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Gestion du menu (admin)
app.post('/admin/menu', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'INSERT INTO menuitems (name, description, price, category) VALUES (?, ?, ?, ?)',
                [name, description, price, category]
            );
            res.status(201).json({ message: 'Plat ajouté avec succès' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du plat:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.patch('/admin/menu/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, isAvailable } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE menuitems SET name = ?, description = ?, price = ?, category = ?, isAvailable = ? WHERE id = ?',
                [name, description, price, category, isAvailable, id]
            );
            res.json({ message: 'Plat mis à jour avec succès' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du plat:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.delete('/admin/menu/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'DELETE FROM menuitems WHERE id = ?',
                [id]
            );
            res.json({ message: 'Plat supprimé avec succès' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du plat:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log('Comptes de test:');
    console.log('Admin: admin@restaurant.com / motdepasse');
    console.log('Client: client@example.com / motdepasse');
}); 