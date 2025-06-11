import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import des contextes
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';

// Import des composants
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Menu from './pages/Menu';
import MyReservations from './pages/MyReservations';
import NewReservation from './pages/NewReservation';
import AdminReservations from './pages/AdminReservations';

function AppContent() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
                <p>Chargement de l'application...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                {user && <Navbar user={user} onLogout={logout} />}

                <main className="main-content">
                    <Routes>
                        {/* Routes publiques */}
                        <Route
                            path="/login"
                            element={!user ? <Login /> : <Navigate to="/menu" />}
                        />
                        <Route
                            path="/signup"
                            element={!user ? <Signup /> : <Navigate to="/menu" />}
                        />

                        {/* Routes protégées */}
                        <Route
                            path="/menu"
                            element={user ? <Menu /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/my-reservations"
                            element={user ? <MyReservations /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/reservations/new"
                            element={user ? <NewReservation /> : <Navigate to="/login" />}
                        />

                        {/* Routes admin */}
                        <Route
                            path="/reservations"
                            element={user && user.role === 'admin' ? <AdminReservations /> : <Navigate to="/menu" />}
                        />

                        {/* Redirection par défaut */}
                        <Route
                            path="/"
                            element={user ? <Navigate to="/menu" /> : <Navigate to="/login" />}
                        />

                        {/* Route 404 */}
                        <Route
                            path="*"
                            element={<Navigate to={user ? "/menu" : "/login"} />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <LoadingProvider>
                <AppContent />
            </LoadingProvider>
        </AuthProvider>
    );
}

export default App; 