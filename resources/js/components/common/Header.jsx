// components/common/Header.jsx
import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ user }) => {
    return (
        <header style={{
            backgroundColor: 'white',
            padding: '20px 32px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 16px',
                width: '400px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
            }}>
                <Search size={18} style={{color: '#9ca3af'}} />
                <input
                    type="text"
                    placeholder="Rechercher un équipement..."
                    style={{
                        border: 'none',
                        background: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        color: '#374151',
                        width: '100%',
                        marginLeft: '12px',
                        fontWeight: '500'
                    }}
                />
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{position: 'relative', cursor: 'pointer', padding: '8px'}}>
                    <Bell size={24} style={{color: '#6b7280'}} />
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}></div>
                </div>

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
                        <div style={{fontSize: '15px', fontWeight: '600', color: '#1e293b'}}>
                            {user?.name || `${user?.prenom} ${user?.nom}`}
                        </div>
                        <div style={{fontSize: '13px', color: '#64748b'}}>
                            Utilisateur (role_id: {user?.role_id})
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
