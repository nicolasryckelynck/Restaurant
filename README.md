# Application de Réservation de Restaurant

Une application web moderne pour la gestion des réservations de restaurant, développée avec React.js et Node.js.

## 🚀 Fonctionnalités

### Pour les Clients
- 👤 Inscription et connexion sécurisées
- 📖 Consultation du menu du restaurant
- 📅 Création et gestion des réservations
- 📱 Interface responsive et intuitive
- 📊 Suivi des réservations en temps réel

### Pour les Administrateurs
- 🔑 Interface d'administration sécurisée
- 📋 Gestion des réservations (confirmation, annulation)
- 📊 Tableau de bord avec statistiques
- 👥 Gestion des utilisateurs

## 🛠️ Technologies Utilisées

### Frontend
- React.js
- React Router pour la navigation
- Context API pour la gestion d'état
- CSS moderne pour le style

### Backend
- Node.js
- Express.js
- MySQL pour la base de données
- JWT pour l'authentification

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/nicolasryckelynck/Restaurant.git
cd Restaurant
```

2. Installez les dépendances du serveur :
```bash
cd server
npm install
```

3. Installez les dépendances du client :
```bash
cd ../client
npm install
```

4. Configurez la base de données :
- Créez une base de données MySQL
- Copiez `.env.example` vers `.env` et configurez les variables d'environnement

5. Initialisez la base de données :
```bash
cd ../server
node init-db.js
```

## 🚀 Démarrage

1. Démarrez le serveur :
```bash
cd server
npm start
```

2. Dans un nouveau terminal, démarrez le client :
```bash
cd client
npm start
```

L'application sera accessible à l'adresse : http://localhost:3000

## 🔒 Variables d'Environnement

### Serveur (.env)
```
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=nom_de_la_base
JWT_SECRET=votre_secret_jwt
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 📱 Captures d'écran

[À venir]

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

Nicolas Ryckelynck - [GitHub](https://github.com/nicolasryckelynck) 