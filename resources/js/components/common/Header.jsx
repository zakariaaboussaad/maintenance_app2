import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, Clock, CheckCircle, AlertCircle, User, Ticket, Wrench, Calendar, RefreshCw } from 'lucide-react';
import { authService } from '../../services/apiService';
import PasswordExpiryTimer from '../pages/PasswordExpiryTimer';

const Header = ({ user, darkTheme = false, onAuthError = null }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const notificationRef = useRef(null);
    const bellRef = useRef(null);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        console.log('📡 Fetching notifications...');
        setLoading(true);
        setError(null);

        try {
            if (!user?.id) {
                console.warn('⚠️ No user ID found');
                setError('Utilisateur non connecté');
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            console.log('📡 Making request to /api/notifications for user:', user.id);

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch(`/api/notifications?user_id=${user.id}`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔒 Authentication required - skipping notifications');
                    setNotifications([]);
                    setUnreadCount(0);
                    return;
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('📡 Notifications data:', data);
            
            if (data.success && Array.isArray(data.data)) {
                console.log('📋 Detailed notifications breakdown:');
                data.data.forEach((notif, index) => {
                    console.log(`  ${index + 1}. Type: ${notif.type} | Read: ${notif.lu ? 'Yes' : 'No'} | Title: ${notif.titre}`);
                });
                
                setNotifications(data.data);
                const unread = data.data.filter(n => !n.lu).length;
                setUnreadCount(unread);
                setRetryCount(0);
                console.log(`✅ Loaded ${data.data.length} notifications (${unread} unread)`);
            } else {
                console.warn('⚠️ Invalid notification data format:', data);
                setNotifications([]);
                setUnreadCount(0);
            }

        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            setError(error.message);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced retry mechanism
    const retryFetch = async () => {
        if (retryCount < 3) {
            console.log(`🔄 Retry attempt ${retryCount + 1}/3`);
            setRetryCount(prev => prev + 1);
            await fetchNotifications();
        } else {
            console.log('❌ Maximum retry attempts reached');
        }
    };

    // Fetch notifications on component mount and setup polling
    useEffect(() => {
        console.log('🔧 Header useEffect triggered, user:', user);

        if (!user?.id) {
            console.warn('⚠️ Missing user, skipping notification fetch');
            setError('Utilisateur non connecté');
            return;
        }

        // Initial fetch
        fetchNotifications();

        // Set up polling for real-time updates every 10 seconds
        const interval = setInterval(() => {
            if (user?.id) {
                console.log('🔄 Polling notifications...');
                fetchNotifications();
            } else {
                console.log('⏹️ Stopping polling - no user');
                clearInterval(interval);
            }
        }, 10000);

        // Also refresh when tab becomes visible again
        const handleVisibilityChange = () => {
            if (!document.hidden && user?.id) {
                console.log('🔄 Tab became visible - refreshing notifications');
                fetchNotifications();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            console.log('🧹 Cleaning up notification polling');
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.id]); // Only depend on user ID

    // Close notification panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current &&
                !notificationRef.current.contains(event.target) &&
                !bellRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Get appropriate icon based on notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'ticket_nouveau':
            case 'ticket_assigne':
            case 'ticket_mis_a_jour':
            case 'ticket_ferme':
                return <Ticket size={16} />;
            case 'commentaire_ajoute':
                return <User size={16} />;
            case 'panne_signale':
            case 'panne_resolue':
                return <AlertCircle size={16} />;
            case 'intervention_planifiee':
            case 'intervention_terminee':
                return <Wrench size={16} />;
            case 'maintenance_due':
            case 'maintenance_terminee':
                return <Calendar size={16} />;
            case 'equipement_expire':
                return <Clock size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    // Get appropriate color based on notification type
    const getIconColor = (type, read) => {
        if (read) return '#9ca3af';

        switch (type) {
            case 'ticket_nouveau':
            case 'ticket_assigne':
                return '#3b82f6';
            case 'ticket_ferme':
                return '#10b981';
            case 'panne_signale':
            case 'equipement_expire':
                return '#ef4444';
            case 'panne_resolue':
            case 'intervention_terminee':
            case 'maintenance_terminee':
                return '#10b981';
            case 'intervention_planifiee':
            case 'maintenance_due':
                return '#f59e0b';
            case 'commentaire_ajoute':
                return '#8b5cf6';
            default:
                return '#6b7280';
        }
    };

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            if (!user?.id) {
                setError('Utilisateur non connecté');
                return;
            }

            console.log('📝 Marking notification as read:', id);

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            console.log('📝 Mark as read response:', response.status, response.statusText);

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id_notification === id ? { ...notif, lu: true } : notif
                    )
                );
                // Decrease unread count
                setUnreadCount(prev => Math.max(0, prev - 1));
                console.log('✅ Notification marked as read');
            } else if (response.status === 401) {
                if (onAuthError) onAuthError();
                setError('Session expirée. Veuillez vous reconnecter.');
            } else {
                const errorData = await response.text();
                console.error('❌ Mark as read failed:', response.status, errorData);
                setError(`Erreur lors de la mise à jour: ${response.status}`);
            }
        } catch (err) {
            console.error('❌ Error marking notification as read:', err);
            setError('Erreur de connexion');
        }
    };

    // Delete individual notification
    const deleteNotification = async (id, event) => {
        event.stopPropagation(); // Prevent marking as read when deleting
        
        try {
            if (!user?.id) {
                setError('Utilisateur non connecté');
                return;
            }

            console.log('🗑️ Deleting notification:', id);

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            console.log('🗑️ Delete response:', response.status, response.statusText);

            if (response.ok) {
                // Remove from local state
                setNotifications(prev => prev.filter(notif => 
                    (notif.id_notification || notif.id) !== id
                ));
                // Decrease unread count if notification was unread
                const notification = notifications.find(n => (n.id_notification || n.id) === id);
                if (notification && !notification.lu) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                console.log('✅ Notification deleted');
            } else if (response.status === 401) {
                if (onAuthError) onAuthError();
                setError('Session expirée. Veuillez vous reconnecter.');
            } else {
                const errorData = await response.text();
                console.error('❌ Delete failed:', response.status, errorData);
                setError(`Erreur lors de la suppression: ${response.status}`);
            }
        } catch (err) {
            console.error('❌ Error deleting notification:', err);
            setError('Erreur de connexion');
        }
    };

    // Clear all notifications
    const clearAllNotifications = async () => {
        try {
            if (!user?.id) {
                setError('Utilisateur non connecté');
                return;
            }

            console.log('🗑️ Clearing all notifications');

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch('/api/notifications/clear-all', {
                method: 'DELETE',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            if (response.ok) {
                // Clear local state
                setNotifications([]);
                setUnreadCount(0);
                console.log('✅ All notifications cleared');
            } else if (response.status === 401) {
                if (onAuthError) onAuthError();
                setError('Session expirée. Veuillez vous reconnecter.');
            } else {
                const errorData = await response.text();
                console.error('❌ Clear all failed:', response.status, errorData);
                setError(`Erreur lors de la suppression: ${response.status}`);
            }
        } catch (err) {
            console.error('❌ Error clearing all notifications:', err);
            setError('Erreur de connexion');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            if (!user?.id) {
                setError('Utilisateur non connecté');
                return;
            }

            const token = authService.getToken();
            if (!token) {
                setError('Session expirée. Veuillez vous reconnecter.');
                if (onAuthError) onAuthError();
                return;
            }

            console.log('📝 Marking all notifications as read');

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, lu: true }))
                );
                setUnreadCount(0);
                console.log('✅ All notifications marked as read');
                
                // Force refresh notifications from server to ensure consistency
                setTimeout(() => {
                    fetchNotifications();
                }, 500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Mark all as read failed:', response.status, errorData);
                setError(`Erreur: ${errorData.message || 'Impossible de marquer comme lu'}`);
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Format time since notification
    const formatTimeSince = (dateCreation) => {
        const now = new Date();
        const notifDate = new Date(dateCreation);
        const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}j`;

        return notifDate.toLocaleDateString('fr-FR');
    };

    return (
        <>
            <header style={{
                backgroundColor: darkTheme ? '#1f2937' : 'white',
                padding: '16px 32px',
                borderBottom: `1px solid ${darkTheme ? '#374151' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: darkTheme ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                position: 'sticky',
                top: 0,
                zIndex: 999,
                height: '64px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: darkTheme ? '#374151' : '#f8fafc',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    width: '400px',
                    border: `1px solid ${darkTheme ? '#4b5563' : '#e2e8f0'}`,
                    transition: 'all 0.2s'
                }}>
                    <Search size={18} style={{color: darkTheme ? '#d1d5db' : '#9ca3af'}} />
                    <input
                        type="text"
                        placeholder="Rechercher un équipement..."
                        style={{
                            border: 'none',
                            background: 'none',
                            outline: 'none',
                            fontSize: '15px',
                            color: darkTheme ? '#ffffff' : '#374151',
                            width: '100%',
                            marginLeft: '12px',
                            fontWeight: '500'
                        }}
                    />
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    {/* Password Expiry Timer */}
                    <PasswordExpiryTimer user={user} />
                    
                    {/* Notification Bell */}
                    <div style={{ position: 'relative' }}>
                        <button
                            ref={bellRef}
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications && error && retryCount < 3) {
                                    retryFetch();
                                }
                            }}
                            style={{
                                position: 'relative',
                                padding: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: showNotifications
                                    ? (darkTheme ? '#374151' : '#f3f4f6')
                                    : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (!showNotifications) {
                                    e.target.style.backgroundColor = darkTheme ? '#374151' : '#f3f4f6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showNotifications) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <Bell
                                size={20}
                                style={{
                                    color: darkTheme ? '#d1d5db' : '#6b7280'
                                }}
                            />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px solid ${darkTheme ? '#1f2937' : 'white'}`
                                }}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* User Info */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '16px',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}>
                            {(user?.name || `${user?.prenom} ${user?.nom}`)?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: darkTheme ? '#ffffff' : '#1e293b'
                            }}>
                                {user?.name || `${user?.prenom} ${user?.nom}`}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: darkTheme ? '#9ca3af' : '#64748b'
                            }}>
                                Utilisateur (role_id: {user?.role_id})
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div
                    ref={notificationRef}
                    style={{
                        position: 'fixed',
                        top: '90px',
                        right: '32px',
                        width: '400px',
                        backgroundColor: darkTheme ? '#1f2937' : 'white',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${darkTheme ? '#374151' : '#e5e7eb'}`,
                        zIndex: 2000,
                        maxHeight: '500px',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: `1px solid ${darkTheme ? '#374151' : '#f3f4f6'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: darkTheme ? '#ffffff' : '#111827',
                                margin: 0
                            }}>
                                Notifications
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: darkTheme ? '#9ca3af' : '#6b7280',
                                margin: '4px 0 0 0'
                            }}>
                                {loading ? 'Chargement...' :
                                 error ? 'Erreur de chargement' :
                                 unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Refresh button */}
                            <button
                                onClick={retryFetch}
                                disabled={loading || retryCount >= 3}
                                style={{
                                    fontSize: '12px',
                                    color: (loading || retryCount >= 3) ? '#9ca3af' : '#3b82f6',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: (loading || retryCount >= 3) ? 'default' : 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={retryCount >= 3 ? 'Limite atteinte' : 'Actualiser'}
                            >
                                <RefreshCw size={14} style={{
                                    animation: loading ? 'spin 1s linear infinite' : 'none'
                                }} />
                            </button>

                            {!loading && !error && unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        fontSize: '12px',
                                        color: '#3b82f6',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = darkTheme ? '#374151' : '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                           
                            <button
                                onClick={() => setShowNotifications(false)}
                                style={{
                                    padding: '4px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = darkTheme ? '#374151' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                <X size={18} style={{ color: darkTheme ? '#9ca3af' : '#6b7280' }} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {loading ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: darkTheme ? '#9ca3af' : '#6b7280'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    border: '2px solid #e5e7eb',
                                    borderTop: '2px solid #3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 12px'
                                }}></div>
                                <p style={{ fontSize: '14px', margin: 0 }}>
                                    Chargement des notifications...
                                </p>
                            </div>
                        ) : error ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: darkTheme ? '#ef4444' : '#dc2626'
                            }}>
                                <AlertCircle size={48} style={{
                                    color: darkTheme ? '#ef4444' : '#dc2626',
                                    marginBottom: '12px'
                                }} />
                                <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
                                    Erreur de chargement
                                </p>
                                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                                    {error}
                                </p>
                                {retryCount < 3 && (
                                    <button
                                        onClick={retryFetch}
                                        style={{
                                            fontSize: '14px',
                                            color: '#3b82f6',
                                            backgroundColor: 'transparent',
                                            border: `1px solid #3b82f6`,
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Réessayer ({retryCount}/3)
                                    </button>
                                )}
                                {retryCount >= 3 && (
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                                        Limite de tentatives atteinte. Veuillez actualiser la page.
                                    </p>
                                )}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: darkTheme ? '#9ca3af' : '#6b7280'
                            }}>
                                <Bell size={48} style={{
                                    color: darkTheme ? '#4b5563' : '#d1d5db',
                                    marginBottom: '12px'
                                }} />
                                <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
                                    Aucune notification
                                </p>
                                <p style={{ fontSize: '14px', margin: 0 }}>
                                    Vous êtes à jour !
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id_notification || notification.id}
                                    onClick={() => markAsRead(notification.id_notification || notification.id)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: `1px solid ${darkTheme ? '#374151' : '#f3f4f6'}`,
                                        cursor: 'pointer',
                                        backgroundColor: notification.lu
                                            ? 'transparent'
                                            : (darkTheme ? '#1e40af10' : '#eff6ff'),
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = darkTheme ? '#374151' : '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = notification.lu
                                            ? 'transparent'
                                            : (darkTheme ? '#1e40af10' : '#eff6ff');
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: `${getIconColor(notification.type, notification.lu)}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: getIconColor(notification.type, notification.lu),
                                        flexShrink: 0
                                    }}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: notification.lu ? '500' : '600',
                                            color: darkTheme ? '#ffffff' : '#111827',
                                            marginBottom: '4px'
                                        }}>
                                            {notification.titre}
                                        </div>
                                        <p style={{
                                            fontSize: '13px',
                                            color: darkTheme ? '#d1d5db' : '#4b5563',
                                            margin: '0 0 8px 0',
                                            lineHeight: '1.4'
                                        }}>
                                            {notification.message}
                                        </p>
                                        <div style={{
                                            fontSize: '12px',
                                            color: darkTheme ? '#9ca3af' : '#6b7280',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>{formatTimeSince(notification.date_creation)}</span>
                                            {!notification.lu && (
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#3b82f6'
                                                }} />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteNotification(notification.id_notification || notification.id, e)}
                                        style={{
                                            padding: '4px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: '0.6',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0,
                                            marginLeft: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = darkTheme ? '#374151' : '#f3f4f6';
                                            e.target.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.opacity = '0.6';
                                        }}
                                        title="Supprimer cette notification"
                                    >
                                        <X size={14} style={{ color: darkTheme ? '#ef4444' : '#dc2626' }} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default Header;
