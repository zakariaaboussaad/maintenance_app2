import React, { useEffect, useState } from 'react';
import { Users, Ticket, CheckCircle, Clock, TrendingUp, Activity, AlertTriangle, Wrench, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const AdminDashboardPage = ({ user }) => {
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
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

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
  const [usersResponse, ticketsResponse, equipmentsResponse, failuresResponse] = await Promise.all([
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
    })
  ]);

  // Parse responses with detailed logging
  let usersData = { data: [], count: 0 };
  let ticketsData = { data: [], count: 0 };
  let equipmentsData = { data: [], count: 0 };
  let failuresData = { data: [], count: 0 };

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

  // Process tickets data
  const tickets = ticketsData.data || ticketsData || [];
  const ticketStats = {
    total: tickets.length,
    closed: tickets.filter(t => ['resolu', 'ferme'].includes(t.status)).length,
    open: tickets.filter(t => t.status === 'ouvert').length,
    inProgress: tickets.filter(t => t.status === 'en_cours').length,
    pending: tickets.filter(t => t.status === 'en_attente').length
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

  // Generate chart data from tickets (last 30 days)
  const chartData = generateTicketsChartData(tickets);
  setChartData(chartData);

  // Generate pie chart data for ticket status
  const statusData = [
    { name: 'Résolus', value: ticketStats.closed, color: '#10b981' },
    { name: 'En cours', value: ticketStats.inProgress, color: '#3b82f6' },
    { name: 'En attente', value: ticketStats.pending, color: '#f59e0b' },
    { name: 'Ouverts', value: ticketStats.open, color: '#ef4444' }
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

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, textColor = '#1f2937', subtitle }) => (
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
cursor: 'pointer'
}}
onMouseEnter={(e) => {
e.currentTarget.style.transform = 'translateY(-2px)';
e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
}}
onMouseLeave={(e) => {
e.currentTarget.style.transform = 'translateY(0)';
e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
}}>
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
    />
    <StatCard
      title="Tickets totaux"
      value={stats.totalTickets}
      icon={Ticket}
      bgColor="#fef3c7"
      iconColor="#f59e0b"
      subtitle={`${stats.ticketsClosed} résolus`}
    />
    <StatCard
      title="Équipements"
      value={stats.totalEquipments}
      icon={Wrench}
      bgColor="#dbeafe"
      iconColor="#3b82f6"
      subtitle={`${stats.equipmentsActive} actifs`}
    />
    <StatCard
      title="Pannes"
      value={stats.totalFailures}
      icon={AlertTriangle}
      bgColor="#fed7d7"
      iconColor="#ef4444"
      subtitle="Équipements en maintenance"
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
    />
    <StatCard
      title="En cours"
      value={stats.ticketsInProgress}
      icon={Activity}
      bgColor="#dbeafe"
      iconColor="#3b82f6"
    />
    <StatCard
      title="En attente"
      value={stats.ticketsPending}
      icon={Clock}
      bgColor="#fef3c7"
      iconColor="#f59e0b"
    />
    <StatCard
      title="Ouverts"
      value={stats.ticketsOpen}
      icon={FileText}
      bgColor="#fed7d7"
      iconColor="#ef4444"
    />
  </div>

  {/* Charts Section */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 24,
    marginBottom: 32
  }}>
    {/* Area Chart */}
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
          <AreaChart data={chartData}>
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

    {/* Pie Chart */}
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
</div>
</>
);
};

export default AdminDashboardPage;
