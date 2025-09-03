import React, { useState } from 'react';

const SimplePasswordResetPage = ({ onPasswordChanged, onLogout }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        default_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('verify'); // 'verify' or 'reset'
    const [resetToken, setResetToken] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Sending request to:', '/api/forgot-password/verify');
            console.log('Request data:', {
                name: formData.name,
                email: formData.email,
                default_password: '***hidden***'
            });
            
            const response = await fetch('/api/forgot-password/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    default_password: formData.default_password
                })
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response format');
            }
            
            console.log('Parsed response data:', responseData);
            
            if (response.ok && responseData.success) {
                setResetToken(responseData.token);
                setStep('reset');
            } else {
                throw new Error(responseData.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            console.log('Error details:', {
                code: error.code,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.code === 'ERR_NETWORK') {
                setError('Erreur de connexion - Serveur non disponible');
            } else if (error.response?.status === 404) {
                setError('Utilisateur non trouvé');
            } else if (error.response?.status === 401) {
                setError('Mot de passe par défaut incorrect');
            } else if (error.response?.status === 400) {
                setError('Aucun mot de passe par défaut configuré');
            } else {
                setError(error.response?.data?.message || 'Erreur de connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
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
            console.log('Sending password reset request:', {
                token: resetToken,
                new_password: '***hidden***',
                confirm_password: '***hidden***'
            });

            const response = await fetch('/api/forgot-password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    token: resetToken,
                    new_password: formData.new_password,
                    confirm_password: formData.confirm_password
                })
            });

            console.log('Reset response status:', response.status);
            
            const responseText = await response.text();
            console.log('Reset raw response:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response format');
            }
            
            console.log('Reset parsed response:', result);
            
            if (response.ok && result.success) {
                if (onPasswordChanged) {
                    onPasswordChanged();
                }
            } else {
                throw new Error(result.message || 'Erreur lors de la réinitialisation');
            }

        } catch (error) {
            console.error('Reset error:', error);
            setError(error.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'reset') {
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
                    maxWidth: '450px',
                    width: '100%',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '32px'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <span style={{ fontSize: '32px', color: '#3b82f6' }}>🔑</span>
                            </div>
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#111827',
                                marginBottom: '8px'
                            }}>
                                Nouveau Mot de Passe
                            </h2>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                margin: 0
                            }}>
                                Choisissez un mot de passe sécurisé
                            </p>
                        </div>

                        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {error && (
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fca5a5',
                                    color: '#dc2626',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="new_password" style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Nouveau mot de passe
                                </label>
                                <input
                                    id="new_password"
                                    name="new_password"
                                    type="password"
                                    required
                                    value={formData.new_password || ''}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm_password" style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    required
                                    value={formData.confirm_password || ''}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '16px',
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
                                    padding: '16px',
                                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

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
                maxWidth: '450px',
                width: '100%',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            border: '3px solid #3b82f6'
                        }}>
                            <span style={{ fontSize: '24px', color: '#3b82f6' }}>🔑</span>
                        </div>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '8px'
                        }}>
                            Vérification d'Identité
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            margin: 0
                        }}>
                            Entrez vos informations et le mot de passe par défaut
                        </p>
                    </div>

                    <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fca5a5',
                                color: '#dc2626',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Nom complet
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label htmlFor="default_password" style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Mot de passe par défaut
                            </label>
                            <input
                                id="default_password"
                                name="default_password"
                                type="password"
                                required
                                value={formData.default_password}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
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
                                padding: '14px 20px',
                                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#2563eb';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#3b82f6';
                                }
                            }}
                        >
                            {loading ? 'Vérification...' : 'Vérifier les informations'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={onLogout}
                            style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Retour à la connexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimplePasswordResetPage;
