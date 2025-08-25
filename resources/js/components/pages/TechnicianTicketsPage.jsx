// components/pages/TechnicianTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Eye, Hand, Search, Filter, RefreshCw } from 'lucide-react';
import { ticketService } from '../../services/apiService';

const TechnicianTicketsPage = ({ user }) => {
    const [tickets, setTickets] = useState([]);
    const [allTickets, setAllTickets] = useState([]); // Stocker tous les tickets
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        date: '',
        orderType: '',
        orderStatus: ''
    });

    // États pour les popups
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        priorite: '',
        commentaire_resolution: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    // Appliquer les filtres quand ils changent
    useEffect(() => {
        applyFilters();
    }, [filters, allTickets]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupérer tous les tickets (pour le technicien, on affiche tous les tickets)
            const result = await ticketService.getAllTickets();
            setAllTickets(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filteredTickets = [...allTickets];

        // Filtre par date
        if (filters.date) {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            switch (filters.date) {
                case 'today':
                    filteredTickets = filteredTickets.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfDay;
                    });
                    break;
                case 'week':
                    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
                    filteredTickets = filteredTickets.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfWeek;
                    });
                    break;
                case 'month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    filteredTickets = filteredTickets.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfMonth;
                    });
                    break;
            }
        }

        // Filtre par type d'ordre (catégorie)
        if (filters.orderType) {
            filteredTickets = filteredTickets.filter(ticket => {
                const categoryName = ticket.categorie?.nom?.toLowerCase() || '';
                switch (filters.orderType) {
                    case 'hardware':
                        return categoryName.includes('matériel') || categoryName.includes('hardware');
                    case 'software':
                        return categoryName.includes('logiciel') || categoryName.includes('software');
                    case 'network':
                        return categoryName.includes('réseau') || categoryName.includes('network');
                    default:
                        return true;
                }
            });
        }

        // Filtre par statut
        if (filters.orderStatus) {
            filteredTickets = filteredTickets.filter(ticket =>
                ticket.status === filters.orderStatus
            );
        }

        setTickets(filteredTickets);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            'ouvert': { backgroundColor: '#fee2e2', color: '#991b1b', text: 'Ouvert' },
            'en_attente': { backgroundColor: '#fef3c7', color: '#92400e', text: 'En Attente' },
            'en_cours': { backgroundColor: '#dbeafe', color: '#1e40af', text: 'En Cours' },
            'resolu': { backgroundColor: '#d1fae5', color: '#065f46', text: 'Résolu' },
            'ferme': { backgroundColor: '#f3f4f6', color: '#6b7280', text: 'Fermé' },
            'annule': { backgroundColor: '#f3f4f6', color: '#6b7280', text: 'Annulé' }
        };

        const style = statusStyles[status] || { backgroundColor: '#f3f4f6', color: '#374151', text: status };

        return (
            <div style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: style.backgroundColor,
                color: style.color,
                display: 'inline-block'
            }}>
                {style.text}
            </div>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityStyles = {
            'critique': { backgroundColor: '#fef2f2', color: '#991b1b', text: 'Elevée' },
            'haute': { backgroundColor: '#fef3c7', color: '#92400e', text: 'Moyenne' },
            'normale': { backgroundColor: '#d1fae5', color: '#065f46', text: 'Normale' },
            'basse': { backgroundColor: '#f3f4f6', color: '#6b7280', text: 'Basse' }
        };

        const style = priorityStyles[priority] || { backgroundColor: '#f3f4f6', color: '#374151', text: priority };

        return (
            <div style={{
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: style.backgroundColor,
                color: style.color,
                display: 'inline-block'
            }}>
                {style.text}
            </div>
        );
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            date: '',
            orderType: '',
            orderStatus: ''
        });
    };

    const handleTakeTicket = async (ticket) => {
        try {
            // Vérifier si le ticket est déjà assigné
            const response = await ticketService.checkTicketAssignment(ticket.id);

            if (response.success) {
                if (response.isAssigned) {
                    // Ticket déjà assigné - afficher popup d'erreur
                    setErrorMessage(`Ce ticket est déjà pris par ${response.assignedTechnician || 'un autre technicien'}`);
                    setShowErrorModal(true);
                } else {
                    // Ticket disponible - afficher popup de confirmation
                    setSelectedTicket(ticket);
                    setShowConfirmationModal(true);
                }
            } else {
                setErrorMessage('Erreur lors de la vérification du ticket');
                setShowErrorModal(true);
            }
        } catch (err) {
            setErrorMessage('Erreur lors de la vérification du ticket');
            setShowErrorModal(true);
        }
    };

    const confirmTakeTicket = async () => {
        try {
            const response = await ticketService.assignTicket(selectedTicket.id, (user?.id_user ?? user?.id));

            if (response.success) {
                // Rafraîchir la liste des tickets
                await fetchTickets();
                setShowConfirmationModal(false);
                setSelectedTicket(null);
            } else {
                setErrorMessage(response.message || 'Erreur lors de l\'assignation du ticket');
                setShowErrorModal(true);
                setShowConfirmationModal(false);
            }
        } catch (err) {
            setErrorMessage('Erreur lors de l\'assignation du ticket');
            setShowErrorModal(true);
            setShowConfirmationModal(false);
        }
    };

    const closeModals = () => {
        setShowConfirmationModal(false);
        setShowErrorModal(false);
        setSelectedTicket(null);
        setErrorMessage('');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{fontSize: '16px', color: '#64748b'}}>
                        Chargement des tickets...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    padding: '24px',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px'}}>
                        Erreur de chargement
                    </div>
                    <div style={{marginBottom: '16px', fontSize: '14px'}}>
                        {error}
                    </div>
                    <button
                        onClick={fetchTickets}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{marginBottom: '40px'}}>
                <h1 style={{fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px'}}>
                    Liste des Tickets
                </h1>
                <p style={{fontSize: '16px', color: '#64748b'}}>
                    Gérez et suivez tous les tickets de maintenance
                </p>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Filter size={20} style={{color: '#6b7280'}} />
                    <span style={{fontWeight: '600', color: '#374151'}}>Filter By</span>
                </div>

                <select
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        color: '#374151'
                    }}
                >
                    <option value="">Date</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                </select>

                <select
                    value={filters.orderType}
                    onChange={(e) => handleFilterChange('orderType', e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        color: '#374151'
                    }}
                >
                    <option value="">Order Type</option>
                    <option value="hardware">HARDWARE</option>
                    <option value="software">SOFTWARE</option>
                    <option value="network">NETWORK</option>
                </select>

                <select
                    value={filters.orderStatus}
                    onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        color: '#374151'
                    }}
                >
                    <option value="">Order Status</option>
                    <option value="resolu">Résolu</option>
                    <option value="en_cours">En cours</option>
                    <option value="ouvert">Ouvert</option>
                    <option value="en_attente">En attente</option>
                </select>

                <button
                    onClick={resetFilters}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <RefreshCw size={16} />
                    Reset Filter
                </button>
            </div>

            {/* Tickets Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid #f1f5f9'
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 120px 120px 120px 100px 100px 80px',
                    padding: '20px 24px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                }}>
                    <div>ID Ticket</div>
                    <div>Nom d'equipment</div>
                    <div>N/S</div>
                    <div>Technician</div>
                    <div>Date de creation</div>
                    <div>Utilisateur</div>
                    <div>STATUS</div>
                    <div>Categorie</div>
                    <div>Operation</div>
                </div>

                {/* Table Body */}
                <div>
                    {tickets.length === 0 ? (
                        <div style={{
                            padding: '60px 24px',
                            textAlign: 'center',
                            color: '#64748b'
                        }}>
                            <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
                                Aucun ticket trouvé
                            </div>
                            <div style={{fontSize: '14px'}}>
                                Aucun ticket disponible pour le moment
                            </div>
                        </div>
                    ) : (
                        tickets.map((ticket, index) => (
                            <div
                                key={ticket.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1fr 120px 120px 120px 120px 100px 100px 80px',
                                    padding: '20px 24px',
                                    borderBottom: index < tickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{fontSize: '14px', fontWeight: '600', color: '#6b7280'}}>
                                    {String(ticket.id).padStart(5, '0')}
                                </div>
                                <div>
                                    <div style={{fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px'}}>
                                        {ticket.equipement?.type_equipement?.nom_type || 'N/A'} - {ticket.equipement?.modele || 'N/A'}
                                    </div>
                                </div>
                                <div style={{fontSize: '14px', color: '#6b7280'}}>
                                    {ticket.equipement?.localisation || 'N/A'}
                                </div>
                                <div style={{fontSize: '14px', color: '#374151'}}>
                                    {ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : 'Non assigné'}
                                </div>
                                <div style={{fontSize: '14px', color: '#6b7280'}}>
                                    {formatDate(ticket.date_creation)}
                                </div>
                                <div style={{fontSize: '14px', color: '#374151'}}>
                                    {ticket.user ? `${ticket.user.prenom} ${ticket.user.nom}` : 'N/A'}
                                </div>
                                <div>
                                    {getStatusBadge(ticket.status)}
                                </div>
                                <div>
                                    {getPriorityBadge(ticket.priorite)}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#000000',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px'
                                        }}
                                        title="Voir les détails"
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setShowDetailsModal(true);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#000000',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px'
                                        }}
                                        title="Prendre en charge"
                                        onClick={() => handleTakeTicket(ticket)}
                                    >
                                        <Hand size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{fontSize: '14px', color: '#6b7280'}}>
                        Showing 1-{tickets.length} of {tickets.length}
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                    }}>
                        <button
                            style={{
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            &lt;
                        </button>
                        <button
                            style={{
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmationModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{color: '#065f46', fontSize: '20px'}}>✓</span>
                                </div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: 0
                                }}>
                                    Confirmer votre demande
                                </h3>
                            </div>
                            <button
                                onClick={closeModals}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <p style={{
                            color: '#6b7280',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            Êtes-vous sûr de vouloir prendre en charge ce ticket ?
                            Ticket #{selectedTicket?.id} - {selectedTicket?.titre}
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={closeModals}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmTakeTicket}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (read-only) */}
            {showDetailsModal && selectedTicket && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', width: '96%', maxWidth: 900, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        {/* Header */}
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 40, height: 40, borderRadius: 10, background: '#111827', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700}}>
                                    {selectedTicket?.equipement?.modele?.slice(0,2)?.toUpperCase() || 'TK'}
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, color: '#111827'}}>{selectedTicket.equipement?.type_equipement?.nom_type || 'Équipement'} - {selectedTicket.equipement?.modele || ''}</div>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Ticket #{String(selectedTicket.id).padStart(5,'0')} • {formatDate(selectedTicket.date_creation)}</div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white'}}>Fermer</button>
                        </div>

                        {/* Body */}
                        <div style={{display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24, padding: 24}}>
                            {/* Left: Comments + People */}
                            <div>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                                    {/* User comment (description) */}
                                    <div>
                                        <div style={{fontWeight: 600, color: '#111827', marginBottom: 6}}>Probléme de l’utilisateur</div>
                                        <div style={{minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151'}}>
                                            {selectedTicket.description || '—'}
                                        </div>
                                    </div>
                                    {/* Technician comment */}
                                    <div>
                                        <div style={{fontWeight: 600, color: '#111827', marginBottom: 6}}>Commentaire du technicien</div>
                                        <div style={{minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151'}}>
                                            {selectedTicket.commentaire_resolution || '—'}
                                        </div>
                                    </div>
                                </div>
                                {/* People cards under comments (design conforme à la maquette) */}
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16}}>
                                    <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                        <div style={{fontSize: 12, color: '#6b7280'}}>Utilisateur</div>
                                        <div style={{marginTop: 6, color: '#111827'}}>{selectedTicket.user ? `${selectedTicket.user.prenom} ${selectedTicket.user.nom}` : 'N/A'}</div>
                                    </div>
                                    <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                        <div style={{fontSize: 12, color: '#6b7280'}}>Technicien</div>
                                        <div style={{marginTop: 6, color: '#111827'}}>{selectedTicket.technicien ? `${selectedTicket.technicien.prenom} ${selectedTicket.technicien.nom}` : 'Non assigné'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Meta */}
                            <div style={{display: 'grid', gap: 12}}>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Statut</div>
                                    <div style={{marginTop: 6}}>{getStatusBadge(selectedTicket.status)}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Priorité</div>
                                    <div style={{marginTop: 6}}>{getPriorityBadge(selectedTicket.priorite)}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Catégorie</div>
                                    <div style={{marginTop: 6, color: '#111827'}}>{selectedTicket.categorie?.nom || 'N/A'}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Numéro de série</div>
                                    <div style={{marginTop: 6, color: '#111827'}}>{selectedTicket.equipement_id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '520px'
                    }}>
                        <h3 style={{marginTop: 0, marginBottom: '16px', color: '#111827'}}>Modifier le ticket</h3>

                        <div style={{display: 'grid', gap: '12px'}}>
                            <label style={{display: 'grid', gap: '6px'}}>
                                <span style={{fontSize: '12px', color: '#6b7280'}}>Statut</span>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm(prev => ({...prev, status: e.target.value}))}
                                    style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px'}}
                                >
                                    <option value="ouvert">Ouvert</option>
                                    <option value="en_attente">En attente</option>
                                    <option value="en_cours">En cours</option>
                                    <option value="resolu">Résolu</option>
                                    <option value="ferme">Fermé</option>
                                    <option value="annule">Annulé</option>
                                </select>
                            </label>

                            <label style={{display: 'grid', gap: '6px'}}>
                                <span style={{fontSize: '12px', color: '#6b7280'}}>Priorité</span>
                                <select
                                    value={editForm.priorite}
                                    onChange={(e) => setEditForm(prev => ({...prev, priorite: e.target.value}))}
                                    style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px'}}
                                >
                                    <option value="basse">Basse</option>
                                    <option value="normale">Normale</option>
                                    <option value="haute">Haute</option>
                                    <option value="critique">Critique</option>
                                </select>
                            </label>

                            <label style={{display: 'grid', gap: '6px'}}>
                                <span style={{fontSize: '12px', color: '#6b7280'}}>Commentaire</span>
                                <textarea
                                    rows={4}
                                    value={editForm.commentaire_resolution}
                                    onChange={(e) => setEditForm(prev => ({...prev, commentaire_resolution: e.target.value}))}
                                    style={{padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px'}}
                                />
                            </label>

                            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white'}}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={async () => {
                                        const payload = {
                                            status: editForm.status,
                                            priorite: editForm.priorite,
                                            commentaire_resolution: editForm.commentaire_resolution
                                        };
                                        const result = await ticketService.updateTicket(selectedTicket.id, payload);
                                        if (result.success) {
                                            setShowEditModal(false);
                                            await fetchTickets();
                                        } else {
                                            alert(result.message || 'Erreur lors de la mise à jour');
                                        }
                                    }}
                                    style={{padding: '8px 12px', borderRadius: '8px', background: '#111827', color: 'white', border: 'none'}}
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{color: '#6b7280', fontSize: '20px'}}>!</span>
                                </div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: 0
                                }}>
                                    Erreur
                                </h3>
                            </div>
                            <button
                                onClick={closeModals}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <p style={{
                            color: '#6b7280',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            {errorMessage}
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={closeModals}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Revenir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TechnicianTicketsPage;
