import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  Key,
  Clock,
  UserX,
  Check,
  X
} from 'lucide-react';
import apiService from '../../services/apiService';

const AdminSettingsPage = ({ user, darkTheme, setDarkTheme }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    matricule: user?.matricule || '',
    numero_telephone: user?.numero_telephone || '',
    poste_affecte: user?.poste_affecte || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    notifications: true,
    ticketUpdates: true,
    systemAlerts: true,
    weeklyReport: false
  });

  // Password requests state
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage('');
    } else {
      setErrorMessage(message);
      setSuccessMessage('');
    }

    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/utilisateurs/${user.id_user || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Profil mis à jour avec succès!', 'success');
      } else {
        showMessage(result.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically verify current password and update
      // For demo purposes, we'll simulate success
      setTimeout(() => {
        showMessage('Mot de passe mis à jour avec succès!', 'success');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      showMessage('Erreur lors de la mise à jour du mot de passe', 'error');
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme); // This will update the parent component's state
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    showMessage(`Thème ${newTheme ? 'sombre' : 'clair'} activé`, 'success');
  };

  const handleEmailSettingsUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      showMessage('Paramètres de notification mis à jour!', 'success');
      setLoading(false);
    }, 1000);
  };

  // Load password requests when component mounts or when password-requests tab is active
  useEffect(() => {
    if (activeTab === 'password-requests') {
      loadPasswordRequests();
    }
  }, [activeTab]);

  const loadPasswordRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.auth.getPasswordRequests();
      setPasswordRequests(response.data);
    } catch (error) {
      console.error('Error loading password requests:', error);
      showMessage('Erreur lors du chargement des demandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!newPassword.trim()) {
      showMessage('Veuillez saisir un nouveau mot de passe', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await apiService.auth.approvePasswordRequest(selectedRequest.id, { new_password: newPassword });
      showMessage('Demande approuvée avec succès', 'success');
      setShowApproveModal(false);
      setNewPassword('');
      setSelectedRequest(null);
      loadPasswordRequests();
    } catch (error) {
      showMessage('Erreur lors de l\'approbation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await apiService.auth.rejectPasswordRequest(selectedRequest.id, { rejection_reason: rejectionReason });
      showMessage('Demande rejetée', 'success');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      loadPasswordRequests();
    } catch (error) {
      showMessage('Erreur lors du rejet', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'password-requests', label: 'Demandes de Mot de Passe', icon: Key },
    { id: 'appearance', label: 'Apparence', icon: darkTheme ? Moon : Sun }
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    backgroundColor: darkTheme ? '#374151' : '#ffffff',
    color: darkTheme ? '#ffffff' : '#000000'
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: darkTheme ? '#111827' : '#f8fafc',
    color: darkTheme ? '#ffffff' : '#000000',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: darkTheme ? '#ffffff' : '#1e293b',
            marginBottom: '8px'
          }}>
            Paramètres
          </h1>
          <p style={{ fontSize: '16px', color: darkTheme ? '#d1d5db' : '#64748b' }}>
            Gérez vos préférences et informations de compte
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #86efac',
            color: '#065f46',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar Navigation */}
          <div style={{ width: '280px' }}>
            <div style={{
              backgroundColor: darkTheme ? '#1f2937' : '#ffffff',
              borderRadius: '16px',
              padding: '8px',
              border: `1px solid ${darkTheme ? '#374151' : '#f1f5f9'}`,
              boxShadow: darkTheme ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      backgroundColor: isActive ? '#3b82f6' : 'transparent',
                      color: isActive ? '#ffffff' : (darkTheme ? '#d1d5db' : '#64748b'),
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '15px',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      marginBottom: '4px'
                    }}
                  >
                    <IconComponent size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: darkTheme ? '#1f2937' : '#ffffff',
              borderRadius: '20px',
              padding: '40px',
              border: `1px solid ${darkTheme ? '#374151' : '#f1f5f9'}`,
              boxShadow: darkTheme ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Informations du profil
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Mettez à jour vos informations personnelles
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                        style={inputStyle}
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                        style={inputStyle}
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        style={inputStyle}
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Matricule
                      </label>
                      <input
                        type="text"
                        value={profileData.matricule}
                        onChange={(e) => setProfileData({...profileData, matricule: e.target.value})}
                        style={inputStyle}
                        placeholder="Votre matricule"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profileData.numero_telephone}
                        onChange={(e) => setProfileData({...profileData, numero_telephone: e.target.value})}
                        style={inputStyle}
                        placeholder="+212 6XX XXX XXX"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Poste affecté
                      </label>
                      <input
                        type="text"
                        value={profileData.poste_affecte}
                        onChange={(e) => setProfileData({...profileData, poste_affecte: e.target.value})}
                        style={inputStyle}
                        placeholder="Votre poste"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 32px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={16} />
                    {loading ? 'Mise à jour...' : 'Sauvegarder'}
                  </button>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Changer le mot de passe
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Assurez-vous que votre mot de passe est sécurisé
                    </p>
                  </div>

                  <div style={{ maxWidth: '400px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Mot de passe actuel *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                          style={{ ...inputStyle, paddingRight: '48px' }}
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: darkTheme ? '#d1d5db' : '#6b7280'
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Nouveau mot de passe *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          style={{ ...inputStyle, paddingRight: '48px' }}
                          placeholder="Nouveau mot de passe (min. 6 caractères)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: darkTheme ? '#d1d5db' : '#6b7280'
                          }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Confirmer le mot de passe *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          style={{ ...inputStyle, paddingRight: '48px' }}
                          placeholder="Confirmez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: darkTheme ? '#d1d5db' : '#6b7280'
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 32px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Lock size={16} />
                      {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Paramètres de notification
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Gérez vos préférences de notification
                    </p>
                  </div>

                  <div style={{ space: '24px' }}>
                    {[
                      {
                        key: 'notifications',
                        label: 'Notifications générales',
                        description: 'Recevoir les notifications importantes du système'
                      },
                      {
                        key: 'ticketUpdates',
                        label: 'Mises à jour des tickets',
                        description: 'Être notifié des changements sur les tickets'
                      },
                      {
                        key: 'systemAlerts',
                        label: 'Alertes système',
                        description: 'Recevoir les alertes critiques du système'
                      },
                      {
                        key: 'weeklyReport',
                        label: 'Rapport hebdomadaire',
                        description: 'Recevoir un résumé hebdomadaire des activités'
                      }
                    ].map((setting, index) => (
                      <div key={setting.key} style={{
                        padding: '20px',
                        border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                            {setting.label}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: darkTheme ? '#9ca3af' : '#6b7280'
                          }}>
                            {setting.description}
                          </p>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                          <input
                            type="checkbox"
                            checked={emailSettings[setting.key]}
                            onChange={(e) => setEmailSettings({
                              ...emailSettings,
                              [setting.key]: e.target.checked
                            })}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: emailSettings[setting.key] ? '#3b82f6' : '#ccc',
                            transition: '0.4s',
                            borderRadius: '34px'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '',
                              height: '26px',
                              width: '26px',
                              left: emailSettings[setting.key] ? '30px' : '4px',
                              bottom: '4px',
                              backgroundColor: 'white',
                              transition: '0.4s',
                              borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={handleEmailSettingsUpdate}
                      disabled={loading}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 32px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '24px'
                      }}
                    >
                      <Save size={16} />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Requests Tab */}
              {activeTab === 'password-requests' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Demandes de Mot de Passe
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Gérez les demandes de changement de mot de passe des utilisateurs
                    </p>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '16px', color: darkTheme ? '#d1d5db' : '#64748b' }}>
                        Chargement des demandes...
                      </div>
                    </div>
                  ) : passwordRequests.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px',
                      border: `1px dashed ${darkTheme ? '#374151' : '#d1d5db'}`,
                      borderRadius: '12px'
                    }}>
                      <Key size={48} style={{ color: darkTheme ? '#6b7280' : '#9ca3af', marginBottom: '16px' }} />
                      <h3 style={{ margin: '0 0 8px 0', color: darkTheme ? '#d1d5db' : '#64748b' }}>
                        Aucune demande en attente
                      </h3>
                      <p style={{ margin: 0, color: darkTheme ? '#9ca3af' : '#6b7280' }}>
                        Les demandes de changement de mot de passe apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: darkTheme ? '#1f2937' : '#ffffff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: darkTheme ? '#374151' : '#f9fafb' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Utilisateur</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Raison</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Statut</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {passwordRequests.map((request) => (
                            <tr key={request.id} style={{ 
                              borderTop: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
                              '&:hover': { backgroundColor: darkTheme ? '#374151' : '#f9fafb' }
                            }}>
                              <td style={{ padding: '16px' }}>
                                <div>
                                  <div style={{ fontWeight: '600' }}>
                                    {request.user?.nom} {request.user?.prenom}
                                  </div>
                                  <div style={{ fontSize: '14px', color: darkTheme ? '#9ca3af' : '#6b7280' }}>
                                    {request.user?.email}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ maxWidth: '200px' }}>
                                  {request.reason || 'Aucune raison fournie'}
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontSize: '14px' }}>
                                  {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                                </div>
                                <div style={{ fontSize: '12px', color: darkTheme ? '#9ca3af' : '#6b7280' }}>
                                  {new Date(request.requested_at).toLocaleTimeString('fr-FR')}
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backgroundColor: request.status === 'pending' ? '#fef3c7' : 
                                                 request.status === 'approved' ? '#d1fae5' : '#fee2e2',
                                  color: request.status === 'pending' ? '#92400e' :
                                         request.status === 'approved' ? '#065f46' : '#dc2626'
                                }}>
                                  {request.status === 'pending' ? 'En attente' :
                                   request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                                </span>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                {request.status === 'pending' && (
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setShowApproveModal(true);
                                      }}
                                      style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Check size={14} />
                                      Approuver
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setShowRejectModal(true);
                                      }}
                                      style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <X size={14} />
                                      Rejeter
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Paramètres d'apparence
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Personnalisez l'apparence de votre interface
                    </p>
                  </div>

                  <div style={{
                    padding: '24px',
                    border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: darkTheme ? '#4b5563' : '#f3f4f6',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {darkTheme ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                            Thème {darkTheme ? 'sombre' : 'clair'}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: darkTheme ? '#9ca3af' : '#6b7280'
                          }}>
                            {darkTheme ? 'Interface sombre pour moins de fatigue oculaire' : 'Interface claire et lumineuse'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleThemeToggle}
                        style={{
                          backgroundColor: darkTheme ? '#374151' : '#f3f4f6',
                          color: darkTheme ? '#ffffff' : '#000000',
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {darkTheme ? <Sun size={16} /> : <Moon size={16} />}
                        Passer au thème {darkTheme ? 'clair' : 'sombre'}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: darkTheme ? '#1f2937' : '#f8fafc',
                    border: `1px solid ${darkTheme ? '#374151' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontWeight: '600' }}>
                      Aperçu du thème actuel
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{
                        width: '60px',
                        height: '40px',
                        backgroundColor: darkTheme ? '#111827' : '#ffffff',
                        border: `1px solid ${darkTheme ? '#374151' : '#d1d5db'}`,
                        borderRadius: '6px'
                      }}></div>
                      <div style={{
                        width: '60px',
                        height: '40px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '6px'
                      }}></div>
                      <div style={{
                        width: '60px',
                        height: '40px',
                        backgroundColor: darkTheme ? '#374151' : '#f3f4f6',
                        borderRadius: '6px'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: darkTheme ? '#1f2937' : '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                Approuver la demande
              </h3>
              <p style={{ margin: '0 0 24px 0', color: darkTheme ? '#d1d5db' : '#64748b' }}>
                Définissez un nouveau mot de passe pour {selectedRequest?.user?.nom} {selectedRequest?.user?.prenom}
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Nouveau mot de passe
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Saisir le nouveau mot de passe"
                    style={{
                      ...inputStyle,
                      flex: 1
                    }}
                  />
                  <button
                    onClick={generatePassword}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: darkTheme ? '#374151' : '#f3f4f6',
                      color: darkTheme ? '#ffffff' : '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Générer
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setNewPassword('');
                    setSelectedRequest(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: darkTheme ? '#d1d5db' : '#64748b',
                    border: `1px solid ${darkTheme ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading || !newPassword.trim()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: actionLoading || !newPassword.trim() ? 'not-allowed' : 'pointer',
                    opacity: actionLoading || !newPassword.trim() ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  {actionLoading ? 'Approbation...' : 'Approuver'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: darkTheme ? '#1f2937' : '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                Rejeter la demande
              </h3>
              <p style={{ margin: '0 0 24px 0', color: darkTheme ? '#d1d5db' : '#64748b' }}>
                Rejeter la demande de {selectedRequest?.user?.nom} {selectedRequest?.user?.prenom}
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Raison du rejet (optionnel)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: darkTheme ? '#d1d5db' : '#64748b',
                    border: `1px solid ${darkTheme ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} />
                  {actionLoading ? 'Rejet...' : 'Rejeter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
