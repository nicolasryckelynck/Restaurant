import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/menu" className="navbar-brand">
                    🍴 Restaurant
                </Link>

                <div className="navbar-menu">
                    <Link to="/menu" className={isActive('/menu')}>
                        Menu
                    </Link>

                    <Link to="/my-reservations" className={isActive('/my-reservations')}>
                        Mes Réservatins
                    </Link>

                    <Link to="/reservations/new" className={isActive('/reservations/new')}>
                        Nouvelle Réservation
                    </Link>

                    {user && user.role === 'admin' && (
                        <Link to="/reservations" className={isActive('/reservations')}>
                            Admin - Réservations
                        </Link>
                    )}
                </div>

                <div className="navbar-user">
                    <span className="user-info">
                        👤 {user.email}
                        {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                    </span>
                    <button onClick={onLogout} className="btn btn-danger btn-sm">
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 