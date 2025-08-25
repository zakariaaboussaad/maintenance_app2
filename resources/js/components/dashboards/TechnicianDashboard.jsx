import React, { useState, useEffect } from 'react';
import { Wrench, Settings } from 'lucide-react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import TechnicianDashboardPage from '../pages/TechnicianDashboardPage';
import TechnicianTicketsPage from '../pages/TechnicianTicketsPage';
import TechnicianMyTicketsPage from '../pages/TechnicianMyTicketsPage';
import TechnicianSettingsPage from '../pages/TechnicianSettingsPage';
import UserSettingsPage from '../pages/UserSettingsPage';

const TechnicianDashboard = ({ onLogout, user }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkTheme(savedTheme === 'dark');
    }
  }, []);

  // Apply theme to document body
  useEffect(() => {
    document.body.style.backgroundColor = darkTheme ? '#111827' : '#f8fafc';
    document.body.style.color = darkTheme ? '#ffffff' : '#000000';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [darkTheme]);

  const renderPageContent = () => {
    switch (activeMenuItem) {
      case 'home':
        return <TechnicianDashboardPage user={user} darkTheme={darkTheme} />;
      case 'tickets':
        return <TechnicianTicketsPage user={user} darkTheme={darkTheme} />;
      case 'my-tickets':
        return <TechnicianMyTicketsPage user={user} darkTheme={darkTheme} />;
      case 'settings':
        return <UserSettingsPage user={user} darkTheme={darkTheme} />;
      case 'equipements':
        return (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: darkTheme ? '#1f2937' : 'white',
            borderRadius: 16,
            border: `1px solid ${darkTheme ? '#374151' : '#f1f5f9'}`,
            boxShadow: darkTheme ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: darkTheme ? '#065f46' : '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Wrench size={40} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: darkTheme ? '#ffffff' : '#1f2937',
              margin: 0,
              marginBottom: 8
            }}>
              Gestion des Équipements
            </h2>
            <p style={{
              color: darkTheme ? '#d1d5db' : '#6b7280',
              fontSize: 16,
              margin: 0
            }}>
              Cette section est en cours de développement
            </p>
          </div>
        );
      default:
        return <TechnicianDashboardPage user={user} darkTheme={darkTheme} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkTheme ? '#111827' : '#f8fafc',
      display: 'flex',
      flexDirection: 'row',
      transition: 'background-color 0.3s ease'
    }}>
      <Sidebar
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onLogout={onLogout}
        userRole="technician"
        darkTheme={darkTheme}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Header user={user} darkTheme={darkTheme} />

        <main style={{
          padding: '40px',
          flex: 1,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'auto',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
