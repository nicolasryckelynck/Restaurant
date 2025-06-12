import React, { useState, useEffect } from 'react';
import './Menu.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Menu() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await fetch(`${API_URL}/menu`);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement du menu');
            }

            const data = await response.json();
            setMenu(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getMenuByCategory = () => {
        if (selectedCategory === 'all') {
            return menu;
        }
        return menu.filter(item => item.category === selectedCategory);
    };

    const getCategoryCount = (category) => {
        return menu.filter(item => item.category === category).length;
    };

    const categories = [
        { id: 'all', name: 'Tout', count: menu.length },
        { id: 'entrees', name: 'Entrées', count: getCategoryCount('entrees') },
        { id: 'plats', name: 'Plats', count: getCategoryCount('plats') },
        { id: 'desserts', name: 'Desserts', count: getCategoryCount('desserts') }
    ];

    if (loading) {
        return (
            <div className="page">
                <div className="loading-menu">
                    <div className="spinner"></div>
                    <p>Chargement du menu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="alert alert-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">🍽️ Notre Menu</h1>
                <p className="page-subtitle">Découvrez nos spécialités culinaires</p>
            </div>

            <div className="menu-container">
                {/* Filtres par catégorie */}
                <div className="category-filters">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                            <span className="category-count">({category.count})</span>
                        </button>
                    ))}
                </div>

                {/* Liste des plats */}
                <div className="menu-grid">
                    {getMenuByCategory().map(item => (
                        <div key={item.id} className="menu-item">
                            <div className="menu-item-header">
                                <h3 className="menu-item-name">{item.name}</h3>
                                <span className="menu-item-price">{Number(item.price).toFixed(2)} €</span>
                            </div>
                            <p className="menu-item-description">{item.description}</p>
                            <div className="menu-item-category">
                                <span className={`category-badge ${item.category}`}>
                                    {item.category === 'entrees' ? 'Entrée' :
                                        item.category === 'plats' ? 'Plat' : 'Dessert'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {getMenuByCategory().length === 0 && (
                    <div className="no-items">
                        <p>Aucun plat trouvé dans cette catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Menu; 