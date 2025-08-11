// components/common/Sidebar.jsx
import React from 'react';
import { Home, Users, Settings, LogOut, Wrench, CheckCircle, Monitor } from 'lucide-react';

const Sidebar = ({ activeMenuItem, setActiveMenuItem, sidebarCollapsed, setSidebarCollapsed, onLogout, userRole = 'user' }) => {
    const getNavItemStyle = (itemName) => {
        const isActive = activeMenuItem === itemName;

        if (sidebarCollapsed) {
            return {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                margin: '4px auto',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
            };
        } else {
            return {
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                height: '50px',
                color: isActive ? '#ffffff' : '#6b7280',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                position: 'relative',
                backgroundColor: isActive ? '#4880FF' : 'transparent',
                borderRadius: isActive ? '6px' : '0',
                margin: isActive ? '0 16px' : '0',
                width: isActive ? 'calc(100% - 32px)' : 'auto'
            };
        }
    };

    const getActiveIndicator = (itemName) => {
        if (activeMenuItem === itemName && !sidebarCollapsed) {
            return (
                <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '4px',
                    height: '50px',
                    backgroundColor: '#4880FF',
                    borderRadius: '0 4px 4px 0'
                }}></div>
            );
        }
        return null;
    };

    const getMenuItems = () => {
        if (userRole === 'technician') {
            return [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'tickets', label: 'Liste des Tickets', icon: CheckCircle },
                { id: 'equipements', label: 'Équipements', icon: Monitor },
                { id: 'my-tickets', label: 'Vos Tickets', icon: Wrench }
            ];
        } else {
            return [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'tickets', label: 'Tickets', icon: Users }
            ];
        }
    };

    const menuItems = getMenuItems();

    return (
        <nav style={{
            width: sidebarCollapsed ? '80px' : '240px',
            backgroundColor: '#ffffff',
            padding: '0',
            height: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            borderRight: '1px solid #e2e8f0',
            overflow: 'hidden'
        }}>
            {/* Logo Section */}
            <div style={{
                padding: sidebarCollapsed ? '24px 16px 40px' : '24px 24px 40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
                {!sidebarCollapsed ? (
                    <div style={{ width: '100%' }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            textAlign: 'center',
                            letterSpacing: '-0.025em'
                        }}>
                            <span style={{color: '#4880FF'}}>ONEE</span>
                            <span style={{color: '#202224'}}>-BE</span>
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            textAlign: 'center',
                            marginTop: '4px'
                        }}>
                            Equipment Dashboard
                        </div>
                    </div>
                ) : (
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#4880FF',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '800'
                    }}>
                        O
                    </div>
                )}
            </div>

            {/* Top Navigation Items */}
            <div style={{flex: '1', paddingTop: sidebarCollapsed ? '8px' : '0'}}>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={item.id} style={{position: 'relative', marginBottom: sidebarCollapsed ? '8px' : '0'}}>
                            {getActiveIndicator(item.id)}
                            <div
                                style={getNavItemStyle(item.id)}
                                onClick={() => setActiveMenuItem(item.id)}
                                title={sidebarCollapsed ? item.label : ''}
                            >
                                <IconComponent
                                    size={20}
                                    style={{color: activeMenuItem === item.id ? (sidebarCollapsed ? '#4880FF' : '#ffffff') : '#6b7280'}}
                                />
                                {!sidebarCollapsed && <span style={{marginLeft: '14px'}}>{item.label}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Navigation */}
            <div style={{paddingBottom: '24px'}}>
                <div style={{position: 'relative', marginBottom: sidebarCollapsed ? '8px' : '0'}}>
                    {getActiveIndicator('settings')}
                    <div
                        style={getNavItemStyle('settings')}
                        onClick={() => setActiveMenuItem('settings')}
                        title={sidebarCollapsed ? 'Settings' : ''}
                    >
                        <Settings
                            size={20}
                            style={{color: activeMenuItem === 'settings' ? (sidebarCollapsed ? '#4880FF' : '#ffffff') : '#6b7280'}}
                        />
                        {!sidebarCollapsed && <span style={{marginLeft: '14px'}}>Settings</span>}
                    </div>
                </div>

                <div style={{position: 'relative', marginBottom: sidebarCollapsed ? '8px' : '0'}}>
                    <div
                        style={{
                            ...getNavItemStyle('logout'),
                            color: '#6b7280',
                        }}
                        onClick={onLogout}
                        title={sidebarCollapsed ? 'Logout' : ''}
                        onMouseEnter={(e) => {
                            if (!sidebarCollapsed) {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!sidebarCollapsed) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6b7280';
                            }
                        }}
                    >
                        <LogOut
                            size={20}
                            style={{color: 'inherit'}}
                        />
                        {!sidebarCollapsed && <span style={{marginLeft: '14px'}}>Logout</span>}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
