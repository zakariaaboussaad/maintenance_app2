import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminTicketsPage from '../pages/AdminTicketsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminEquipmentsPage from '../pages/AdminEquipmentsPage';
import TechnicianMyTicketsPage from '../pages/TechnicianMyTicketsPage';
import AdminSettingsPage from '../pages/AdminSettingsPage';
import UserHistoryPage from '../pages/UserHistoryPage';
import EquipmentHistoryPage from '../pages/EquipmentHistoryPage';
import ExcelReportsPage from '../pages/ExcelReportsPage';
import AdminPasswordRequestsPage from '../pages/AdminPasswordRequestsPage';

const AdminDashboard = ({ onLogout, user }) => {
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
        return <AdminDashboardPage user={user} darkTheme={darkTheme} />;
      case 'tickets':
        return <AdminTicketsPage user={user} darkTheme={darkTheme} />;
      case 'my-tickets':
        return <TechnicianMyTicketsPage user={user} darkTheme={darkTheme} />;
      case 'users':
        return <AdminUsersPage darkTheme={darkTheme} />;
      case 'equipements':
        return <AdminEquipmentsPage darkTheme={darkTheme} />;
      case 'user-history':
        return <UserHistoryPage darkTheme={darkTheme} />;
      case 'equipment-history':
        return <EquipmentHistoryPage darkTheme={darkTheme} />;
      case 'excel-reports':
        return <ExcelReportsPage darkTheme={darkTheme} />;
      case 'settings':
        return <AdminSettingsPage user={user} darkTheme={darkTheme} setDarkTheme={setDarkTheme} />;
      default:
        return <AdminDashboardPage user={user} darkTheme={darkTheme} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkTheme ? '#111827' : '#f8fafc',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{display: 'flex'}}>
        <Sidebar
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onLogout={onLogout}
          userRole="admin"
          darkTheme={darkTheme}
        />

        <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
          <Header user={user} darkTheme={darkTheme} />

          <main style={{
            padding: '40px',
            flex: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: 'calc(100vh - 80px)',
            overflow: 'auto'
          }}>
            {renderPageContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
