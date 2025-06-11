import React, { useState, useEffect } from 'react';
import './Reservations.css';

const API_URL = 'http://localhost:5000';

function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAllReservations();
    }, []);

    const fetchAllReservations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/reservations`, {
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

    const handleValidateReservation = async (reservationId) => {
        if (!window.confirm('Confirmer cette réservation ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'confirmed' })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la validation');
            }

            const data = await response.json();

            // Mettre à jour la réservation localement
            setReservations(reservations.map(r =>
                r.id === reservationId ? { ...r, status: 'confirmed' } : r
            ));

            alert('Réservation confirmée avec succès');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'annulation');
            }

            // Supprimer la réservation de la liste locale
            setReservations(reservations.filter(r => r.id !== reservationId));

            alert('Réservation annulée avec succès');
        } catch (error) {
            setError(error.message);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'confirmed':
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
            case 'confirmed':
                return 'status-confirmed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFilteredReservations = () => {
        if (filterStatus === 'all') {
            return reservations;
        }
        return reservations.filter(r => r.status === filterStatus);
    };

    const getStatusCount = (status) => {
        return reservations.filter(r => r.status === status).length;
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement des réservations...</p>
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
                <h1 className="page-title">🔧 Administration - Réservations</h1>
                <p className="page-subtitle">Gérez toutes les réservations du restaurant</p>
            </div>

            {/* Statistiques */}
            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-number">{reservations.length}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-number">{getStatusCount('pending')}</div>
                    <div className="stat-label">En attente</div>
                </div>
                <div className="stat-card confirmed">
                    <div className="stat-number">{getStatusCount('confirmed')}</div>
                    <div className="stat-label">Confirmées</div>
                </div>
                <div className="stat-card cancelled">
                    <div className="stat-number">{getStatusCount('cancelled')}</div>
                    <div className="stat-label">Annulées</div>
                </div>
            </div>

            {/* Filtres */}
            <div className="filters">
                <button
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    Toutes ({reservations.length})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                >
                    En attente ({getStatusCount('pending')})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('confirmed')}
                >
                    Confirmées ({getStatusCount('confirmed')})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('cancelled')}
                >
                    Annulées ({getStatusCount('cancelled')})
                </button>
            </div>

            {/* Tableau des réservations */}
            {getFilteredReservations().length === 0 ? (
                <div className="no-reservations">
                    <h3>Aucune réservation trouvée</h3>
                    <p>Aucune réservation ne correspond aux filtres sélectionnés.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Téléphone</th>
                                <th>Personnes</th>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Statut</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredReservations().map(reservation => (
                                <tr key={reservation.id} className={`table-row ${reservation.status}`}>
                                    <td className="reservation-id">#{reservation.id}</td>
                                    <td className="client-name">{reservation.name}</td>
                                    <td className="client-phone">{reservation.phone}</td>
                                    <td className="nb-persons">{reservation.nbPersonnes}</td>
                                    <td className="reservation-date">{formatDate(reservation.date)}</td>
                                    <td className="reservation-time">{reservation.time}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                                            {getStatusLabel(reservation.status)}
                                        </span>
                                    </td>
                                    <td className="reservation-note">
                                        {reservation.note || '-'}
                                    </td>
                                    <td className="actions">
                                        {reservation.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleValidateReservation(reservation.id)}
                                                    className="btn btn-success btn-sm"
                                                    title="Confirmer la réservation"
                                                >
                                                    ✓ Confirmer
                                                </button>
                                                <button
                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                    className="btn btn-danger btn-sm"
                                                    title="Annuler la réservation"
                                                >
                                                    ✗ Annuler
                                                </button>
                                            </>
                                        )}
                                        {reservation.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                className="btn btn-danger btn-sm"
                                                title="Annuler la réservation"
                                            >
                                                ✗ Annuler
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminReservations; 