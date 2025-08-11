import React, { useState, useEffect } from 'react';
import LoginForm from './components/auth/LoginForm.jsx';
import RoleBasedRouter from './components/RoleBasedRouter.jsx';

const MaintenanceApp = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
                sessionStorage.removeItem('user');
            }
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '4px solid #d1d5db',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{fontSize: '18px', color: '#64748b'}}>
                        Chargement de l'application...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            {user ? (
                <RoleBasedRouter user={user} onLogout={() => setUser(null)} />
            ) : (
                <LoginForm onLogin={setUser} />
            )}

            {/* Global Styles */}
            <style>
                {`
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        background-color: #f8fafc;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(10px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }

                    input:focus {
                        outline: none;
                    }

                    button:focus {
                        outline: none;
                    }
                `}
            </style>
        </>
    );
};

export default MaintenanceApp;
