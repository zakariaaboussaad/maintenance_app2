// components/dashboards/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
// Check these imports
import { equipmentService, ticketService } from '../../services/apiService';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import StatCard from '../common/StatCard';
import TicketsPage from '../pages/TicketsPage';
import UserSettingsPage from '../pages/UserSettingsPage';

const UserDashboard = ({ onLogout, user }) => {
    const [equipements, setEquipements] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeMenuItem, setActiveMenuItem] = useState('home');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        fetchEquipements();
    }, []);

    useEffect(() => {
        const currentUserId = user?.id_user ?? user?.id;
        if (activeMenuItem === 'tickets' && currentUserId) {
            fetchTickets();
        }
    }, [activeMenuItem, user?.id, user?.id_user]);

    const fetchEquipements = async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupérer seulement les équipements assignés à l'utilisateur connecté
            const currentUserId = user?.id_user ?? user?.id;
            const result = await equipmentService.getUserEquipements(currentUserId);
            setEquipements(result.data);
            setCurrentIndex(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            setTicketsLoading(true);
            const currentUserId = user?.id_user ?? user?.id;
            const result = await ticketService.getUserTickets(currentUserId);
            setTickets(result.data);
        } catch (err) {
            console.error('Erreur lors du chargement des tickets:', err);
            setTickets([]); // Set empty array if API fails
        } finally {
            setTicketsLoading(false);
        }
    };

    const nextEquipment = () => {
        if (equipements.length > 0) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % equipements.length);
        }
    };

    const previousEquipment = () => {
        if (equipements.length > 0) {
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? equipements.length - 1 : prevIndex - 1
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';

        try {
            const date = new Date(dateString);
            const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
            return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        } catch (error) {
            return 'Date invalide';
        }
    };

    const getActiveCount = () => equipements.filter(eq => eq.status === 'Actif').length;
    const getMaintenanceCount = () => equipements.filter(eq => eq.status === 'En maintenance').length;
    const getInactiveCount = () => equipements.filter(eq => eq.status === 'Hors service').length;

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{fontSize: '18px', color: '#64748b'}}>Chargement des équipements...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#f8fafc',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    padding: '24px',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px'}}>
                        Erreur de chargement
                    </div>
                    <div style={{marginBottom: '16px', fontSize: '14px', lineHeight: '1.5'}}>
                        {error}
                    </div>
                    <button
                        onClick={fetchEquipements}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const currentEquipment = equipements[currentIndex];

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
            <div style={{display: 'flex'}}>
                <Sidebar
                    activeMenuItem={activeMenuItem}
                    setActiveMenuItem={setActiveMenuItem}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    onLogout={onLogout}
                />

                {/* Main Content */}
                <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
                    <Header user={user} />

                    {/* Page Content */}
                    <main style={{padding: '40px', flex: '1', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                        {activeMenuItem === 'home' && (
                            <>
                                <div style={{marginBottom: '40px'}}>
                                    <h1 style={{fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px'}}>
                                        Bonjour {user?.name || user?.prenom} ! 👋
                                    </h1>
                                    <p style={{fontSize: '16px', color: '#64748b'}}>
                                        Voici un aperçu de vos équipements aujourd'hui
                                    </p>
                                </div>

                                {/* Stats Cards */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                    gap: '28px',
                                    marginBottom: '40px'
                                }}>
                                    <StatCard
                                        title="Total Équipements"
                                        value={equipements.length}
                                        Icon={Wrench}
                                        bgColor="#fef3c7"
                                        iconColor="#f59e0b"
                                    />
                                    <StatCard
                                        title="Équipements Actifs"
                                        value={getActiveCount()}
                                        Icon={CheckCircle}
                                        bgColor="#d1fae5"
                                        iconColor="#10b981"
                                    />
                                    <StatCard
                                        title="En Maintenance"
                                        value={getMaintenanceCount()}
                                        Icon={AlertTriangle}
                                        bgColor="#fed7aa"
                                        iconColor="#f97316"
                                    />
                                </div>

                                {/* Equipment Section */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                                    overflow: 'hidden',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{
                                        padding: '32px',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <h2 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b'}}>
                                            Vos équipements
                                        </h2>
                                        {equipements.length > 0 && (
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#64748b',
                                                backgroundColor: '#f8fafc',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {currentIndex + 1} sur {equipements.length}
                                            </div>
                                        )}
                                    </div>

                                    {equipements.length === 0 ? (
                                        <div style={{
                                            padding: '80px 32px',
                                            textAlign: 'center',
                                            color: '#64748b'
                                        }}>
                                            <Wrench size={64} style={{color: '#d1d5db', margin: '0 auto'}} />
                                            <div style={{marginTop: '24px', fontSize: '18px', fontWeight: '600', color: '#374151'}}>
                                                Aucun équipement trouvé
                                            </div>
                                            <div style={{marginTop: '8px', fontSize: '14px'}}>
                                                Commencez par ajouter vos premiers équipements
                                            </div>
                                        </div>
                                    ) : currentEquipment && (
                                        <div style={{position: 'relative'}}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                color: 'white',
                                                padding: '40px',
                                                margin: '24px',
                                                borderRadius: '20px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <div style={{position: 'relative', zIndex: '10'}}>
                                                    <div style={{fontSize: '15px', opacity: '0.9', marginBottom: '12px', fontWeight: '500'}}>
                                                        Installé le {formatDate(currentEquipment.date_installation)}
                                                    </div>
                                                    <div style={{fontSize: '28px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2'}}>
                                                        {currentEquipment.type_equipement?.nom_type || 'Équipement'} - {currentEquipment.modele || 'Modèle inconnu'}
                                                    </div>
                                                    <div style={{fontSize: '16px', opacity: '0.9', marginBottom: '16px'}}>
                                                        Marque: {currentEquipment.marque || 'Non spécifiée'}
                                                    </div>
                                                    <div style={{fontSize: '16px', opacity: '0.9', marginBottom: '16px'}}>
                                                        Numéro de série: {currentEquipment.numero_serie || 'Non spécifié'}
                                                    </div>
                                                    <div style={{fontSize: '16px', opacity: '0.9', marginBottom: '16px'}}>
                                                        Localisation: {currentEquipment.localisation || 'Non spécifiée'}
                                                    </div>
                                                    {currentEquipment.os && (
                                                        <div style={{fontSize: '16px', opacity: '0.9', marginBottom: '20px'}}>
                                                            Système: {currentEquipment.os}
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        padding: '8px 16px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                        borderRadius: '8px',
                                                        display: 'inline-block',
                                                        backdropFilter: 'blur(10px)'
                                                    }}>
                                                        Status: {currentEquipment.status || 'Non défini'}
                                                    </div>
                                                </div>

                                                {/* Navigation Arrows */}
                                                {equipements.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={previousEquipment}
                                                            style={{
                                                                position: 'absolute',
                                                                left: '24px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                width: '48px',
                                                                height: '48px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                transition: 'all 0.3s ease',
                                                                backdropFilter: 'blur(10px)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                                                e.target.style.transform = 'translateY(-50%) scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                                                e.target.style.transform = 'translateY(-50%) scale(1)';
                                                            }}
                                                        >
                                                            <ChevronLeft size={20} style={{color: 'white'}} />
                                                        </button>
                                                        <button
                                                            onClick={nextEquipment}
                                                            style={{
                                                                position: 'absolute',
                                                                right: '24px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                width: '48px',
                                                                height: '48px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                transition: 'all 0.3s ease',
                                                                backdropFilter: 'blur(10px)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                                                e.target.style.transform = 'translateY(-50%) scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                                                e.target.style.transform = 'translateY(-50%) scale(1)';
                                                            }}
                                                        >
                                                            <ChevronRight size={20} style={{color: 'white'}} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeMenuItem === 'tickets' && (
                            <TicketsPage
                                tickets={tickets}
                                loading={ticketsLoading}
                                onRefresh={fetchTickets}
                                user={user}
                            />
                        )}

                        {activeMenuItem === 'settings' && (
                            <UserSettingsPage user={user} />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
