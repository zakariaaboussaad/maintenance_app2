// components/dashboards/AdminDashboard.jsx
import React, { useState } from 'react';
import { Home, Users, ClipboardList, LogOut } from 'lucide-react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import AdminTicketsPage from '../pages/AdminTicketsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminEquipmentsPage from '../pages/AdminEquipmentsPage';
import TechnicianMyTicketsPage from '../pages/TechnicianMyTicketsPage';

const AdminDashboard = ({ onLogout, user }) => {
    const [activeMenuItem, setActiveMenuItem] = useState('tickets');
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
                    userRole="admin"
                />

                <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
                    <Header user={user} />

                    <main style={{padding: '40px', flex: 1}}>
                        {activeMenuItem === 'home' && (
                            <div style={{backgroundColor: 'white', borderRadius: 20, padding: 40, boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
                                <h1 style={{fontSize: 28, fontWeight: 800, margin: 0}}>Panneau d'administration</h1>
                                <p style={{color: '#64748b'}}>Bienvenue {user?.name || `${user?.prenom} ${user?.nom}`}</p>
                            </div>
                        )}

                        {activeMenuItem === 'tickets' && (
                            <AdminTicketsPage user={user} />
                        )}

                        {activeMenuItem === 'my-tickets' && (
                            <TechnicianMyTicketsPage user={user} />
                        )}

                        {activeMenuItem === 'users' && (
                            <AdminUsersPage />
                        )}

                        {activeMenuItem === 'equipements' && (
                            <AdminEquipmentsPage />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
