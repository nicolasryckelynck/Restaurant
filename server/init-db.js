const mysql = require('mysql2/promise');

async function initDatabase() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        port: 8111,
        database: 'restaurant_db'
    });

    try {
        // Suppression des tables existantes dans le bon ordre
        await connection.execute('DROP TABLE IF EXISTS reservationtables');
        await connection.execute('DROP TABLE IF EXISTS reservations');
        await connection.execute('DROP TABLE IF EXISTS menuitems');
        await connection.execute('DROP TABLE IF EXISTS tables');
        await connection.execute('DROP TABLE IF EXISTS users');

        console.log('Tables existantes supprimées');

        // Création de la table users
        await connection.execute(`
            CREATE TABLE users (
                id INT(11) NOT NULL AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role ENUM('client', 'admin') DEFAULT 'client',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Création de la table tables
        await connection.execute(`
            CREATE TABLE tables (
                id INT(11) NOT NULL AUTO_INCREMENT,
                number VARCHAR(10) NOT NULL,
                seats INT(11) NOT NULL,
                isAvailable TINYINT(1) DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY (number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Création de la table menuitems
        await connection.execute(`
            CREATE TABLE menuitems (
                id INT(11) NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category ENUM('entrées', 'plats', 'desserts', 'boissons') NOT NULL,
                imageUrl VARCHAR(255),
                isAvailable TINYINT(1) DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Création de la table reservations
        await connection.execute(`
            CREATE TABLE reservations (
                id INT(11) NOT NULL AUTO_INCREMENT,
                userId INT(11) NOT NULL,
                numberOfPeople INT(11) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                note TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (userId) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Création de la table reservationtables
        await connection.execute(`
            CREATE TABLE reservationtables (
                id INT(11) NOT NULL AUTO_INCREMENT,
                reservationId INT(11) NOT NULL,
                tableId INT(11) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (reservationId) REFERENCES reservations(id),
                FOREIGN KEY (tableId) REFERENCES tables(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Insertion des données de test
        // Insertion d'utilisateurs de test
        const hashedPassword = '$2b$10$l43tcBm.9RsIL1ZnYaJsYu7XO5HjVY86ALB7LxoWUdEPF49Rxu7T.'; // motdepasse
        await connection.execute(`
            INSERT INTO users (email, password, firstName, lastName, phone, role) VALUES 
            ('admin@restaurant.com', ?, 'Admin', 'Restaurant', '0123456789', 'admin'),
            ('client@example.com', ?, 'Jean', 'Dupont', '0687654321', 'client')
        `, [hashedPassword, hashedPassword]);

        // Insertion des tables
        await connection.execute(`
            INSERT INTO tables (number, seats) VALUES 
            ('T1', 2),
            ('T2', 2),
            ('T3', 4),
            ('T4', 4),
            ('T5', 6),
            ('T6', 8)
        `);

        // Insertion des plats
        const menuItems = [
            ['Salade César', 'Laitue romaine, croûtons, parmesan, sauce césar maison', 12.50, 'entrées'],
            ['Soupe à l\'oignon', 'Soupe à l\'oignon gratinée traditionnelle', 9.90, 'entrées'],
            ['Foie gras', 'Foie gras maison et sa confiture de figues', 18.50, 'entrées'],
            ['Entrecôte', 'Entrecôte grillée sauce au poivre', 28.90, 'plats'],
            ['Saumon', 'Pavé de saumon à l\'unilatérale', 24.50, 'plats'],
            ['Risotto', 'Risotto aux champignons', 19.90, 'plats'],
            ['Tarte Tatin', 'Tarte aux pommes caramélisées', 8.50, 'desserts'],
            ['Mousse au chocolat', 'Mousse au chocolat noir', 7.90, 'desserts'],
            ['Crème brûlée', 'Crème brûlée à la vanille', 8.90, 'desserts'],
            ['Vin rouge', 'Bordeaux Saint-Émilion', 45.00, 'boissons'],
            ['Champagne', 'Champagne brut', 65.00, 'boissons'],
            ['Cocktail', 'Mojito', 12.00, 'boissons']
        ];

        for (const item of menuItems) {
            await connection.execute(
                'INSERT INTO menuitems (name, description, price, category) VALUES (?, ?, ?, ?)',
                item
            );
        }

        console.log('Base de données initialisée avec succès !');
        console.log('Tables créées : users, tables, menuitems, reservations, reservationtables');
        console.log('Données de test insérées dans toutes les tables');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        if (error.sqlMessage) {
            console.error('Message SQL:', error.sqlMessage);
        }
    } finally {
        await connection.end();
    }
}

initDatabase(); 