import React, { useState, useEffect } from 'react';
import { Key, Save, Clock, AlertTriangle, Timer, Calendar, CheckCircle, Users, Eye, EyeOff, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

// Format time remaining in a readable format
const formatTimeRemaining = (daysDecimal) => {
  const totalHours = daysDecimal * 24;
  const days = Math.floor(daysDecimal);
  const hours = Math.floor((daysDecimal - days) * 24);
  const minutes = Math.floor(((daysDecimal - days) * 24 - hours) * 60);
  
  if (days > 0) {
    if (hours > 0) {
      return `${days} jour${days > 1 ? 's' : ''} et ${hours}h`;
    }
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h et ${minutes}min`;
    }
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
};

const AdminDefaultPasswordsPage = () => {
    const [defaultPassword, setDefaultPassword] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showSetPassword, setShowSetPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchDefaultPasswordInfo();
        fetchUsers();
    }, []);

    const fetchDefaultPasswordInfo = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/admin/default-password/info', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const data = response.data.data;
                setDefaultPassword(data.default_password || '');
                setExpiryDate(data.expiry_date || '');
                setDaysRemaining(data.days_remaining || 0);
            }
        } catch (error) {
            console.error('Error fetching default password info:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/admin/users', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
        setConfirmPassword(password);
    };

    const handleSetDefaultPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post('/api/admin/default-password/set', {
                default_password: newPassword,
                force_change_users: selectedUsers
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setMessage('Mot de passe par défaut défini avec succès');
                setShowSetPassword(false);
                setNewPassword('');
                setConfirmPassword('');
                setSelectedUsers([]);
                fetchDefaultPasswordInfo();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la définition du mot de passe');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDefaultPassword = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer le mot de passe par défaut ?')) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.delete('/api/admin/default-password/remove', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage('Mot de passe par défaut supprimé avec succès');
                fetchDefaultPasswordInfo();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const getExpiryWarningColor = () => {
        if (daysRemaining <= 7) return {
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            borderColor: '#fca5a5'
        };
        if (daysRemaining <= 30) return {
            color: '#d97706',
            backgroundColor: '#fffbeb',
            borderColor: '#fcd34d'
        };
        return {
            color: '#059669',
            backgroundColor: '#ecfdf5',
            borderColor: '#86efac'
        };
    };

    const getExpiryIcon = () => {
        if (daysRemaining <= 7) return <AlertTriangle style={{ width: '20px', height: '20px' }} />;
        if (daysRemaining <= 30) return <Clock style={{ width: '20px', height: '20px' }} />;
        return <Clock style={{ width: '20px', height: '20px' }} />;
    };

    return (
        <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                }}>
                    <Key style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                    Mots de Passe par Défaut
                </h1>
                <p style={{ color: '#6b7280', marginTop: '4px' }}>
                    Gérez le mot de passe par défaut utilisé pour la récupération de compte
                </p>
            </div>

            {message && (
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #86efac',
                    color: '#059669',
                    borderRadius: '8px'
                }}>
                    ✅ {message}
                </div>
            )}

            {error && (
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    borderRadius: '8px'
                }}>
                    ❌ {error}
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
            }}>
                {/* Current Default Password Status */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '24px'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '16px'
                    }}>
                        Statut Actuel
                    </h2>

                    {defaultPassword ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }}>Mot de passe défini</p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280'
                                    }}>••••••••••••</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setShowSetPassword(true)}
                                        style={{
                                            padding: '8px',
                                            color: '#3b82f6',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Modifier"
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Edit2 style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    <button
                                        onClick={handleRemoveDefaultPassword}
                                        style={{
                                            padding: '8px',
                                            color: '#dc2626',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Supprimer"
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Trash2 style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </div>
                            </div>

                            {expiryDate && (
                                <div style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    ...getExpiryWarningColor()
                                }}>
                                    {getExpiryIcon()}
                                    <div>
                                        <p style={{ fontWeight: '500' }}>
                                            Expire dans {formatTimeRemaining(daysRemaining)}
                                        </p>
                                        <p style={{
                                            fontSize: '14px',
                                            opacity: 0.75
                                        }}>
                                            Date d'expiration: {new Date(expiryDate).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '32px 0'
                        }}>
                            <Key style={{
                                width: '48px',
                                height: '48px',
                                color: '#9ca3af',
                                margin: '0 auto 12px'
                            }} />
                            <p style={{
                                color: '#6b7280',
                                marginBottom: '16px'
                            }}>Aucun mot de passe par défaut défini</p>
                            <button
                                onClick={() => setShowSetPassword(true)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    margin: '0 auto'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                                <Plus style={{ width: '16px', height: '16px' }} />
                                Définir un mot de passe
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '24px'
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '16px'
                    }}>
                        Comment ça fonctionne
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{
                                flexShrink: 0,
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#dbeafe',
                                color: '#3b82f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>1</span>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>Les utilisateurs qui oublient leur mot de passe peuvent utiliser le mot de passe par défaut pour récupérer leur compte</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{
                                flexShrink: 0,
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#dbeafe',
                                color: '#3b82f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>2</span>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>Ils doivent saisir leur nom, email et le mot de passe par défaut</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{
                                flexShrink: 0,
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#dbeafe',
                                color: '#3b82f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>3</span>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>Une fois vérifiés, ils sont redirigés vers une page de réinitialisation</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{
                                flexShrink: 0,
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#dbeafe',
                                color: '#3b82f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>4</span>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>Le mot de passe par défaut expire tous les 3 mois pour la sécurité</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Set Password Modal */}
            {showSetPassword && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    width: '100vw',
                    height: '100vh'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        margin: '16px'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '16px'
                        }}>
                            {defaultPassword ? 'Modifier' : 'Définir'} le Mot de Passe par Défaut
                        </h3>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <Timer style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Statut et Compte à Rebours
                            </h3>
                        </div>

                        <form onSubmit={handleSetDefaultPassword} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Nouveau mot de passe
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '12px 16px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="Saisissez le mot de passe"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            fontSize: '14px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    >
                                        Générer
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="text"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Confirmez le mot de passe"
                                    required
                                />
                            </div>


                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                paddingTop: '16px'
                            }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'background-color 0.2s',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.target.style.backgroundColor = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) e.target.style.backgroundColor = '#3b82f6';
                                    }}
                                >
                                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSetPassword(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setSelectedUsers([]);
                                        setError('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDefaultPasswordsPage;
