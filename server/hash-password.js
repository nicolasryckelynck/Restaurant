const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function hashAndUpdatePassword() {
    const password = 'motdepasse';
    const hash = await bcrypt.hash(password, 10);
    console.log('Nouveau hash généré:', hash);

    // Configuration de la connexion
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        port: 8111,
        database: 'restaurant_db'
    });

    try {
        // Mise à jour du mot de passe dans la base de données
        await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hash, 'admin@restaurant.com']
        );
        console.log('Mot de passe mis à jour dans la base de données');

        // Vérification
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@restaurant.com']
        );
        console.log('Utilisateur mis à jour:', users[0]);
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await connection.end();
    }
}

hashAndUpdatePassword(); 