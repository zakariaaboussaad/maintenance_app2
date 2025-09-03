import React, { useState, useEffect } from 'react';
import LoginForm from './components/auth/LoginForm.jsx';
import RoleBasedRouter from './components/RoleBasedRouter.jsx';
import PasswordResetPage from './components/auth/PasswordResetPage.jsx';
import SimplePasswordResetPage from './components/pages/SimplePasswordResetPage.jsx';

const MaintenanceApp = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [showPasswordResetLock, setShowPasswordResetLock] = useState(false);
    
    // Debug state changes
    useEffect(() => {
        console.log('showPasswordResetLock changed to:', showPasswordResetLock);
    }, [showPasswordResetLock]);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                // Check if user must change password
                setMustChangePassword(parsedUser.must_change_password === true);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                sessionStorage.removeItem('user');
            }
        }
        setIsLoading(false);
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

    const handleLogin = (userData) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Check if user must change password
        setMustChangePassword(userData.must_change_password === true);
    };

    const handleForgotPassword = () => {
        console.log('handleForgotPassword called - setting showPasswordResetLock to true');
        setShowPasswordResetLock(true);
    };

    const handlePasswordChanged = () => {
        // Clear temporary reset state
        localStorage.removeItem('temp_token');
        localStorage.removeItem('temp_user');
        setShowPasswordResetLock(false);
        
        // Update user state to remove must_change_password flag
        if (user) {
            const updatedUser = { ...user, must_change_password: false };
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setMustChangePassword(false);
    };

    const handleLogout = () => {
        setUser(null);
        setMustChangePassword(false);
        setShowPasswordResetLock(false);
        localStorage.removeItem('temp_token');
        localStorage.removeItem('temp_user');
        sessionStorage.removeItem('user');
    };

    // Show simple password reset page if temporary token exists
    if (showPasswordResetLock) {
        console.log('Showing SimplePasswordResetPage');
        return (
            <SimplePasswordResetPage 
                onPasswordChanged={handlePasswordChanged}
                onCancel={() => {
                    localStorage.removeItem('temp_token');
                    localStorage.removeItem('temp_user');
                    setShowPasswordResetLock(false);
                }}
            />
        );
    }

    // Show login form if no user is logged in
    if (!user) {
        return <LoginForm onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
    }

    // Show main application with password reset overlay if needed
    return (
        <RoleBasedRouter 
            user={user} 
            onLogout={handleLogout}
            mustChangePassword={mustChangePassword}
            onPasswordChanged={handlePasswordChanged}
        />
    );
};

export default MaintenanceApp;
