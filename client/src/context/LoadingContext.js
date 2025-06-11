import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}

export function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const startLoading = (message = 'Chargement...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    const stopLoading = () => {
        setIsLoading(false);
        setLoadingMessage('');
    };

    const value = {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {isLoading && (
                <div className="global-loading-overlay">
                    <div className="global-loading-content">
                        <div className="spinner"></div>
                        <p>{loadingMessage}</p>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
} 