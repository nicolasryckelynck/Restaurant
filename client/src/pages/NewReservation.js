import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reservations.css';

const API_URL = 'http://localhost:5000';

function NewReservation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        numberOfPeople: '',
        date: '',
        time: '',
        note: '',
        tableIds: []
    });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/tables`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des tables');
            }

            const data = await response.json();
            setTables(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Effacer les messages quand l'utilisateur tape
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleTableSelection = (tableId) => {
        setFormData(prev => {
            const newTableIds = prev.tableIds.includes(tableId)
                ? prev.tableIds.filter(id => id !== tableId)
                : [...prev.tableIds, tableId];
            return { ...prev, tableIds: newTableIds };
        });
    };

    const validateForm = () => {
        if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
            setError('Le nombre de personnes doit être d\'au moins 1');
            return false;
        }
        if (!formData.date) {
            setError('La date est requise');
            return false;
        }
        if (!formData.time) {
            setError('L\'heure est requise');
            return false;
        }
        if (formData.tableIds.length === 0) {
            setError('Veuillez sélectionner au moins une table');
            return false;
        }

        // Vérifier que la date n'est pas dans le passé
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('La date de réservation ne peut pas être dans le passé');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    numberOfPeople: parseInt(formData.numberOfPeople)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création de la réservation');
            }

            setSuccess('Réservation créée avec succès !');

            // Rediriger vers mes réservations après 2 secondes
            setTimeout(() => {
                navigate('/my-reservations');
            }, 2000);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Générer les créneaux horaires
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 12; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    // Date minimum (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">🍽️ Nouvelle Réservation</h1>
                <p className="page-subtitle">Réservez votre table en quelques clics</p>
            </div>

            <div className="reservation-form-container">
                <div className="card">
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-group">
                            <label htmlFor="numberOfPeople" className="form-label">
                                👥 Nombre de personnes *
                            </label>
                            <select
                                id="numberOfPeople"
                                name="numberOfPeople"
                                value={formData.numberOfPeople}
                                onChange={handleChange}
                                className="form-control"
                                disabled={loading}
                                required
                            >
                                <option value="">Sélectionnez</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>
                                        {num} personne{num > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" className="form-label">
                                📅 Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="form-control"
                                min={today}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="time" className="form-label">
                                ⏰ Heure *
                            </label>
                            <select
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="form-control"
                                disabled={loading}
                                required
                            >
                                <option value="">Sélectionnez une heure</option>
                                {generateTimeSlots().map(time => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                🪑 Tables disponibles *
                            </label>
                            <div className="tables-grid">
                                {tables.map(table => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        className={`table-button ${formData.tableIds.includes(table.id) ? 'selected' : ''}`}
                                        onClick={() => handleTableSelection(table.id)}
                                        disabled={loading}
                                    >
                                        Table {table.number}
                                        <span className="table-seats">({table.seats} places)</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="note" className="form-label">
                                💬 Note (optionnelle)
                            </label>
                            <textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Informations supplémentaires (anniversaire, allergies, etc.)"
                                rows="3"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/my-reservations')}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Création...' : 'Créer la réservation'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">ℹ️ Informations</h3>
                    </div>
                    <ul>
                        <li>Les réservations sont confirmées sous 24h</li>
                        <li>Vous pouvez annuler jusqu'à 2h avant</li>
                        <li>Service de 12h à 23h</li>
                        <li>Créneaux disponibles toutes les 30 minutes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NewReservation; 