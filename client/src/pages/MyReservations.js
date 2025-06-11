import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import './Reservations.css';

const API_URL = 'http://localhost:5000';

function MyReservations() {
    const { getToken } = useAuth();
    const { startLoading, stopLoading } = useLoading();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyReservations();
    }, []);

    const fetchMyReservations = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/my-reservations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des réservations');
            }

            const data = await response.json();
            setReservations(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        try {
            startLoading('Annulation de la réservation...');
            const token = getToken();
            const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'annulation');
            }

            // Supprimer la réservation de la liste locale
            setReservations(reservations.filter(r => r.id !== reservationId));

            // Afficher un message de succès
            alert('Réservation annulée avec succès');
        } catch (error) {
            setError(error.message);
        } finally {
            stopLoading();
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'validated':
                return 'Confirmée';
            case 'cancelled':
                return 'Annulée';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'validated':
                return 'status-validated';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement de vos réservations...</p>
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
                <h1 className="page-title">📅 Mes Réservations</h1>
                <p className="page-subtitle">Gérez vos réservations de table</p>
            </div>

            <div className="reservations-actions">
                <Link to="/reservations/new" className="btn btn-primary">
                    ➕ Nouvelle réservation
                </Link>
            </div>

            {reservations.length === 0 ? (
                <div className="no-reservations">
                    <div className="no-reservations-icon">📅</div>
                    <h3>Aucune réservation</h3>
                    <p>Vous n'avez pas encore effectué de réservation.</p>
                    <Link to="/reservations/new" className="btn btn-primary">
                        Faire ma première réservation
                    </Link>
                </div>
            ) : (
                <div className="reservations-grid">
                    {reservations.map(reservation => (
                        <div key={reservation.id} className="reservation-card">
                            <div className="reservation-header">
                                <h3>Réservation #{reservation.id}</h3>
                                <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                                    {getStatusLabel(reservation.status)}
                                </span>
                            </div>

                            <div className="reservation-details">
                                <div className="detail-row">
                                    <span className="detail-label">👤 Nom :</span>
                                    <span className="detail-value">{reservation.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">📞 Téléphone :</span>
                                    <span className="detail-value">{reservation.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">👥 Personnes :</span>
                                    <span className="detail-value">{reservation.nbPersonnes}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">📅 Date :</span>
                                    <span className="detail-value">{formatDate(reservation.date)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">⏰ Heure :</span>
                                    <span className="detail-value">{reservation.time}</span>
                                </div>
                                {reservation.note && (
                                    <div className="detail-row">
                                        <span className="detail-label">💬 Note :</span>
                                        <span className="detail-value">{reservation.note}</span>
                                    </div>
                                )}
                            </div>

                            {reservation.status === 'pending' && (
                                <div className="reservation-actions">
                                    <button
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyReservations; 