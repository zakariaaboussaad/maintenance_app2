import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import apiService from '../../services/apiService';

const EquipmentHistoryPage = () => {
    const [equipments, setEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedEquipment, setExpandedEquipment] = useState(null);
    const [equipmentIssues, setEquipmentIssues] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/history/equipments');
            if (response.success) {
                setEquipments(response.data);
                setFilteredEquipments(response.data);
            } else {
                setError('Erreur lors du chargement des équipements');
            }
        } catch (err) {
            console.error('Error fetching equipments:', err);
            setError('Erreur lors du chargement des équipements');
        } finally {
            setLoading(false);
        }
    };

    // Filter equipments based on search and filters
    useEffect(() => {
        let filtered = equipments;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(equipment =>
                equipment.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipment.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipment.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipment.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipment.modele?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(equipment => equipment.statut === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(equipment => equipment.type === typeFilter);
        }

        setFilteredEquipments(filtered);
    }, [equipments, searchTerm, statusFilter, typeFilter]);

    const handleToggleEquipmentHistory = async (equipment) => {
        const equipmentKey = equipment.id_equipement || equipment.numero_serie;
        if (expandedEquipment === equipmentKey) {
            setExpandedEquipment(null);
        } else {
            setExpandedEquipment(equipmentKey);
            // Fetch issues if not already loaded
            if (!equipmentIssues[equipmentKey]) {
                try {
                    const response = await apiService.get(`/history/equipments/${equipment.numero_serie}/issues`);
                    if (response.success) {
                        setEquipmentIssues(prev => ({
                            ...prev,
                            [equipmentKey]: response.data.issues
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching equipment issues:', err);
                }
            }
        }
    };

    if (loading) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;

    return (
        <>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Historique Équipement</h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Consultez l'historique des tickets et pannes pour chaque équipement</p>
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
                        placeholder="Rechercher par nom, série, localisation, marque..."
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
                        <option value="Actif">Actif</option>
                        <option value="Fonctionnel">Fonctionnel</option>
                        <option value="En panne">En panne</option>
                        <option value="En maintenance">En maintenance</option>
                    </select>
                </div>

                {/* Type Filter */}
                <div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
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
                        <option value="all">Tous les types</option>
                        <option value="Ordinateur portable">Ordinateur portable</option>
                        <option value="Ordinateur de bureau">Ordinateur de bureau</option>
                        <option value="Serveur">Serveur</option>
                        <option value="Imprimante">Imprimante</option>
                        <option value="Écran">Écran</option>
                        <option value="Autre">Autre</option>
                    </select>
                </div>

                {/* Results Count */}
                <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                }}>
                    {filteredEquipments.length} équipement{filteredEquipments.length !== 1 ? 's' : ''} trouvé{filteredEquipments.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 120px 100px', padding: '20px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
                    <div>ID</div>
                    <div>Équipement</div>
                    <div>Type</div>
                    <div>Localisation</div>
                    <div>Statut</div>
                    <div>Tickets</div>
                    <div>Pannes</div>
                    <div>Actions</div>
                </div>
                <div>
                    {filteredEquipments.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                            {equipments.length === 0 ? 'Aucun équipement trouvé' : 'Aucun équipement ne correspond aux critères de recherche'}
                        </div>
                    ) : (
                        filteredEquipments.map((equipment, index) => (
                            <React.Fragment key={equipment.id_equipement || equipment.numero_serie || index}>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 120px 100px', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{String(equipment.id_equipement || equipment.numero_serie).padStart(5, '0')}</div>
                                    <div>{equipment.nom || '—'}</div>
                                    <div>{equipment.type || '—'}</div>
                                    <div>{equipment.localisation || '—'}</div>
                                    <div>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: 10, 
                                            background: equipment.statut === 'Fonctionnel' || equipment.statut === 'Actif' ? '#d1fae5' : 
                                                       equipment.statut === 'En panne' ? '#fecaca' :
                                                       equipment.statut === 'En maintenance' ? '#fef3c7' : '#f3f4f6',
                                            color: equipment.statut === 'Fonctionnel' || equipment.statut === 'Actif' ? '#065f46' : 
                                                   equipment.statut === 'En panne' ? '#991b1b' :
                                                   equipment.statut === 'En maintenance' ? '#92400e' : '#374151',
                                            fontSize: 12, 
                                            fontWeight: 600 
                                        }}>
                                            {equipment.statut || 'Inconnu'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{equipment.tickets_count}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>{equipment.pannes_count}</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            title={expandedEquipment === (equipment.id_equipement || equipment.numero_serie) ? "Masquer l'historique" : "Voir l'historique"}
                                            onClick={() => handleToggleEquipmentHistory(equipment)}
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
                                            {expandedEquipment === (equipment.id_equipement || equipment.numero_serie) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Expanded History Section */}
                                {expandedEquipment === (equipment.id_equipement || equipment.numero_serie) && (
                                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ padding: '20px 24px' }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                                                Historique de {equipment.nom} ({equipment.numero_serie})
                                            </h3>
                                            {equipmentIssues[equipment.id_equipement || equipment.numero_serie] ? (
                                                equipmentIssues[equipment.id_equipement || equipment.numero_serie].length > 0 ? (
                                                    <div style={{ display: 'grid', gap: 12 }}>
                                                        {equipmentIssues[equipment.id_equipement || equipment.numero_serie].map((issue) => (
                                                            <div key={`${issue.type}-${issue.id}`} style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{issue.titre}</h4>
                                                                        <span style={{ 
                                                                            padding: '2px 6px', 
                                                                            borderRadius: 4, 
                                                                            fontSize: 10, 
                                                                            fontWeight: 600,
                                                                            background: issue.type === 'ticket' ? '#dbeafe' : '#fef3c7',
                                                                            color: issue.type === 'ticket' ? '#1e40af' : '#92400e'
                                                                        }}>
                                                                            {issue.type.toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <span style={{ 
                                                                        padding: '2px 8px', 
                                                                        borderRadius: 6, 
                                                                        fontSize: 11, 
                                                                        fontWeight: 600,
                                                                        background: issue.status === 'ferme' || issue.status === 'resolu' ? '#d1fae5' : 
                                                                                   issue.status === 'en_cours' ? '#fef3c7' : '#fee2e2',
                                                                        color: issue.status === 'ferme' || issue.status === 'resolu' ? '#065f46' : 
                                                                               issue.status === 'en_cours' ? '#92400e' : '#991b1b'
                                                                    }}>
                                                                        {issue.status}
                                                                    </span>
                                                                </div>
                                                                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px 0' }}>{issue.description}</p>
                                                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                                                                    <span>Priorité: {issue.priorite}</span>
                                                                    <span>Créé: {new Date(issue.created_at).toLocaleDateString('fr-FR')}</span>
                                                                    {issue.user && <span>Par: {issue.user.full_name}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Aucun problème trouvé pour cet équipement</p>
                                                )
                                            ) : (
                                                <div style={{ color: '#6b7280' }}>Chargement de l'historique...</div>
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

export default EquipmentHistoryPage;
