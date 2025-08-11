// components/dashboards/TechnicianDashboard.jsx
import React, { useState } from 'react';
import { Wrench, CheckCircle, Monitor, LogOut, Home, Settings } from 'lucide-react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import TechnicianTicketsPage from '../pages/TechnicianTicketsPage';
import TechnicianMyTicketsPage from '../pages/TechnicianMyTicketsPage';

const TechnicianDashboard = ({ onLogout, user }) => {
    const [activeMenuItem, setActiveMenuItem] = useState('home');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
            <div style={{display: 'flex'}}>
                <Sidebar
                    activeMenuItem={activeMenuItem}
                    setActiveMenuItem={setActiveMenuItem}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    onLogout={onLogout}
                    userRole="technician"
                />

                {/* Main Content */}
                <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
                    <Header user={user} />

                    {/* Page Content */}
                    <main style={{padding: '40px', flex: '1', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                        {activeMenuItem === 'home' && (
                            <div style={{backgroundColor: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'}}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundColor: '#f59e0b',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px'
                                }}>
                                    <Wrench size={40} style={{color: 'white'}} />
                                </div>
                                <h1 style={{fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>
                                    Espace Technicien
                                </h1>
                                <p style={{fontSize: '18px', color: '#64748b', marginBottom: '24px'}}>
                                    Bienvenue {user?.name || `${user?.prenom} ${user?.nom}`}
                                </p>
                                <div style={{
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #fbbf24',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    color: '#92400e'
                                }}>
                                    <strong>Rôle:</strong> Technicien de maintenance (role_id: {user?.role_id})<br/>
                                    <strong>Email:</strong> {user?.email}<br/>
                                    <strong>ID:</strong> {user?.id}
                                </div>
                            </div>
                        )}

                        {activeMenuItem === 'tickets' && (
                            <TechnicianTicketsPage user={user} />
                        )}

                        {activeMenuItem === 'my-tickets' && (
                            <TechnicianMyTicketsPage user={user} />
                        )}

                        {activeMenuItem === 'equipements' && (
                            <div style={{textAlign: 'center', padding: '60px'}}>
                                <h2 style={{fontSize: '24px', color: '#6b7280'}}>Gestion des Équipements</h2>
                                <p style={{color: '#9ca3af', marginTop: '16px'}}>Cette section est en cours de développement</p>
                            </div>
                        )}

                        {activeMenuItem === 'settings' && (
                            <div style={{textAlign: 'center', padding: '60px'}}>
                                <h2 style={{fontSize: '24px', color: '#6b7280'}}>Paramètres</h2>
                                <p style={{color: '#9ca3af', marginTop: '16px'}}>Cette section est en cours de développement</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
