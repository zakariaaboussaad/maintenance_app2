// components/RoleBasedRouter.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminDashboard from './dashboards/AdminDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';
import UserDashboard from './dashboards/UserDashboard';
import { authService } from '../services/apiService';

const RoleBasedRouter = ({ user, onLogout, mustChangePassword, onPasswordChanged }) => {
    const handleLogout = () => {
        authService.logout();
        onLogout();
    };

    switch (user?.role_id) {
        case 1: // Admin
            return <AdminDashboard user={user} onLogout={handleLogout} mustChangePassword={mustChangePassword} onPasswordChanged={onPasswordChanged} />;
        case 2: // Technicien
            return <TechnicianDashboard user={user} onLogout={handleLogout} mustChangePassword={mustChangePassword} onPasswordChanged={onPasswordChanged} />;
        case 3: // Utilisateur
            return <UserDashboard user={user} onLogout={handleLogout} mustChangePassword={mustChangePassword} onPasswordChanged={onPasswordChanged} />;
        default:
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                    }}>
                        <AlertTriangle size={64} style={{color: '#f59e0b', margin: '0 auto 20px'}} />
                        <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px'}}>
                            Rôle non reconnu
                        </h2>
                        <p style={{color: '#64748b', marginBottom: '24px'}}>
                            Votre rôle (role_id: {user?.role_id}) n'est pas configuré dans le système.
                        </p>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Se déconnecter
                        </button>
                    </div>
                </div>
            );
    }
};

export default RoleBasedRouter;
