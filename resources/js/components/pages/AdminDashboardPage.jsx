import React, { useEffect, useState } from 'react';
import { Users, Ticket, CheckCircle, Clock, TrendingUp, Activity, AlertTriangle, Wrench, FileText, BarChart3, Filter, Calendar, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdminDashboardPage = ({ user, onNavigateToPage }) => {
console.log('AdminDashboardPage rendering with user:', user);
const [stats, setStats] = useState({
totalUsers: 0,
totalTickets: 0,
ticketsClosed: 0,
ticketsOpen: 0,
ticketsInProgress: 0,
ticketsPending: 0,
totalEquipments: 0,
equipmentsActive: 0,
equipmentsMaintenance: 0,
totalFailures: 0
});

const [chartData, setChartData] = useState([]);
const [ticketsByStatus, setTicketsByStatus] = useState([]);
const [pyramidData, setPyramidData] = useState([]);
const [originalTickets, setOriginalTickets] = useState([]); // Store original tickets for filtering
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [viewMode, setViewMode] = useState('line'); // 'line' or 'pyramid'
const [filterMonth, setFilterMonth] = useState('');
const [filterYear, setFilterYear] = useState('');
const [filterTech, setFilterTech] = useState('');
const [technicians, setTechnicians] = useState([]);

// API base URL - adjust this to match your Laravel API
const API_BASE_URL = 'http://localhost:8000/api';

// Fetch data from APIs
useEffect(() => {
const fetchDashboardData = async () => {
try {
  setLoading(true);
  setError(null);

  console.log('Fetching dashboard data...');

  // Get auth token
  const token = sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch all data concurrently with proper error handling
  const [usersResponse, ticketsResponse, equipmentsResponse, failuresResponse, techsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/utilisateurs`, { headers }).catch(err => {
      console.error('Users fetch error:', err);
      return { ok: false, error: err.message };
    }),
    fetch(`${API_BASE_URL}/tickets`, { headers }).catch(err => {
      console.error('Tickets fetch error:', err);
      return { ok: false, error: err.message };
    }),
    fetch(`${API_BASE_URL}/equipements`, { headers }).catch(err => {
      console.error('Equipment fetch error:', err);
      return { ok: false, error: err.message };
    }),
    fetch(`${API_BASE_URL}/pannes`, { headers }).catch(err => {
      console.error('Pannes fetch error:', err);
      return { ok: false, error: err.message };
    }),
    fetch(`${API_BASE_URL}/utilisateurs`, { headers }).catch(err => {
      console.error('Technicians fetch error:', err);
      return { ok: false, error: err.message };
    })
  ]);

  // Parse responses with detailed logging
  let usersData = { data: [], count: 0 };
  let ticketsData = { data: [], count: 0 };
  let equipmentsData = { data: [], count: 0 };
  let failuresData = { data: [], count: 0 };
  let techsData = { data: [], count: 0 };

  if (usersResponse.ok) {
    usersData = await usersResponse.json();
    console.log('Users data:', usersData);
  } else {
    console.error('Users API failed:', usersResponse.status, usersResponse.statusText);
  }

  if (ticketsResponse.ok) {
    ticketsData = await ticketsResponse.json();
    console.log('Tickets data:', ticketsData);
  } else {
    console.error('Tickets API failed:', ticketsResponse.status, ticketsResponse.statusText);
  }

  if (equipmentsResponse.ok) {
    equipmentsData = await equipmentsResponse.json();
    console.log('Equipment data:', equipmentsData);
  } else {
    console.error('Equipment API failed:', equipmentsResponse.status, equipmentsResponse.statusText);
  }

  if (failuresResponse.ok) {
    failuresData = await failuresResponse.json();
    console.log('Failures data:', failuresData);
  } else {
    console.error('Pannes API failed:', failuresResponse.status, failuresResponse.statusText);
  }

  if (techsResponse.ok) {
    techsData = await techsResponse.json();
    console.log('Technicians data:', techsData);
  } else {
    console.error('Technicians API failed:', techsResponse.status, techsResponse.statusText);
  }

  // Process tickets data
  const tickets = ticketsData.data || ticketsData || [];
  
  // Log all unique statuses to see what we're working with
  const uniqueStatuses = [...new Set(tickets.map(t => t.status))];
  console.log('Unique ticket statuses found:', uniqueStatuses);
  
  const ticketStats = {
    total: tickets.length,
    closed: tickets.filter(t => {
      const status = t.status?.toLowerCase();
      return status === 'résolu' || status === 'resolu' || status === 'resolved';
    }).length,
    open: tickets.filter(t => {
      const status = t.status?.toLowerCase();
      return status === 'fermé' || status === 'ferme' || status === 'closed';
    }).length,
    inProgress: tickets.filter(t => {
      const status = t.status?.toLowerCase();
      return status === 'en cours' || status === 'en_cours' || status === 'in_progress';
    }).length,
    pending: tickets.filter(t => {
      const status = t.status?.toLowerCase();
      return status === 'en attente' || status === 'en_attente' || status === 'pending';
    }).length
  };

  // Process equipment data - match your actual DB statuses
  const equipments = equipmentsData.data || equipmentsData || [];
  const equipmentStats = {
    total: equipments.length,
    active: equipments.filter(e => e.status === 'Actif').length,
    maintenance: equipments.filter(e => e.status === 'En maintenance').length,
    broken: equipments.filter(e => e.status === 'En maintenance').length, // En maintenance = en panne pour l'affichage
    idle: equipments.filter(e => e.status === 'En veille').length
  };

  console.log('Equipment statuses found:', [...new Set(equipments.map(e => e.status))]);
  console.log('Equipment stats:', equipmentStats);

  // Process users data - handle different API response formats
  const users = usersData.data || usersData || [];
  const userCount = usersData.count || users.length || 0;

  // Use equipment failures instead of separate pannes API
  // Since pannes table is empty, we'll count equipment failures + actual pannes records
  let actualFailuresCount = equipmentStats.broken;

  // Also try to get pannes from API if available
  if (failuresResponse.ok) {
    const failures = failuresData.data || failuresData || [];
    actualFailuresCount += failures.length;
  }

  const failureCount = actualFailuresCount;

  console.log('Processed data:', {
    users: userCount,
    tickets: ticketStats.total,
    equipments: equipmentStats.total,
    equipmentsActive: equipmentStats.active,
    equipmentsMaintenance: equipmentStats.maintenance,
    equipmentsBroken: equipmentStats.broken,
    totalFailures: failureCount
  });

  // Update stats with proper fallbacks
  setStats({
    totalUsers: userCount,
    totalTickets: ticketStats.total,
    ticketsClosed: ticketStats.closed,
    ticketsOpen: ticketStats.open,
    ticketsInProgress: ticketStats.inProgress,
    ticketsPending: ticketStats.pending,
    totalEquipments: equipmentStats.total,
    equipmentsActive: equipmentStats.active,
    equipmentsMaintenance: equipmentStats.maintenance,
    totalFailures: failureCount
  });

  console.log('Final stats:', {
    totalUsers: userCount,
    totalTickets: ticketStats.total,
    totalEquipments: equipmentStats.total,
    totalFailures: failureCount
  });

  // Store original tickets for filtering
  setOriginalTickets(tickets);
  
  // Generate chart data from tickets (last 30 days)
  const chartData = generateTicketsChartData(tickets);
  setChartData(chartData);

  // Set technicians for filter dropdown (include admins too)
  const allUsers = techsData.users || techsData.data || [];
  console.log('All users from API:', allUsers);
  console.log('User roles found:', allUsers.map(u => ({ name: u.prenom + ' ' + u.nom, role_id: u.role_id })));
  
  const allTechs = allUsers.filter(u => u.role_id === 2 || u.role_id === 1); // Technicians and admins
  console.log('Filtered technicians:', allTechs);
  setTechnicians(allTechs);
  
  // Generate initial pyramid data
  console.log('Generating pyramid data with tickets:', tickets.length, 'and techs:', allTechs.length);
  const pyramidData = generatePyramidData(tickets, allTechs);
  console.log('Generated pyramid data:', pyramidData);
  setPyramidData(pyramidData);

  // Generate pie chart data for ticket status
  const statusData = [
    { name: 'Résolus', value: ticketStats.closed, color: '#10b981' },
    { name: 'En cours', value: ticketStats.inProgress, color: '#3b82f6' },
    { name: 'En attente', value: ticketStats.pending, color: '#f59e0b' },
    { name: 'Fermés', value: ticketStats.open, color: '#ef4444' }
  ].filter(item => item.value > 0);

  setTicketsByStatus(statusData);

} catch (err) {
  console.error('Error fetching dashboard data:', err);
  setError('Erreur lors du chargement des données');
} finally {
  setLoading(false);
}
};

fetchDashboardData();
}, []);

// Regenerate pyramid data when data loads or filters change
useEffect(() => {
  if (technicians.length > 0 && originalTickets.length > 0) {
    const ticketsToUse = getFilteredTickets();
    const newPyramidData = generatePyramidData(ticketsToUse);
    setPyramidData(newPyramidData);
  }
}, [filterMonth, filterYear, filterTech, originalTickets, technicians]);

// Generate chart data from real tickets
const generateTicketsChartData = (tickets) => {
const last30Days = [];
const today = new Date();

for (let i = 29; i >= 0; i--) {
const date = new Date();
date.setDate(today.getDate() - i);
const dateStr = date.toISOString().split('T')[0];

const dayTickets = tickets.filter(ticket => {
  if (ticket.date_creation) {
    const ticketDate = new Date(ticket.date_creation).toISOString().split('T')[0];
    return ticketDate === dateStr;
  }
  return false;
});

const resolvedTickets = tickets.filter(ticket => {
  if (ticket.date_resolution) {
    const resolutionDate = new Date(ticket.date_resolution).toISOString().split('T')[0];
    return resolutionDate === dateStr;
  }
  return false;
});

last30Days.push({
  day: i === 0 ? "Aujourd'hui" : i === 1 ? "Hier" : `J-${i}`,
  date: dateStr,
  created: dayTickets.length,
  resolved: resolvedTickets.length,
  tickets: resolvedTickets.length // For the area chart
});
}

return last30Days;
};

// Generate pyramid chart data from tickets
const generatePyramidData = (tickets, techsList = technicians) => {
  const pyramidData = [];
  
  // Filter only admins and technicians (role_id 1 or 2)
  const techsAndAdmins = (techsList || []).filter(user => 
    user.role_id === 1 || user.role_id === 2
  );
  
  techsAndAdmins.forEach(tech => {
    const techId = tech.id_user || tech.id;
    const techName = `${tech.prenom} ${tech.nom}`;
    
    // Filter tickets assigned to this technician and resolved/closed
    const techTickets = tickets.filter(ticket => {
      const isAssignedToTech = ticket.technicien_assigne == techId;
      const isResolved = ticket.status === 'resolu' || ticket.status === 'ferme' || ticket.status === 'en_cours';
      return isAssignedToTech && isResolved;
    });
    
    console.log(`Tech ${techName} (ID: ${techId}) has ${techTickets.length} tickets`);
    
    // Count tickets by category using categorie_id from database
    let hardwareCount = 0;
    let softwareCount = 0;
    let networkCount = 0;
    
    techTickets.forEach(ticket => {
      console.log(`Processing ticket:`, ticket.titre, `categorie_id:`, ticket.categorie_id);
      
      // Use categorie_id to properly categorize tickets
      if (ticket.categorie_id === 1) { // Hardware
        hardwareCount++;
      } else if (ticket.categorie_id === 2) { // Software
        softwareCount++;
      } else if (ticket.categorie_id === 3) { // Network
        networkCount++;
      } else if (ticket.categorie_id === 4) { // Impression - count as hardware
        hardwareCount++;
      } else {
        // Fallback: categorize by keywords if no categorie_id
        const title = (ticket.titre || '').toLowerCase();
        const description = (ticket.description || '').toLowerCase();
        const content = `${title} ${description}`;
        
        console.log(`No categorie_id, using fallback for: "${content}"`);
        
        if (content.includes('ordinateur') || content.includes('pc') || 
            content.includes('hardware') || content.includes('matériel')) {
          hardwareCount++;
          console.log('Categorized as HARDWARE');
        } else if (content.includes('réseau') || content.includes('network')) {
          networkCount++;
          console.log('Categorized as NETWORK');
        } else {
          softwareCount++;
          console.log('Categorized as SOFTWARE (default)');
        }
      }
    });
    
    console.log(`${techName} final counts: Hardware=${hardwareCount}, Software=${softwareCount}, Network=${networkCount}`);
    
    // Add all admins and technicians with actual values
    pyramidData.push({
      technician: techName,
      HARDWARE: hardwareCount,
      SOFTWARE: softwareCount,
      NETWORK: networkCount,
      total: hardwareCount + softwareCount + networkCount,
      techId: techId
    });
  });
  
  // Sort by total tickets resolved (descending)
  return pyramidData.sort((a, b) => b.total - a.total);
};

// Filter tickets based on selected filters
const getFilteredTickets = () => {
  if (!filterYear && !filterMonth && !filterTech) {
    return originalTickets;
  }
  
  return originalTickets.filter(ticket => {
    // Apply technician filter
    if (filterTech && ticket.technicien_assigne != filterTech) return false;
    
    // Apply date filters
    if (filterYear || filterMonth) {
      const ticketDate = new Date(ticket.date_resolution || ticket.date_creation);
      const ticketYear = ticketDate.getFullYear().toString();
      const ticketMonth = (ticketDate.getMonth() + 1).toString().padStart(2, '0');
      
      if (filterYear && ticketYear !== filterYear) return false;
      if (filterMonth && ticketMonth !== filterMonth) return false;
    }
    
    return true;
  });
};

// Filter chart data based on selected filters
const getFilteredChartData = () => {
  const filteredTickets = getFilteredTickets();
  return generateTicketsChartData(filteredTickets);
};

// Filter pyramid data based on selected filters
const getFilteredPyramidData = () => {
  if (!filterYear && !filterMonth && !filterTech) {
    return pyramidData;
  }
  
  const filteredTickets = getFilteredTickets();
  return generatePyramidData(filteredTickets, technicians);
};

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, textColor = '#1f2937', subtitle, onClick }) => (
<div style={{
backgroundColor: 'white',
borderRadius: 16,
padding: 24,
boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
border: '1px solid #f1f5f9',
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
transition: 'transform 0.2s ease, box-shadow 0.2s ease',
cursor: onClick ? 'pointer' : 'default'
}}
onClick={onClick}
onMouseEnter={(e) => {
if (onClick) {
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
}
}}
onMouseLeave={(e) => {
if (onClick) {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
}
}}
>
<div>
  <p style={{
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    marginBottom: 8
  }}>
    {title}
  </p>
  <p style={{
    color: textColor,
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1,
    marginBottom: subtitle ? 4 : 0
  }}>
    {value.toLocaleString()}
  </p>
  {subtitle && (
    <p style={{
      color: '#9ca3af',
      fontSize: 12,
      margin: 0
    }}>
      {subtitle}
    </p>
  )}
</div>
<div style={{
  width: 64,
  height: 64,
  backgroundColor: bgColor,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Icon size={28} style={{ color: iconColor }} />
</div>
</div>
);

if (loading) {
return (
<div style={{
  minHeight: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 16
}}>
  <div style={{
    width: 40,
    height: 40,
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
  <p style={{ color: '#6b7280', margin: 0 }}>
    Chargement du tableau de bord...
  </p>
</div>
);
}

if (error) {
return (
<div style={{
  minHeight: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 16
}}>
  <AlertTriangle size={48} style={{ color: '#ef4444' }} />
  <p style={{ color: '#ef4444', margin: 0, fontSize: 16, fontWeight: 500 }}>
    {error}
  </p>
  <button
    onClick={() => window.location.reload()}
    style={{
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14
    }}
  >
    Réessayer
  </button>
</div>
);
}

const resolutionRate = stats.totalTickets > 0 ? Math.round((stats.ticketsClosed / stats.totalTickets) * 100) : 0;

return (
<>
<style>
  {`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
</style>

<div>
  {/* Header */}
  <div style={{ marginBottom: 32 }}>
    <h1 style={{
      fontSize: 32,
      fontWeight: 800,
      color: '#1e293b',
      margin: 0,
      marginBottom: 8
    }}>
      Tableau de bord
    </h1>
    <p style={{
      color: '#64748b',
      margin: 0,
      fontSize: 16
    }}>
      Bienvenue {user?.prenom || 'Admin'}, voici un aperçu en temps réel de votre système
    </p>
  </div>

  {/* Main Stats Cards */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    marginBottom: 32
  }}>
    <StatCard
      title="Utilisateurs totaux"
      value={stats.totalUsers}
      icon={Users}
      bgColor="#ede9fe"
      iconColor="#7c3aed"
      subtitle="Utilisateurs actifs"
      onClick={() => onNavigateToPage && onNavigateToPage('users')}
    />
    <StatCard
      title="Tickets totaux"
      value={stats.totalTickets}
      icon={Ticket}
      bgColor="#fef3c7"
      iconColor="#f59e0b"
      subtitle={`${stats.ticketsClosed} résolus`}
      onClick={() => onNavigateToPage && onNavigateToPage('tickets')}
    />
    <StatCard
      title="Équipements"
      value={stats.totalEquipments}
      icon={Wrench}
      bgColor="#dbeafe"
      iconColor="#3b82f6"
      subtitle={`${stats.equipmentsActive} actifs`}
      onClick={() => onNavigateToPage && onNavigateToPage('equipements')}
    />
    <StatCard
      title="Pannes"
      value={stats.totalFailures}
      icon={AlertTriangle}
      bgColor="#fed7d7"
      iconColor="#ef4444"
      subtitle="Équipements en maintenance"
      onClick={() => onNavigateToPage && onNavigateToPage('equipements', 'en maintenance')}
    />
  </div>

  {/* Tickets Status Cards */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 24,
    marginBottom: 32
  }}>
    <StatCard
      title="Tickets résolus"
      value={stats.ticketsClosed}
      icon={CheckCircle}
      bgColor="#d1fae5"
      iconColor="#10b981"
      onClick={() => onNavigateToPage && onNavigateToPage('tickets', 'résolu')}
    />
    <StatCard
      title="En cours"
      value={stats.ticketsInProgress}
      icon={Activity}
      bgColor="#dbeafe"
      iconColor="#3b82f6"
      onClick={() => onNavigateToPage && onNavigateToPage('tickets', 'en cours')}
    />
    <StatCard
      title="En attente"
      value={stats.ticketsPending}
      icon={Clock}
      bgColor="#fef3c7"
      iconColor="#f59e0b"
      onClick={() => onNavigateToPage && onNavigateToPage('tickets', 'en attente')}
    />
    <StatCard
      title="Fermés"
      value={stats.ticketsOpen}
      icon={FileText}
      bgColor="#fed7d7"
      iconColor="#ef4444"
      onClick={() => onNavigateToPage && onNavigateToPage('tickets', 'fermé')}
    />
  </div>

  {/* Filter Controls */}
  <div style={{
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
    marginBottom: 32
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Filter size={20} style={{ color: '#3b82f6' }} />
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
          margin: 0
        }}>
          Filtres des tickets résolus
        </h3>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setViewMode('line')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'line' ? '#3b82f6' : '#f8fafc',
            color: viewMode === 'line' ? 'white' : '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          <TrendingUp size={16} />
          Évolution
        </button>
        <button
          onClick={() => setViewMode('pyramid')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewMode === 'pyramid' ? '#3b82f6' : '#f8fafc',
            color: viewMode === 'pyramid' ? 'white' : '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          <BarChart3 size={16} />
          Pyramides
        </button>
      </div>
    </div>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16
    }}>
      <div>
        <label style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#374151'
        }}>
          Année
        </label>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: 'white'
          }}
        >
          <option value="">Toutes les années</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>
      
      <div>
        <label style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#374151'
        }}>
          Mois
        </label>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: 'white'
          }}
        >
          <option value="">Tous les mois</option>
          <option value="01">Janvier</option>
          <option value="02">Février</option>
          <option value="03">Mars</option>
          <option value="04">Avril</option>
          <option value="05">Mai</option>
          <option value="06">Juin</option>
          <option value="07">Juillet</option>
          <option value="08">Août</option>
          <option value="09">Septembre</option>
          <option value="10">Octobre</option>
          <option value="11">Novembre</option>
          <option value="12">Décembre</option>
        </select>
      </div>
      
      <div>
        <label style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#374151'
        }}>
          Technicien
        </label>
        <select
          value={filterTech}
          onChange={(e) => setFilterTech(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: 'white'
          }}
        >
          <option value="">Tous les techniciens</option>
          {technicians.filter(user => user.role_id === 1 || user.role_id === 2).map(tech => (
            <option key={tech.id_user} value={tech.id_user}>
              {`${tech.prenom || ''} ${tech.nom || ''}`.trim() || `User #${tech.id_user}`} ({tech.role_id === 1 ? 'Admin' : 'Tech'})
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'end' }}>
        <button
          onClick={() => {
            setFilterYear('');
            setFilterMonth('');
            setFilterTech('');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  </div>

  {/* Charts Section */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 24,
    marginBottom: 32
  }}>
    {viewMode === 'line' ? (
      /* Area Chart */
      <div style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9'
      }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32
      }}>
        <div>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            margin: 0,
            marginBottom: 4
          }}>
            Tickets résolus (30 derniers jours)
          </h2>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: 14
          }}>
            Évolution des tickets fermés
          </p>
        </div>
      </div>

      <div style={{ height: 300, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={getFilteredChartData()}>
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorTickets)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
    ) : (
      /* Pyramid Chart */
      <div style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32
        }}>
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              margin: 0,
              marginBottom: 4
            }}>
              Tickets résolus par catégorie
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: 14
            }}>
              Performance des techniciens par type d'intervention
            </p>
          </div>
        </div>

        {/* Chart Container */}
        <div style={{
          position: 'relative',
          height: 300,
          marginBottom: 20,
          padding: '0 40px 0 60px'
        }}>
          {/* Y-axis */}
          <div style={{
            position: 'absolute',
            left: 40,
            top: 20,
            bottom: 60,
            width: 2,
            backgroundColor: '#e5e7eb'
          }}>
            {/* Y-axis labels */}
            {(() => {
              const maxValue = Math.max(
                ...getFilteredPyramidData().flatMap(t => [t.HARDWARE, t.SOFTWARE, t.NETWORK]),
                1
              );
              const steps = [maxValue, Math.ceil(maxValue * 0.75), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.25), 0];
              return steps.map((value, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  top: `${(index / (steps.length - 1)) * 100}%`,
                  right: 10,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{
                    fontSize: 12,
                    color: '#6b7280',
                    fontWeight: 500,
                    minWidth: 20,
                    textAlign: 'right'
                  }}>
                    {value}
                  </span>
                  <div style={{
                    width: 8,
                    height: 1,
                    backgroundColor: '#e5e7eb'
                  }} />
                </div>
              ));
            })()}
          </div>

          {/* Chart Bars */}
          <div style={{
            position: 'absolute',
            left: 60,
            right: 40,
            top: 20,
            bottom: 60,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            gap: 15
          }}>
            {getFilteredPyramidData().slice(0, 6).map((tech, index) => {
              const maxValue = Math.max(
                ...getFilteredPyramidData().flatMap(t => [t.HARDWARE, t.SOFTWARE, t.NETWORK]),
                1
              );
              
              return (
                <div key={tech.techId} style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2,
                  position: 'relative'
                }}>
                  {/* Hardware Bar */}
                  <div style={{
                    width: 28,
                    height: Math.max((tech.HARDWARE / maxValue) * 180, tech.HARDWARE > 0 ? 15 : 0),
                    backgroundColor: '#ef4444',
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.2s ease'
                  }} />
                  
                  {/* Software Bar */}
                  <div style={{
                    width: 28,
                    height: Math.max((tech.SOFTWARE / maxValue) * 180, tech.SOFTWARE > 0 ? 15 : 0),
                    backgroundColor: '#3b82f6',
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.2s ease'
                  }} />
                  
                  {/* Network Bar */}
                  <div style={{
                    width: 28,
                    height: Math.max((tech.NETWORK / maxValue) * 180, tech.NETWORK > 0 ? 15 : 0),
                    backgroundColor: '#10b981',
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.2s ease'
                  }} />
                  
                  {/* Technician name */}
                  <div style={{
                    position: 'absolute',
                    bottom: -25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {tech.technician.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginTop: 10,
          padding: '16px 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              backgroundColor: '#ef4444',
              borderRadius: 3
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>HARDWARE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              backgroundColor: '#3b82f6',
              borderRadius: 3
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>SOFTWARE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              backgroundColor: '#10b981',
              borderRadius: 3
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>NETWORK</span>
          </div>
        </div>
        
        {getFilteredPyramidData().length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: 14,
            padding: '40px 0'
          }}>
            Aucun ticket résolu trouvé
          </div>
        )}
      </div>
    )}

    {/* Pie Chart - Always visible on the right */}
    <div style={{
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 32,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #f1f5f9'
    }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#1f2937',
        margin: 0,
        marginBottom: 24
      }}>
        Répartition des tickets
      </h3>

      <div style={{ height: 200, width: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={ticketsByStatus}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
            >
              {ticketsByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 16 }}>
        {ticketsByStatus.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: 2
              }} />
              <span style={{ fontSize: 14, color: '#6b7280' }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

{/* Performance Cards */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#dbeafe',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TrendingUp size={20} style={{ color: '#3b82f6' }} />
        </div>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
          margin: 0
        }}>
          Performance
        </h3>
      </div>
      <p style={{
        color: '#6b7280',
        margin: 0,
        lineHeight: 1.6
      }}>
        Taux de résolution : <strong style={{ color: '#10b981' }}>{resolutionRate}%</strong>
        <br />
        Tickets en maintenance : <strong>{stats.equipmentsMaintenance}</strong>
      </p>
    </div>

    <div style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: '#f3e8ff',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={20} style={{ color: '#8b5cf6' }} />
        </div>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
          margin: 0
        }}>
          Activité récente
        </h3>
      </div>
      <p style={{
        color: '#6b7280',
        margin: 0,
        lineHeight: 1.6
      }}>
        Tickets actifs : <strong style={{ color: '#3b82f6' }}>{stats.ticketsInProgress + stats.ticketsPending}</strong>
        <br />
        Équipements actifs : <strong>{stats.equipmentsActive}/{stats.totalEquipments}</strong>
      </p>
    </div>
  </div>
</>
);
};

export default AdminDashboardPage;
