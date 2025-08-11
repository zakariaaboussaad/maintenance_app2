// components/dashboards/AdminDashboard.jsx
import React from 'react';
import { Users, Settings, LogOut, Shield } from 'lucide-react';

const AdminDashboard = ({ onLogout, user }) => {
    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
            <div style={{display: 'flex'}}>
                {/* Sidebar */}
                <nav style={{
                    width: '240px',
                    backgroundColor: '#ffffff',
                    height: '100vh',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{padding: '24px', borderBottom: '1px solid #e2e8f0'}}>
                        <div style={{fontSize: '24px', fontWeight: '800', textAlign: 'center'}}>
                            <span style={{color: '#dc2626'}}>ADMIN</span>
                            <span style={{color: '#374151'}}>-PANEL</span>
                        </div>
                    </div>

                    <div style={{flex: '1', padding: '16px'}}>
                        <div style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', marginBottom: '8px'}}>
                            <Shield size={20} />
                            <span>Administration</span>
                        </div>
                        <div style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280'}}>
                            <Users size={20} />
                            <span>Utilisateurs</span>
                        </div>
                        <div style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280'}}>
                            <Settings size={20} />
                            <span>Paramètres</span>
                        </div>
                    </div>

                    <div style={{padding: '16px', borderTop: '1px solid #e2e8f0'}}>
                        <div
                            onClick={onLogout}
                            style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <LogOut size={20} />
                            <span>Déconnexion</span>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div style={{flex: '1', padding: '40px'}}>
                    <div style={{backgroundColor: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'}}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#dc2626',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <Shield size={40} style={{color: 'white'}} />
                        </div>
                        <h1 style={{fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '16px'}}>
                            Panneau d'Administration
                        </h1>
                        <p style={{fontSize: '18px', color: '#64748b', marginBottom: '24px'}}>
                            Bienvenue {user?.name || `${user?.prenom} ${user?.nom}`}
                        </p>
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fca5a5',
                            padding: '16px',
                            borderRadius: '8px',
                            color: '#b91c1c'
                        }}>
                            <strong>Rôle:</strong> Administrateur (role_id: {user?.role_id})<br/>
                            <strong>Email:</strong> {user?.email}<br/>
                            <strong>ID:</strong> {user?.id}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
