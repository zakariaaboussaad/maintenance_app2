import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Settings } from 'lucide-react';

const PasswordExpiryTimer = ({ user }) => {
    const [daysRemaining, setDaysRemaining] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (user?.id) {
            checkPasswordExpiry();
            // Check every hour
            const interval = setInterval(checkPasswordExpiry, 60 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const checkPasswordExpiry = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/user/password-expiry-status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDaysRemaining(data.days_remaining);
                    setShowWarning(data.days_remaining <= 30 && data.days_remaining > 0);
                }
            }
        } catch (error) {
            console.error('Error checking password expiry:', error);
        }
    };

    const getWarningColor = () => {
        if (daysRemaining <= 7) return {
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            borderColor: '#fca5a5'
        };
        if (daysRemaining <= 14) return {
            backgroundColor: '#fff7ed',
            color: '#9a3412',
            borderColor: '#fdba74'
        };
        if (daysRemaining <= 30) return {
            backgroundColor: '#fefce8',
            color: '#a16207',
            borderColor: '#fde047'
        };
        return {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderColor: '#93c5fd'
        };
    };

    const getIcon = () => {
        if (daysRemaining <= 7) return <AlertTriangle style={{ width: '16px', height: '16px' }} />;
        return <Clock style={{ width: '16px', height: '16px' }} />;
    };

    const formatTimeRemaining = () => {
        if (daysRemaining <= 0) return 'Expiré';
        if (daysRemaining === 1) return '1 jour';
        return `${daysRemaining} jours`;
    };

    if (!showWarning || daysRemaining === null) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid',
            fontSize: '14px',
            fontWeight: '500',
            ...getWarningColor()
        }}>
            {getIcon()}
            <span>
                Mot de passe expire dans {formatTimeRemaining()}
            </span>
            <button
                onClick={() => {
                    // Since we don't have routing, we can't navigate to settings
                    // This could be enhanced to trigger a callback to parent component
                    console.log('Navigate to settings - functionality to be implemented');
                }}
                style={{
                    marginLeft: '8px',
                    padding: '4px',
                    borderRadius: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
                title="Aller aux paramètres"
            >
                <Settings style={{ width: '12px', height: '12px' }} />
            </button>
        </div>
    );
};

export default PasswordExpiryTimer;
