import React, { useState } from 'react';
import { AlertTriangle, Key } from 'lucide-react';
import axios from 'axios';

const PasswordResetLockPage = ({ user, onPasswordChanged, onLogout }) => {
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
            const response = await axios.post('/api/forgot-password/verify', {
                name: formData.name,
                email: formData.email,
                default_password: formData.default_password
            });

            setResetToken(response.data.token);
            setStep('reset');
        } catch (error) {
            console.error('Verification error:', error);
            setError(error.response?.data?.message || 'Informations incorrectes');
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
            await axios.post('/api/forgot-password/reset', {
                token: resetToken,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });

            // Call the password changed callback
            if (onPasswordChanged) {
                onPasswordChanged(user);
            }
        } catch (error) {
            console.error('Reset error:', error);
            setError(error.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    // Exit Warning Modal
    const ExitWarningModal = () => (
        showExitWarning && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}>
                    <AlertTriangle style={{ 
                        width: '48px', 
                        height: '48px', 
                        color: '#f59e0b',
                        margin: '0 auto 16px'
                    }} />
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '12px'
                    }}>
                        Réinitialisation Obligatoire
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '24px',
                        lineHeight: '1.5'
                    }}>
                        Vous devez réinitialiser votre mot de passe avant d'accéder à l'application.
                        Cette action est obligatoire pour votre sécurité.
                    </p>
                    <button
                        onClick={() => setShowExitWarning(false)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Continuer la réinitialisation
                    </button>
                </div>
            </div>
        )
    );

    if (step === 'reset') {
        return (
            <>
                <ExitWarningModal />
                <div style={{
                    minHeight: '100vh',
                    backgroundColor: '#1f2937',
                    display: 'flex',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    {/* Sidebar */}
                    <div style={{
                        width: '280px',
                        backgroundColor: '#111827',
                        padding: '24px 0',
                        borderRight: '1px solid #374151'
                    }}>
                        <div style={{
                            padding: '0 24px',
                            marginBottom: '32px'
                        }}>
                            <h1 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: 'white',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Shield style={{ width: '24px', height: '24px' }} />
                                Maintenance App
                            </h1>
                        </div>
                        
                        <div style={{
                            padding: '0 24px'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#374151',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Lock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                                <span style={{
                                    color: '#f59e0b',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Réinitialisation Obligatoire
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{
                        flex: 1,
                        padding: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            maxWidth: '500px',
                            width: '100%'
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
                                        <Key style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
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
                                        Choisissez un mot de passe sécurisé pour votre compte
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
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ExitWarningModal />
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#1f2937',
                display: 'flex',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                {/* Sidebar */}
                <div style={{
                    width: '280px',
                    backgroundColor: '#111827',
                    padding: '24px 0',
                    borderRight: '1px solid #374151'
                }}>
                    <div style={{
                        padding: '0 24px',
                        marginBottom: '32px'
                    }}>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Shield style={{ width: '24px', height: '24px' }} />
                            Maintenance App
                        </h1>
                    </div>
                    
                    <div style={{
                        padding: '0 24px'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#374151',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Lock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                            <span style={{
                                color: '#f59e0b',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                Vérification Identité
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    padding: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%'
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
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Key style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
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
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'background-color 0.2s'
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
                                    onClick={() => setShowExitWarning(true)}
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
            </div>
        </>
    );
};

export default PasswordResetLockPage;
