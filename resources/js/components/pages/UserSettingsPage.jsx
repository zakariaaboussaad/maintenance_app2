import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const UserSettingsPage = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPasswordRequest, setShowPasswordRequest] = useState(false);
    
    // Profile form
    const [profileForm, setProfileForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: ''
    });
    
    // Password request form
    const [passwordRequest, setPasswordRequest] = useState({
        currentPassword: '',
        reason: ''
    });
    
    // Notification preferences
    const [notificationPrefs, setNotificationPrefs] = useState({
        ticket_nouveau: true,
        ticket_assigne: true,
        ticket_mis_a_jour: true,
        ticket_ferme: true,
        commentaire_ajoute: true,
        system: true
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await apiService.auth.getCurrentUser();
                setUser(userData);
                setProfileForm({
                    nom: userData.nom || '',
                    prenom: userData.prenom || '',
                    email: userData.email || '',
                    telephone: userData.telephone || ''
                });
                
                // Fetch notification preferences
                const preferences = await apiService.notification.getPreferences();
                setNotificationPrefs(preferences);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Erreur lors du chargement des données utilisateur');
            }
        };
        
        fetchUserData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.auth.updateProfile(profileForm);
            setMessage('Profil mis à jour avec succès');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Erreur lors de la mise à jour du profil');
            setTimeout(() => setMessage(''), 3000);
        }
        setLoading(false);
    };

    const handlePasswordRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.auth.requestPasswordChange(passwordRequest);
            setMessage('Demande de changement de mot de passe envoyée à l\'administrateur');
            setShowPasswordRequest(false);
            setPasswordRequest({ currentPassword: '', reason: '' });
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage('Erreur lors de l\'envoi de la demande');
            setTimeout(() => setMessage(''), 3000);
        }
        setLoading(false);
    };

    const handleNotificationPrefsUpdate = async () => {
        setLoading(true);
        try {
            await apiService.notification.updatePreferences(notificationPrefs);
            setMessage('Préférences de notification sauvegardées');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Erreur lors de la sauvegarde des préférences');
            setTimeout(() => setMessage(''), 3000);
        }
        setLoading(false);
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: '👤' },
        { id: 'password', label: 'Mot de passe', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'appearance', label: 'Apparence', icon: '🎨' }
    ];

    const notificationTypes = [
        { key: 'ticket_nouveau', label: 'Nouveaux tickets', description: 'Être notifié des nouveaux tickets créés' },
        { key: 'ticket_assigne', label: 'Tickets assignés', description: 'Être notifié quand un ticket vous est assigné' },
        { key: 'ticket_mis_a_jour', label: 'Mises à jour des tickets', description: 'Être notifié des changements sur vos tickets' },
        { key: 'ticket_ferme', label: 'Tickets fermés', description: 'Être notifié quand vos tickets sont fermés' },
        { key: 'commentaire_ajoute', label: 'Nouveaux commentaires', description: 'Être notifié des commentaires sur vos tickets' },
        { key: 'system', label: 'Notifications système', description: 'Recevoir les notifications importantes du système' }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Paramètres
                </h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    Gérez vos préférences et informations personnelles
                </p>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    backgroundColor: message.includes('Erreur') ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${message.includes('Erreur') ? '#fecaca' : '#bbf7d0'}`,
                    color: message.includes('Erreur') ? '#dc2626' : '#16a34a'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                {/* Sidebar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    height: 'fit-content',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <nav>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                                    color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab.id ? '600' : '400',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
                                Informations personnelles
                            </h2>
                            <form onSubmit={handleProfileUpdate}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.nom}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, nom: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.prenom}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, prenom: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileForm.telephone}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, telephone: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
                                Changement de mot de passe
                            </h2>
                            
                            {!showPasswordRequest ? (
                                <div>
                                    <div style={{
                                        backgroundColor: '#fef3c7',
                                        border: '1px solid #f59e0b',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '18px' }}>⚠️</span>
                                            <span style={{ fontWeight: '600', color: '#92400e' }}>Approbation requise</span>
                                        </div>
                                        <p style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
                                            Pour des raisons de sécurité, tout changement de mot de passe doit être approuvé par un administrateur. 
                                            Votre demande sera examinée et vous recevrez une notification avec votre nouveau mot de passe.
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowPasswordRequest(true)}
                                        style={{
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Envoyer une demande de changement
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordRequest}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordRequest.currentPassword}
                                            onChange={(e) => setPasswordRequest(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                            Raison du changement
                                        </label>
                                        <textarea
                                            value={passwordRequest.reason}
                                            onChange={(e) => setPasswordRequest(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Expliquez brièvement pourquoi vous souhaitez changer votre mot de passe..."
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                opacity: loading ? 0.7 : 1
                                            }}
                                        >
                                            {loading ? 'Envoi...' : 'Envoyer la demande'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordRequest(false)}
                                            style={{
                                                backgroundColor: '#6b7280',
                                                color: 'white',
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Paramètres de notification
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Gérez vos préférences de notification
                            </p>
                            
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                                    Types de notifications
                                </h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {notificationTypes.map(type => (
                                        <div key={type.key} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                                                    {type.label}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                    {type.description}
                                                </div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPrefs[type.key]}
                                                    onChange={(e) => setNotificationPrefs(prev => ({
                                                        ...prev,
                                                        [type.key]: e.target.checked
                                                    }))}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <span style={{
                                                    width: '44px',
                                                    height: '24px',
                                                    backgroundColor: notificationPrefs[type.key] ? '#3b82f6' : '#d1d5db',
                                                    borderRadius: '12px',
                                                    position: 'relative',
                                                    transition: 'background-color 0.2s'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        left: notificationPrefs[type.key] ? '22px' : '2px',
                                                        width: '20px',
                                                        height: '20px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '50%',
                                                        transition: 'left 0.2s'
                                                    }} />
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <button
                                onClick={handleNotificationPrefsUpdate}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                            </button>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Apparence
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Personnalisez l'apparence de l'application
                            </p>
                            
                            <div style={{
                                padding: '24px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🎨</span>
                                <p>Les options d'apparence seront disponibles prochainement</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;
