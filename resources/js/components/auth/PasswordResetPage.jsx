import React, { useState } from 'react';
import axios from 'axios';

const PasswordResetPage = ({ user, onPasswordChanged, onLogout }) => {
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.new_password !== formData.confirm_password) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.new_password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('/api/reset-password-forced', {
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Clear the forced reset flag and call password changed callback
            localStorage.removeItem('must_change_password');
            if (onPasswordChanged) {
                onPasswordChanged(user);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setError(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 8px 0'
                        }}>
                            Réinitialisation Obligatoire
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: 0
                        }}>
                            Vous devez changer votre mot de passe pour continuer
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '4px'
                            }}>
                                Nouveau mot de passe
                            </label>
                            <input
                                name="new_password"
                                type="password"
                                required
                                value={formData.new_password}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '4px'
                            }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                name="confirm_password"
                                type="password"
                                required
                                value={formData.confirm_password}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                marginBottom: '16px'
                            }}
                        >
                            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            Vous ne pouvez pas accéder à l'application tant que vous n'avez pas changé votre mot de passe
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
