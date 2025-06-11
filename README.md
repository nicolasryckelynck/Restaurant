# Application de Sélection d'Éléments

Une application React avec Node.js permettant de gérer une liste d'éléments avec un système de sélection unique.

## Fonctionnalités

- 📋 Liste d'éléments interactifs
- ✅ Sélection unique (un seul élément sélectionné à la fois)
- ➕ Ajout de nouveaux éléments
- 🗑️ Suppression d'éléments existants
- 📱 Interface responsive
- 🎨 Design moderne avec animations

## Structure du Projet

```
├── server/          # Serveur Node.js + API
│   ├── server.js    # Serveur principal
│   └── package.json
└── client/          # Application React
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Installation et Démarrage

### 1. Installer les dépendances du serveur

```bash
cd server
npm install
```

### 2. Installer les dépendances du client

```bash
cd client
npm install
```

### 3. Démarrer le serveur (Port 5000)

```bash
cd server
npm start
# ou pour le développement avec nodemon:
npm run dev
```

### 4. Démarrer le client (Port 3000)

```bash
cd client
npm start
```

L'application sera accessible sur `http://localhost:3000`

## API Endpoints

- `GET /api/items` - Récupérer tous les éléments
- `GET /api/items/selected` - Récupérer l'élément sélectionné
- `POST /api/items/:id/select` - Sélectionner un élément
- `POST /api/items` - Ajouter un nouvel élément
- `DELETE /api/items/:id` - Supprimer un élément

## Technologies Utilisées

### Backend
- Node.js
- Express.js
- CORS
- Body-parser

### Frontend
- React 18
- JSX (pas de TypeScript)
- CSS3 avec animations
- Fetch API pour les requêtes

## Configuration Simple

- Pas de webpack personnalisé (utilise Create React App)
- Pas de fichiers .env 
- Configuration minimale et directe
- URLs codées en dur pour la simplicité 