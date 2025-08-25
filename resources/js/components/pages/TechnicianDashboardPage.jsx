import React, { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, Activity, AlertTriangle, Settings, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const TechnicianDashboardPage = ({ user }) => {
  const [stats, setStats] = useState({
    myTickets: 0,
    ticketsCompleted: 0,
    ticketsInProgress: 0,
    ticketsPending: 0,
    myEquipments: 0,
    equipmentsFixed: 0,
    equipmentsMaintenance: 0,
    totalFailures: 0
  });

  const [chartData, setChartData] = useState([]);
  const [ticketsByStatus, setTicketsByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - adjust this to match your Laravel API
  const API_BASE_URL = '/api';

  // Fetch data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching technician dashboard data...');
        console.log('Current user:', user);

        const currentUserId = user?.id_user ?? user?.id;
        console.log('User ID being used:', currentUserId);

        // Fetch all data concurrently with proper error handling
        const [ticketsResponse, equipmentsResponse, failuresResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/tickets`).catch(err => {
            console.error('Tickets fetch error:', err);
            return { ok: false, error: err.message };
          }),
          fetch(`${API_BASE_URL}/equipements`).catch(err => {
            console.error('Equipment fetch error:', err);
            return { ok: false, error: err.message };
          }),
          fetch(`${API_BASE_URL}/pannes`).catch(err => {
            console.error('Pannes fetch error:', err);
            return { ok: false, error: err.message };
          })
        ]);

        // Parse responses with detailed logging
        let ticketsData = { data: [], count: 0 };
        let equipmentsData = { data: [], count: 0 };
        let failuresData = { data: [], count: 0 };

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

        // Process tickets data - Filter by technician
        const tickets = ticketsData.data || ticketsData || [];
        const myTickets = tickets.filter(t =>
          t.technicien_assigne === currentUserId ||
          t.technicien_id === currentUserId ||
          t.assigned_to === currentUserId
        );

        const ticketStats = {
          total: myTickets.length,
          completed: myTickets.filter(t => ['resolu', 'ferme'].includes(t.status)).length,
          inProgress: myTickets.filter(t => t.status === 'en_cours').length,
          pending: myTickets.filter(t => t.status === 'en_attente').length,
          open: myTickets.filter(t => t.status === 'ouvert').length
        };

        // Process equipment data - Filter by technician responsibility
        const equipments = equipmentsData.data || equipmentsData || [];
        const myEquipments = equipments.filter(e =>
          e.technicien_id === currentUserId ||
          e.responsible_technician === currentUserId ||
          e.assigned_technician === currentUserId ||
          e.utilisateur_assigne === currentUserId
        );

        const equipmentStats = {
          total: myEquipments.length,
          active: myEquipments.filter(e => e.status === 'Actif').length,
          maintenance: myEquipments.filter(e => e.status === 'En maintenance').length,
          fixed: myEquipments.filter(e => e.status === 'Actif').length, // Recently fixed equipment
        };

        console.log('All tickets:', tickets.length);
        console.log('My tickets:', myTickets.length);
        console.log('All equipment:', equipments.length);
        console.log('My equipment:', myEquipments.length);

        // Process failures related to technician
        const failures = failuresData.data || failuresData || [];
        const myFailures = failures.filter(f =>
          f.technicien_id === currentUserId ||
          f.assigned_to === currentUserId
        );

        const failureCount = myFailures.length + equipmentStats.maintenance;

        console.log('Processed technician data:', {
          myTickets: ticketStats.total,
          ticketsCompleted: ticketStats.completed,
          myEquipments: equipmentStats.total,
          equipmentsFixed: equipmentStats.fixed,
          totalFailures: failureCount
        });

        // If no tickets/equipment found, show some test data for demo
        const hasData = myTickets.length > 0 || myEquipments.length > 0;
        if (!hasData) {
          console.log('No data found for technician, using fallback values');
          // Use some fallback stats for demo
          setStats({
            myTickets: 0,
            ticketsCompleted: 0,
            ticketsInProgress: 0,
            ticketsPending: 0,
            myEquipments: 0,
            equipmentsFixed: 0,
            equipmentsMaintenance: 0,
            totalFailures: 0
          });
          setChartData([]);
          setTicketsByStatus([]);
          setLoading(false);
          return;
        }

        // Update stats
        setStats({
          myTickets: ticketStats.total,
          ticketsCompleted: ticketStats.completed,
          ticketsInProgress: ticketStats.inProgress,
          ticketsPending: ticketStats.pending,
          myEquipments: equipmentStats.total,
          equipmentsFixed: equipmentStats.fixed,
          equipmentsMaintenance: equipmentStats.maintenance,
          totalFailures: failureCount
        });

        // Generate chart data from my tickets (last 30 days)
        const chartData = generateMyTicketsChartData(myTickets);
        setChartData(chartData);

        // Generate pie chart data for my ticket status
        const statusData = [
          { name: 'Terminés', value: ticketStats.completed, color: '#10b981' },
          { name: 'En cours', value: ticketStats.inProgress, color: '#3b82f6' },
          { name: 'En attente', value: ticketStats.pending, color: '#f59e0b' },
          { name: 'Ouverts', value: ticketStats.open, color: '#ef4444' }
        ].filter(item => item.value > 0);

        setTicketsByStatus(statusData);

      } catch (err) {
        console.error('Error fetching technician dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Generate chart data from technician's tickets
  const generateMyTicketsChartData = (tickets) => {
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
        assigned: dayTickets.length,
        completed: resolvedTickets.length,
        tickets: resolvedTickets.length
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
          borderTop: '4px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280', margin: 0 }}>
          Chargement de votre tableau de bord...
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
            backgroundColor: '#f59e0b',
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

  const completionRate = stats.myTickets > 0 ? Math.round((stats.ticketsCompleted / stats.myTickets) * 100) : 0;

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
            Mon Tableau de Bord
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: 16
          }}>
            Bonjour {user?.prenom || 'Technicien'}, voici un aperçu de vos tâches et performances
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
            title="Mes tickets"
            value={stats.myTickets}
            icon={FileText}
            bgColor="#fef3c7"
            iconColor="#f59e0b"
            subtitle="Tickets assignés"
          />
          <StatCard
            title="Tickets terminés"
            value={stats.ticketsCompleted}
            icon={CheckCircle}
            bgColor="#d1fae5"
            iconColor="#10b981"
            subtitle={`${completionRate}% de réussite`}
          />
          <StatCard
            title="Mes équipements"
            value={stats.myEquipments}
            icon={Wrench}
            bgColor="#dbeafe"
            iconColor="#3b82f6"
            subtitle="Sous ma responsabilité"
          />
          <StatCard
            title="Interventions"
            value={stats.totalFailures}
            icon={AlertTriangle}
            bgColor="#fed7d7"
            iconColor="#ef4444"
            subtitle="Pannes à traiter"
          />
        </div>

        {/* Ticket Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          marginBottom: 32
        }}>
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
            title="Équipements réparés"
            value={stats.equipmentsFixed}
            icon={Settings}
            bgColor="#d1fae5"
            iconColor="#10b981"
          />
          <StatCard
            title="En maintenance"
            value={stats.equipmentsMaintenance}
            icon={Wrench}
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
                  Mes tickets terminés (30 derniers jours)
                </h2>
                <p style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: 14
                }}>
                  Évolution de vos performances
                </p>
              </div>
            </div>

            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMyTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
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
                    dataKey="completed"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fill="url(#colorMyTickets)"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
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
              Mes tickets par statut
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
                backgroundColor: '#fef3c7',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={20} style={{ color: '#f59e0b' }} />
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0
              }}>
                Ma Performance
              </h3>
            </div>
            <p style={{
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.6
            }}>
              Taux de résolution : <strong style={{ color: '#10b981' }}>{completionRate}%</strong>
              <br />
              Tickets actifs : <strong>{stats.ticketsInProgress + stats.ticketsPending}</strong>
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
                backgroundColor: '#dbeafe',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wrench size={20} style={{ color: '#3b82f6' }} />
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0
              }}>
                Mes Équipements
              </h3>
            </div>
            <p style={{
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.6
            }}>
              Équipements actifs : <strong style={{ color: '#10b981' }}>{stats.equipmentsFixed}</strong>
              <br />
              En maintenance : <strong style={{ color: '#ef4444' }}>{stats.equipmentsMaintenance}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicianDashboardPage;
