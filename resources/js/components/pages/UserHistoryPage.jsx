import React, { useState, useEffect } from 'react';
import { Eye, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import apiService from '../../services/apiService';

const UserHistoryPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    const [userTickets, setUserTickets] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/history/users');
            if (response.success) {
                // Filter only role 3 (Utilisateur) users
                const filteredUsers = response.data.filter(user => user.role_id === 3);
                setUsers(filteredUsers);
                setFilteredUsers(filteredUsers);
            } else {
                setError('Erreur lors du chargement des utilisateurs');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search and filters
    useEffect(() => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id_user?.toString().includes(searchTerm)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'actif') {
                filtered = filtered.filter(user => user.is_active === true || user.is_active === 1);
            } else if (statusFilter === 'inactif') {
                filtered = filtered.filter(user => user.is_active === false || user.is_active === 0);
            } else {
                filtered = filtered.filter(user => user.status === statusFilter);
            }
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, statusFilter]);

    const handleToggleUserHistory = async (user) => {
        if (expandedUser === user.id_user) {
            setExpandedUser(null);
        } else {
            setExpandedUser(user.id_user);
            // Fetch tickets if not already loaded
            if (!userTickets[user.id_user]) {
                try {
                    const response = await apiService.get(`/history/users/${user.id_user}/tickets`);
                    if (response.success) {
                        setUserTickets(prev => ({
                            ...prev,
                            [user.id_user]: response.data.tickets
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching user tickets:', err);
                }
            }
        }
    };

    if (loading) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;

    return (
        <>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Historique Utilisateur</h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Consultez l'historique des tickets créés par chaque utilisateur</p>
            </div>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 24
                }}>
                    {error}
                </div>
            )}

            {/* Search and Filter Section */}
            <div style={{ 
                background: 'white', 
                borderRadius: 16, 
                border: '1px solid #f1f5f9', 
                padding: '24px', 
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                    <Search size={20} style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#9ca3af' 
                    }} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, ID utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 44px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} style={{ color: '#6b7280' }} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'white',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="suspendu">Suspendu</option>
                    </select>
                </div>

                {/* Results Count */}
                <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                }}>
                    {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 100px', padding: '20px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
                    <div>ID</div>
                    <div>Utilisateur</div>
                    <div>Email</div>
                    <div>Rôle</div>
                    <div>Statut</div>
                    <div>Tickets</div>
                    <div>Actions</div>
                </div>
                <div>
                    {filteredUsers.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                            {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur ne correspond aux critères de recherche'}
                        </div>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <React.Fragment key={user.id_user}>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 100px', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{String(user.id_user).padStart(5, '0')}</div>
                                    <div>{user.full_name || '—'}</div>
                                    <div>{user.email || '—'}</div>
                                    <div>{user.role_name || '—'}</div>
                                    <div>
                                        <span style={{ padding: '4px 10px', borderRadius: 10, background: user.is_active ? '#d1fae5' : '#f3f4f6', color: user.is_active ? '#065f46' : '#374151', fontSize: 12, fontWeight: 600 }}>
                                            {user.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{user.tickets_count}</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            title={expandedUser === user.id_user ? "Masquer l'historique" : "Voir l'historique"}
                                            onClick={() => handleToggleUserHistory(user)}
                                            onMouseEnter={(e) => { e.target.style.background = '#3b82f6'; }}
                                            onMouseLeave={(e) => { e.target.style.background = '#111827'; }}
                                            style={{
                                                padding: 8,
                                                width: 32,
                                                height: 32,
                                                background: '#111827',
                                                color: 'white',
                                                border: 0,
                                                borderRadius: 6,
                                                display: 'grid',
                                                placeItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {expandedUser === user.id_user ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Expanded History Section */}
                                {expandedUser === user.id_user && (
                                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ padding: '20px 24px' }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                                                Historique des tickets de {user.full_name}
                                            </h3>
                                            {userTickets[user.id_user] ? (
                                                userTickets[user.id_user].length > 0 ? (
                                                    <div style={{ display: 'grid', gap: 12 }}>
                                                        {userTickets[user.id_user].map((ticket) => (
                                                            <div key={ticket.id} style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                                                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{ticket.titre}</h4>
                                                                    <span style={{ 
                                                                        padding: '2px 8px', 
                                                                        borderRadius: 6, 
                                                                        fontSize: 11, 
                                                                        fontWeight: 600,
                                                                        background: ticket.status === 'ferme' || ticket.status === 'resolu' ? '#d1fae5' : ticket.status === 'en_cours' ? '#fef3c7' : '#fee2e2',
                                                                        color: ticket.status === 'ferme' || ticket.status === 'resolu' ? '#065f46' : ticket.status === 'en_cours' ? '#92400e' : '#991b1b'
                                                                    }}>
                                                                        {ticket.status}
                                                                    </span>
                                                                </div>
                                                                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px 0' }}>{ticket.description}</p>
                                                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                                                                    <span>Priorité: {ticket.priorite}</span>
                                                                    <span>Créé: {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                                                                    {ticket.equipement && <span>Équipement: {ticket.equipement.numero_serie}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Aucun ticket trouvé pour cet utilisateur</p>
                                                )
                                            ) : (
                                                <div style={{ color: '#6b7280' }}>Chargement des tickets...</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>

        </>
    );
};

export default UserHistoryPage;
