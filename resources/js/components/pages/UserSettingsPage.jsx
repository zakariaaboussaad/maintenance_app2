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
  UserCheck
} from 'lucide-react';

const UserSettingsPage = ({ user, darkTheme, setDarkTheme }) => {
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && setDarkTheme) {
      setDarkTheme(savedTheme === 'dark');
    }
  }, [setDarkTheme]);
  
  // Local theme state for immediate UI updates
  const [localTheme, setLocalTheme] = useState(darkTheme);
  
  // Update local theme when darkTheme prop changes
  useEffect(() => {
    setLocalTheme(darkTheme);
  }, [darkTheme]);
  
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
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify({
          ...passwordData,
          user_id: user?.id_user || user?.id
        })
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Mot de passe mis à jour avec succès!', 'success');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        showMessage(result.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
      }
    } catch (error) {
      console.error('Password update error:', error);
      showMessage('Erreur lors de la mise à jour du mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = !localTheme;
    setLocalTheme(newTheme); // Immediate UI update
    if (setDarkTheme) {
      setDarkTheme(newTheme); // Parent state update
    }
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    showMessage(`Thème ${newTheme ? 'sombre' : 'clair'} activé`, 'success');
    
    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme ? 'dark' : 'light' } }));
  };

  const handleEmailSettingsUpdate = async () => {
    setLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify(emailSettings)
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Paramètres de notification mis à jour!', 'success');
      } else {
        showMessage('Erreur lors de la mise à jour des préférences', 'error');
      }
    } catch (error) {
      console.error('Notification preferences error:', error);
      showMessage('Erreur lors de la mise à jour des préférences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px' }}>
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
                          style={{ ...inputStyle, paddingRight: '40px' }}
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
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
                          style={{ ...inputStyle, paddingRight: '40px' }}
                          placeholder="Nouveau mot de passe (min. 6 caractères)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
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
                          style={{ ...inputStyle, paddingRight: '40px' }}
                          placeholder="Confirmez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
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

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                      Apparence
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Personnalisez l'apparence de l'interface
                    </p>
                  </div>

                  <div style={{
                    padding: '24px',
                    border: `1px solid ${localTheme ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: localTheme ? '#ffffff' : '#000000' }}>
                        {localTheme ? <Moon size={20} /> : <Sun size={20} />}
                        Thème {localTheme ? 'sombre' : 'clair'}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: localTheme ? '#9ca3af' : '#6b7280'
                      }}>
                        {localTheme ? 'Interface sombre pour réduire la fatigue oculaire' : 'Interface claire et lumineuse'}
                      </p>
                    </div>
                    <button
                      onClick={handleThemeToggle}
                      style={{
                        backgroundColor: localTheme ? '#374151' : '#f3f4f6',
                        color: localTheme ? '#ffffff' : '#000000',
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
                      {localTheme ? <Sun size={16} /> : <Moon size={16} />}
                      Basculer vers le thème {localTheme ? 'clair' : 'sombre'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
