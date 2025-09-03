import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const PasswordExpiryTimer = ({ user }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [warningLevel, setWarningLevel] = useState('normal'); // 'normal', 'warning', 'critical'

    useEffect(() => {
        if (!user?.password_expires_at) return;

        const updateTimer = () => {
            const now = new Date();
            const expiryDate = new Date(user.password_expires_at);
            const timeDiff = expiryDate - now;

            if (timeDiff <= 0) {
                setTimeLeft(null);
                setWarningLevel('expired');
                return;
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft({ days, hours, minutes });

            // Set warning levels
            if (days <= 1) {
                setWarningLevel('critical');
            } else if (days <= 7) {
                setWarningLevel('warning');
            } else {
                setWarningLevel('normal');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [user?.password_expires_at]);

    if (!timeLeft && warningLevel !== 'expired') return null;

    const getWarningColor = () => {
        switch (warningLevel) {
            case 'critical': return '#dc2626';
            case 'warning': return '#f59e0b';
            case 'expired': return '#dc2626';
            default: return '#3b82f6';
        }
    };

    const getWarningText = () => {
        if (warningLevel === 'expired') {
            return 'Mot de passe expiré - Changement requis';
        }
        
        if (!timeLeft) return '';

        const { days, hours } = timeLeft;
        
        if (days > 0) {
            return `Mot de passe expire dans ${days} jour${days > 1 ? 's' : ''} et ${hours}h`;
        } else {
            return `Mot de passe expire dans ${hours}h`;
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: warningLevel === 'critical' || warningLevel === 'expired' ? '#fef2f2' : 
                           warningLevel === 'warning' ? '#fffbeb' : '#eff6ff',
            border: `1px solid ${warningLevel === 'critical' || warningLevel === 'expired' ? '#fecaca' : 
                                 warningLevel === 'warning' ? '#fed7aa' : '#bfdbfe'}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: getWarningColor(),
            fontWeight: '500'
        }}>
            {warningLevel === 'critical' || warningLevel === 'expired' ? 
                <AlertTriangle size={14} /> : 
                <Clock size={14} />
            }
            <span>{getWarningText()}</span>
        </div>
    );
};

export default PasswordExpiryTimer;
