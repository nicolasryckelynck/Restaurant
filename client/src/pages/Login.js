import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
    const { login } = useAuth();
    const { startLoading, stopLoading } = useLoading();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Effacer l'erreur quand l'utilisateur tape
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        startLoading('Connexion en cours...');
        setError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la connexion');
            }

            // Utiliser le contexte d'authentification
            login(data.token, data.user);

        } catch (error) {
            setError(error.message);
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">🍴 Restaurant</h1>
                    <h2>Connexion</h2>
                    <p>Connectez-vous pour accéder à votre compte</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                    >
                        Se connecter
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Pas encore de compte ?
                        <Link to="/signup" className="auth-link">
                            Créer un compte
                        </Link>
                    </p>
                    <div className="demo-accounts">
                        <small>Comptes de démonstration :</small>
                        <small>Admin: admin@restaurant.com / motdepasse</small>
                        <small>Client: client@example.com / motdepasse</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login; 