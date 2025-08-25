import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Wrench,
  UserCheck
} from 'lucide-react';

const TechnicianSettingsPage = ({ user, darkTheme, setDarkTheme }) => {
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
    poste_affecte: user?.poste_affecte || '',
    specialite: user?.specialite || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Technician-specific notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newTicketAssignments: true,
    ticketStatusUpdates: true,
    urgentTickets: true,
    maintenanceReminders: true,
    weeklyReport: false,
    emailNotifications: true,
    smsNotifications: false
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
    setDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    showMessage(`Thème ${newTheme ? 'sombre' : 'clair'} activé`, 'success');
  };

  const handleNotificationSettingsUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      showMessage('Paramètres de notification mis à jour!', 'success');
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: darkTheme ? Moon : Sun }
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${darkTheme ? '#374151' : '#d1d5db'}`,
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
            Paramètres Technicien
          </h1>
          <p style={{ fontSize: '16px', color: darkTheme ? '#d1d5db' : '#64748b' }}>
            Gérez vos préférences et informations techniques
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{
            background: darkTheme ? '#065f46' : '#d1fae5',
            border: `1px solid ${darkTheme ? '#047857' : '#86efac'}`,
            color: darkTheme ? '#d1fae5' : '#065f46',
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
            background: darkTheme ? '#7f1d1d' : '#fee2e2',
            border: `1px solid ${darkTheme ? '#b91c1c' : '#fca5a5'}`,
            color: darkTheme ? '#fee2e2' : '#dc2626',
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
                      Profil Technicien
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Mettez à jour vos informations professionnelles
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

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Spécialité technique
                      </label>
                      <input
                        type="text"
                        value={profileData.specialite}
                        onChange={(e) => setProfileData({...profileData, specialite: e.target.value})}
                        style={inputStyle}
                        placeholder="Ex: Maintenance informatique, Électricité, Mécanique..."
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
                      Sécurité du compte
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Maintenez votre compte sécurisé avec un mot de passe fort
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
                      Notifications Technicien
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Configurez vos alertes de maintenance et interventions
                    </p>
                  </div>

                  <div style={{ space: '24px' }}>
                    {[
                      {
                        key: 'newTicketAssignments',
                        label: 'Nouvelles affectations de tickets',
                        description: 'Être notifié quand un ticket vous est assigné'
                      },
                      {
                        key: 'ticketStatusUpdates',
                        label: 'Mises à jour des tickets',
                        description: 'Changements de statut des tickets que vous gérez'
                      },
                      {
                        key: 'urgentTickets',
                        label: 'Tickets urgents',
                        description: 'Alertes pour les interventions prioritaires'
                      },
                      {
                        key: 'maintenanceReminders',
                        label: 'Rappels de maintenance',
                        description: 'Notifications préventives pour les équipements'
                      },
                      {
                        key: 'weeklyReport',
                        label: 'Rapport hebdomadaire',
                        description: 'Résumé de vos interventions de la semaine'
                      },
                      {
                        key: 'emailNotifications',
                        label: 'Notifications email',
                        description: 'Recevoir les alertes par email'
                      },
                      {
                        key: 'smsNotifications',
                        label: 'Notifications SMS',
                        description: 'Recevoir les alertes urgentes par SMS'
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
                            checked={notificationSettings[setting.key]}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
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
                            backgroundColor: notificationSettings[setting.key] ? '#3b82f6' : '#ccc',
                            transition: '0.4s',
                            borderRadius: '34px'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '',
                              height: '26px',
                              width: '26px',
                              left: notificationSettings[setting.key] ? '30px' : '4px',
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
                      onClick={handleNotificationSettingsUpdate}
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
                      Interface & Apparence
                    </h2>
                    <p style={{ color: darkTheme ? '#d1d5db' : '#64748b' }}>
                      Personnalisez votre environnement de travail
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
                            {darkTheme ? 'Interface sombre pour les longues sessions' : 'Interface claire et moderne'}
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
      </div>
    </div>
  );
};

export default TechnicianSettingsPage;
