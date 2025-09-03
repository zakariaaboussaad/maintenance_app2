// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { authService } from '../../services/apiService';

const LoginForm = ({ onLogin, onForgotPassword }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [forgotPasswordData, setForgotPasswordData] = useState({
        nom: '',
        email: '',
        default_password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [passwordExpiryWarning, setPasswordExpiryWarning] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setPasswordExpiryWarning('');

        try {
            const result = await authService.login(formData.email, formData.password);

            if (result.success) {
                // Check for password expiry warning
                if (result.password_expiry_warning) {
                    setPasswordExpiryWarning(`⚠️ Votre mot de passe expire dans ${result.password_days_remaining} jours. Veuillez le changer dans les paramètres.`);
                }
                
                // Check if user must reset password
                if (result.must_change_password) {
                    // Redirect to password reset lock page
                    localStorage.setItem('temp_token', result.token);
                    localStorage.setItem('temp_user', JSON.stringify(result.user));
                    window.location.href = '/password-reset-lock';
                    return;
                }
                
                onLogin(result.user);
            } else {
                setErrors({
                    general: result.message
                });
            }
        } catch (error) {
            setErrors({
                general: 'Une erreur inattendue s\'est produite'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!forgotPasswordData.nom || !forgotPasswordData.email || !forgotPasswordData.default_password) {
            setErrors({ forgot: 'Veuillez remplir tous les champs' });
            return;
        }

        setForgotPasswordLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/forgot-password/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: forgotPasswordData.nom,
                    email: forgotPasswordData.email,
                    default_password: forgotPasswordData.default_password
                })
            });

            console.log('LoginForm response status:', response.status);
            const result = await response.json();
            console.log('LoginForm response data:', result);

            if (response.ok && result.success) {
                console.log('Success! Triggering password reset page...');
                // Store temporary token and user data for password reset
                localStorage.setItem('temp_token', result.token);
                localStorage.setItem('temp_user', JSON.stringify(result.user));
                
                // Clear the form and hide forgot password section
                setShowForgotPassword(false);
                setForgotPasswordData({ nom: '', email: '', default_password: '' });
                setErrors({});
                
                // Small delay to ensure state updates, then trigger callback
                setTimeout(() => {
                    if (onForgotPassword) {
                        console.log('Calling onForgotPassword callback...');
                        onForgotPassword();
                    } else {
                        console.error('onForgotPassword callback not provided');
                    }
                }, 100);
            } else {
                setErrors({ forgot: result.message || 'Erreur lors de la vérification' });
            }
        } catch (error) {
            console.error('LoginForm error:', error);
            setErrors({ forgot: error.message || 'Erreur de connexion' });
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px'}}>
            <div style={{backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '48px', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0'}}>
                <div style={{textAlign: 'center', marginBottom: '32px'}}>
                    <div style={{fontSize: '28px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '8px'}}>
                        <span style={{color: '#4880FF'}}>ONEE</span>
                        <span style={{color: '#374151'}}>-BE</span>
                    </div>
                    <p style={{color: '#64748b', fontSize: '16px'}}>
                        Système de gestion maintenance
                    </p>
                </div>

                {errors.general && (
                    <div style={{backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '16px 12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center'}}>
                        {errors.general}
                    </div>
                )}

                <div onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}>
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                            Adresse email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@onee.com"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '16px',
                                border: errors.email ? '2px solid #f87171' : '2px solid #d1d5db',
                                borderRadius: '12px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8fafc',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.backgroundColor = 'white';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }
                            }}
                        />
                        {errors.email && (
                            <p style={{color: '#f87171', fontSize: '12px', marginTop: '6px'}}>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div style={{marginBottom: '28px'}}>
                        <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '16px',
                                border: errors.password ? '2px solid #f87171' : '2px solid #d1d5db',
                                borderRadius: '12px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8fafc',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                if (!errors.password) {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.backgroundColor = 'white';
                                }
                            }}
                            onBlur={(e) => {
                                if (!errors.password) {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }
                            }}
                        />
                        {errors.password && (
                            <p style={{color: '#f87171', fontSize: '12px', marginTop: '6px'}}>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div style={{textAlign: 'right', marginBottom: '20px'}}>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>

                    {/* Password Expiry Warning */}
                    {passwordExpiryWarning && (
                        <div style={{
                            backgroundColor: '#fef3c7',
                            border: '1px solid #f59e0b',
                            color: '#92400e',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            ⚠️ {passwordExpiryWarning}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: '0',
                            fontFamily: 'inherit',
                            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                            color: 'white'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = '#2563eb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = '#3b82f6';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid white',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Connexion en cours...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </div>

                

            </div>
        </div>
    );
};

export default LoginForm;
