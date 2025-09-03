// components/pages/TicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Check, Eye } from 'lucide-react';

const TicketsPage = ({ tickets, loading, onRefresh, user }) => {
    const [filteredTickets, setFilteredTickets] = useState(tickets);
    const [filters, setFilters] = useState({
        date: '',
        orderType: '',
        orderStatus: ''
    });
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // États pour la création de ticket
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [showEquipmentList, setShowEquipmentList] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [userEquipments, setUserEquipments] = useState([]);
    const [loadingEquipments, setLoadingEquipments] = useState(false);
    // Vue détail (lecture seule)
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTicketForView, setSelectedTicketForView] = useState(null);

    // États pour le formulaire de création
    const [formData, setFormData] = useState({
        problemType: [],
        problemDetails: [],
        description: ''
    });
    const [showProblemTypeModal, setShowProblemTypeModal] = useState(false);
    const [showProblemDetailsModal, setShowProblemDetailsModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Problem type categories
    const problemTypes = [
        'SOFTWARE', 'HARDWARE', 'RESEAU', 'TECHNIQUE',
        'Materiel', 'Périphérique', 'Autre', 'Système'
    ];

    // Problem details based on selected types
    const problemDetails = {
        SOFTWARE: ['APPLICATION', 'WINDOWS', 'AFFICHAGE', 'Connexion', 'Crash', 'Permissions', 'Virus', 'Autre'],
        HARDWARE: ['Écran', 'Clavier', 'Souris', 'Imprimante', 'Scanner', 'Autre'],
        RESEAU: ['Connexion', 'Vitesse', 'Câble', 'WiFi', 'Autre'],
        TECHNIQUE: ['Installation', 'Configuration', 'Maintenance', 'Autre'],
        Materiel: ['Écran', 'Clavier', 'Souris', 'Imprimante', 'Scanner', 'Autre'],
        Périphérique: ['USB', 'HDMI', 'VGA', 'Autre'],
        Autre: ['Autre problème', 'Non spécifié'],
        Système: ['Démarrage', 'Arrêt', 'Performance', 'Autre']
    };

    // Charger les équipements de l'utilisateur
        const fetchUserEquipments = async () => {
            const currentUserId = user?.id_user ?? user?.id;
            if (!currentUserId) {
                console.error('Utilisateur non connecté');
                return;
            }

            setLoadingEquipments(true);
            try {
                const response = await fetch(`http://localhost:8000/api/equipements/user/${currentUserId}`);
                if (response.ok) {
                    const data = await response.json();
                    const list = data.data || data;
                    // Exclure les équipements qui ont déjà un ticket non clos (ouvert/en_attente/en_cours)
                    const openStatuses = new Set(['ouvert', 'en_attente', 'en_cours']);
                    const blockedSerials = new Set(
                        (tickets || [])
                            .filter((t) => openStatuses.has(t.status))
                            .map((t) => t.equipement_id)
                    );
                    const filtered = Array.isArray(list)
                        ? list.filter((eq) => !blockedSerials.has(eq.numero_serie))
                        : [];
                    setUserEquipments(filtered);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des équipements:', error);
            } finally {
                setLoadingEquipments(false);
            }
        };

        // Charger les équipements quand l'utilisateur est disponible
        useEffect(() => {
            const currentUserId = user?.id_user ?? user?.id;
            if (currentUserId) {
                fetchUserEquipments();
            }
        }, [user?.id, user?.id_user, tickets]);

    // Appliquer les filtres quand les tickets ou filtres changent
    useEffect(() => {
        applyFilters();
    }, [tickets, filters]);

    const applyFilters = () => {
        let filtered = [...tickets];

        // Filtre par date
        if (filters.date) {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            switch (filters.date) {
                case 'today':
                    filtered = filtered.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfDay;
                    });
                    break;
                case 'week':
                    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
                    filtered = filtered.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfWeek;
                    });
                    break;
                case 'month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    filtered = filtered.filter(ticket => {
                        const ticketDate = new Date(ticket.date_creation);
                        return ticketDate >= startOfMonth;
                    });
                    break;
            }
        }

        // Filtre par type d'ordre (catégorie)
        if (filters.orderType) {
            filtered = filtered.filter(ticket => {
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
            filtered = filtered.filter(ticket =>
                ticket.status === filters.orderStatus
            );
        }

        setFilteredTickets(filtered);
        setCurrentPage(1); // Reset to first page when filters change
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
        setCurrentPage(1);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTickets = filteredTickets.slice(startIndex, endIndex);
    const showPagination = filteredTickets.length > itemsPerPage;

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Form handlers
    const handleProblemTypeSelect = (type) => {
        setFormData(prev => ({
            ...prev,
            problemType: prev.problemType.includes(type)
                ? prev.problemType.filter(t => t !== type)
                : [...prev.problemType, type]
        }));
    };

    const handleProblemDetailsSelect = (detail) => {
        setFormData(prev => ({
            ...prev,
            problemDetails: prev.problemDetails.includes(detail)
                ? prev.problemDetails.filter(d => d !== detail)
                : [...prev.problemDetails, detail]
        }));
    };

    const handleSubmitTicket = async () => {
        if (!formData.problemType.length || !formData.description.trim()) {
            alert('Veuillez sélectionner au moins un type de problème et ajouter une description.');
            return;
        }

                setIsSubmitting(true);

        // Combine all problem information into the description
        const fullDescription = `Types de problème: ${formData.problemType.join(', ')}\n\nDétails: ${formData.problemDetails.join(', ')}\n\nDescription: ${formData.description}`;

        // Check if equipment already has an open ticket
        const existingTicket = tickets.find(ticket =>
            ticket.equipement_id === selectedEquipment.numero_serie &&
            ['ouvert', 'en_attente', 'en_cours'].includes(ticket.status)
        );

        if (existingTicket) {
            alert(`Cet équipement a déjà un ticket en cours (ID: ${existingTicket.id}). Veuillez attendre la résolution du ticket existant.`);
            return;
        }

        const equipmentTitle = `${selectedEquipment.type_equipement?.nom_type ? selectedEquipment.type_equipement.nom_type + ' - ' : ''}${selectedEquipment.modele || ''}`.trim() || `${selectedEquipment.marque} ${selectedEquipment.modele}`;
        const ticketData = {
            titre: equipmentTitle,
            description: fullDescription,
            priorite: 'normale',
            categorie_id: 1, // Default category
            equipement_id: selectedEquipment.numero_serie,
            user_id: (user?.id_user ?? user?.id) // Use the correct field name
        };

        try {

            console.log('Envoi des données:', ticketData);
            const response = await fetch('http://localhost:8000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(ticketData)
            });

            console.log('Réponse reçue:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('Ticket créé avec succès:', result);

                // Close the ticket creation modal first
                setShowCreateTicket(false);
                setFormData({ problemType: [], problemDetails: [], description: '' });
                setSelectedEquipment(null);

                // Show confirmation popup
                setShowConfirmation(true);

                // Refresh the tickets list
                onRefresh();

                // Auto-close confirmation after 3 seconds
                setTimeout(() => {
                    setShowConfirmation(false);
                }, 3000);
            } else {
                const errorData = await response.json();
                console.error('Erreur API:', errorData);
                throw new Error(errorData.message || 'Erreur lors de la création du ticket');
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            console.error('Données envoyées:', ticketData);
            alert('Erreur lors de la création du ticket. Veuillez réessayer. Erreur: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            'resolu': { backgroundColor: '#d1fae5', color: '#065f46', text: 'Résolu' },
            'ferme': { backgroundColor: '#d1fae5', color: '#065f46', text: 'Fermé' },
            'en_cours': { backgroundColor: '#e0e7ff', color: '#3730a3', text: 'En Cours' },
            'en_attente': { backgroundColor: '#fef3c7', color: '#92400e', text: 'En Attente' },
            'ouvert': { backgroundColor: '#fef2f2', color: '#991b1b', text: 'Ouvert' },
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

    return (
        <>
            <div style={{marginBottom: '40px'}}>
                <h1 style={{fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px'}}>
                    Détails des Tickets
                </h1>
                <p style={{fontSize: '16px', color: '#64748b'}}>
                    Gérez vos demandes de maintenance
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
                    <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{color: 'white', fontSize: '12px', fontWeight: '600'}}>🔍</span>
                    </div>
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
                    <option value="resolu">Completer</option>
                    <option value="en_cours">En Prosses</option>
                    <option value="ouvert">Pas encore</option>
                    <option value="en_attente">En Attente</option>
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
                    🔄 Reset Filter
                </button>

                <button
                    onClick={() => setShowEquipmentList(true)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
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
                    <Plus size={16} />
                    Créer un ticket
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
                {loading ? (
                    <div style={{
                        padding: '80px',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        }}></div>
                        Chargement des tickets...
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 140px 140px 120px 100px 90px',
                            padding: '20px 24px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }}>
                            <div>ID</div>
                            <div>Equipement</div>
                            <div>Technicien</div>
                            <div>Date du Ticket</div>
                            <div>Type</div>
                            <div>Status</div>
                            <div>Operation</div>
                        </div>

                        {/* Table Body */}
                        <div>
                            {filteredTickets.length === 0 ? (
                                <div style={{
                                    padding: '60px 24px',
                                    textAlign: 'center',
                                    color: '#64748b'
                                }}>
                                    <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
                                        Aucun ticket trouvé
                                    </div>
                                    <div style={{fontSize: '14px'}}>
                                        Vous n'avez aucun ticket pour le moment
                                    </div>
                                </div>
                            ) : (
                                currentTickets.map((ticket, index) => (
                                    <div
                                        key={ticket.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '80px 1fr 140px 140px 120px 100px 90px',
                                            padding: '20px 24px',
                                            borderBottom: index < currentTickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            alignItems: 'center',
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{fontSize: '14px', fontWeight: '600', color: '#6b7280'}}>
                                            #{ticket.id}
                                        </div>
                                        <div>
                                            <div style={{fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px'}}>
                                                {ticket.equipement?.type_equipement?.nom_type || 'N/A'} - {ticket.equipement?.modele || 'N/A'}
                                            </div>
                                            <div style={{fontSize: '12px', color: '#6b7280'}}>
                                                {ticket.equipement?.localisation || 'Localisation inconnue'}
                                            </div>
                                        </div>
                                        <div style={{fontSize: '14px', color: '#374151'}}>
                                            {ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : 'Non assigné'}
                                        </div>
                                        <div style={{fontSize: '14px', color: '#6b7280'}}>
                                            {formatDate(ticket.date_creation)}
                                        </div>
                                        <div style={{fontSize: '14px', color: '#374151'}}>
                                            {ticket.categorie?.nom || 'N/A'}
                                        </div>
                                        <div>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <div>
                                            <button
                                                style={{
                                                    padding: '8px', backgroundColor: '#000000', color: 'white', border: 'none',
                                                    borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', width: '32px', height: '32px'
                                                }}
                                                title="Voir les détails"
                                                onClick={() => { setSelectedTicketForView(ticket); setShowDetailsModal(true); }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {showPagination && (
                            <div style={{
                                padding: '20px 24px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc'
                            }}>
                                <div style={{fontSize: '14px', color: '#6b7280'}}>
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            color: currentPage === 1 ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        &lt;
                                    </button>
                                    <span style={{fontSize: '14px', color: '#374151', padding: '0 8px'}}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            color: currentPage === totalPages ? '#9ca3af' : '#374151'
                                        }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de création de ticket */}
            {showCreateTicket && selectedEquipment && (
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
                        borderRadius: '20px',
                        padding: '32px',
                        maxWidth: '1200px',
                        width: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px',
                            borderBottom: '2px solid #f3f4f6',
                            paddingBottom: '16px'
                        }}>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Création de votre Ticket
                            </h1>
                            <button
                                onClick={() => {
                                    setShowCreateTicket(false);
                                    setSelectedEquipment(null);
                                    setFormData({ problemType: [], problemDetails: [], description: '' });
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '8px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '32px' }}>
                            {/* Left Column - Form */}
                            <div style={{ flex: '1' }}>
                                {/* Equipment Selection */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '2px solid #e2e8f0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '4px'
                                            }}>
                                                Équipement sélectionné
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280'
                                            }}>
                                                {selectedEquipment.marque} {selectedEquipment.modele}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '4px 12px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {selectedEquipment.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Problem Type Selection */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '2px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowProblemTypeModal(true)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '4px'
                                            }}>
                                                Sélectionner le type de problème
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280'
                                            }}>
                                                {formData.problemType.length > 0
                                                    ? formData.problemType.join(', ')
                                                    : 'Cliquez pour sélectionner'
                                                }
                                            </div>
                                        </div>
                                        <div style={{ color: '#3b82f6' }}>→</div>
                                    </div>
                                </div>

                                {/* Problem Details Selection */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '2px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowProblemDetailsModal(true)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '4px'
                                            }}>
                                                Sélectionner les détails du problème
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280'
                                            }}>
                                                {formData.problemDetails.length > 0
                                                    ? formData.problemDetails.join(', ')
                                                    : 'Cliquez pour sélectionner'
                                                }
                                            </div>
                                        </div>
                                        <div style={{ color: '#3b82f6' }}>→</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '2px solid #e2e8f0'
                                }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '12px'
                                    }}>
                                        Décrivez votre problème !
                                    </div>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                        placeholder="Description..."
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            maxHeight: '200px',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            overflow: 'auto'
                                        }}
                                        maxLength={500}
                                    />
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginTop: '8px'
                                    }}>
                                        *Ne dépassez pas 500 mots. ({formData.description.length}/500)
                                    </div>
                                </div>


                            </div>

                            {/* Right Column - Summary */}
                            <div style={{ flex: '1' }}>
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '2px solid #e2e8f0',
                                    height: 'fit-content'
                                }}>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '20px'
                                    }}>
                                        Détails du Ticket
                                    </h3>

                                    {/* Problem Types */}
                                    {formData.problemType.length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Types de problème:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {formData.problemType.map((type, index) => (
                                                    <span key={index} style={{
                                                        backgroundColor: '#3b82f6',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Problem Details */}
                                    {formData.problemDetails.length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Détails:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {formData.problemDetails.map((detail, index) => (
                                                    <span key={index} style={{
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {detail}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {formData.description && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }}>
                                                Description:
                                            </div>
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                color: '#374151',
                                                lineHeight: '1.5',
                                                wordWrap: 'break-word',
                                                whiteSpace: 'pre-wrap',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                maxWidth: '100%',
                                                overflow: 'hidden'
                                            }}>
                                                {formData.description}
                                            </div>
                                        </div>
                                    )}



                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmitTicket}
                                        disabled={isSubmitting || !formData.problemType.length || !formData.description.trim()}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            backgroundColor: isSubmitting || !formData.problemType.length || !formData.description.trim()
                                                ? '#9ca3af'
                                                : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: isSubmitting || !formData.problemType.length || !formData.description.trim()
                                                ? 'not-allowed'
                                                : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isSubmitting ? 'Création en cours...' : 'Confirmer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Détails (lecture seule) */}
            {showDetailsModal && selectedTicketForView && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
                }}>
                    <div style={{
                        background: 'white', width: '96%', maxWidth: 900, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        {/* Header */}
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 40, height: 40, borderRadius: 10, background: '#111827', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700}}>
                                    {selectedTicketForView?.equipement?.modele?.slice(0,2)?.toUpperCase() || 'TK'}
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, color: '#111827'}}>{selectedTicketForView.equipement?.type_equipement?.nom_type || 'Équipement'} - {selectedTicketForView.equipement?.modele || ''}</div>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Ticket #{String(selectedTicketForView.id).padStart(5,'0')} • {formatDate(selectedTicketForView.date_creation)}</div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white'}}>Fermer</button>
                        </div>

                        {/* Body */}
                        <div style={{display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24, padding: 24}}>
                            {/* Left: Comments + People */}
                            <div>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                                    <div>
                                        <div style={{fontWeight: 600, color: '#111827', marginBottom: 6}}>Problème de l’utilisateur</div>
                                        <div style={{minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%', overflow: 'hidden'}}>
                                            {selectedTicketForView.description || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{fontWeight: 600, color: '#111827', marginBottom: 6}}>Commentaire du technicien</div>
                                        <div style={{minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%', overflow: 'hidden'}}>
                                            {selectedTicketForView.commentaire_resolution || '—'}
                                        </div>
                                    </div>
                                </div>
                                {/* People cards under comments */}
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16}}>
                                    <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                        <div style={{fontSize: 12, color: '#6b7280'}}>Utilisateur</div>
                                        <div style={{marginTop: 6, color: '#111827'}}>{selectedTicketForView.user ? `${selectedTicketForView.user.prenom} ${selectedTicketForView.user.nom}` : 'N/A'}</div>
                                    </div>
                                    <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                        <div style={{fontSize: 12, color: '#6b7280'}}>Technicien</div>
                                        <div style={{marginTop: 6, color: '#111827'}}>{selectedTicketForView.technicien ? `${selectedTicketForView.technicien.prenom} ${selectedTicketForView.technicien.nom}` : 'Non assigné'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Meta */}
                            <div style={{display: 'grid', gap: 12}}>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Statut</div>
                                    <div style={{marginTop: 6}}>{getStatusBadge(selectedTicketForView.status)}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Priorité</div>
                                    <div style={{marginTop: 6}}>{selectedTicketForView.priorite || '—'}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Catégorie</div>
                                    <div style={{marginTop: 6, color: '#111827'}}>{selectedTicketForView.categorie?.nom || 'N/A'}</div>
                                </div>
                                <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 14}}>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>Numéro de série</div>
                                    <div style={{marginTop: 6, color: '#111827'}}>{selectedTicketForView.equipement_id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de sélection d'équipement */}
            {showEquipmentList && (
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
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Sélectionner un équipement
                            </h2>
                            <button
                                onClick={() => setShowEquipmentList(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {loadingEquipments ? (
                            <div style={{textAlign: 'center', padding: '40px'}}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '3px solid #e5e7eb',
                                    borderTop: '3px solid #3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px'
                                }}></div>
                                Chargement des équipements...
                            </div>
                        ) : (
                            <div>
                                {userEquipments.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#6b7280'
                                    }}>
                                        <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
                                            Aucun équipement assigné
                                        </div>
                                        <div style={{fontSize: '14px'}}>
                                            Vous n'avez aucun équipement assigné pour le moment
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gap: '16px'
                                    }}>
                                        {userEquipments.map((equipment) => (
                                            <div
                                                key={equipment.numero_serie}
                                                onClick={() => {
                                                    setSelectedEquipment(equipment);
                                                    setShowEquipmentList(false);
                                                    setShowCreateTicket(true);
                                                }}
                                                style={{
                                                    padding: '20px',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: '#f9fafb'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div>
                                                        <div style={{
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: '#1f2937',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {equipment.type_equipement?.nom_type || 'Type inconnu'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: '#374151',
                                                            marginBottom: '8px'
                                                        }}>
                                                            {equipment.marque} {equipment.modele}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        backgroundColor: equipment.status === 'Actif' ? '#10b981' : '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {equipment.status}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '12px',
                                                    fontSize: '14px',
                                                    color: '#6b7280'
                                                }}>
                                                    <div>
                                                        <strong>Série:</strong> {equipment.numero_serie}
                                                    </div>
                                                    <div>
                                                        <strong>Localisation:</strong> {equipment.localisation}
                                                    </div>
                                                    <div>
                                                        <strong>OS:</strong> {equipment.os || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Installation:</strong> {new Date(equipment.date_installation).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Problem Type Modal */}
            {showProblemTypeModal && (
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
                    zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Sélectionner le type de problème
                            </h2>
                            <button
                                onClick={() => setShowProblemTypeModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            {problemTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleProblemTypeSelect(type)}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: formData.problemType.includes(type)
                                            ? '#3b82f6'
                                            : '#f3f4f6',
                                        color: formData.problemType.includes(type)
                                            ? 'white'
                                            : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '20px'
                        }}>
                            *Vous avez la possibilité de choix multiples
                        </div>

                        <button
                            onClick={() => setShowProblemTypeModal(false)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            )}

            {/* Problem Details Modal */}
            {showProblemDetailsModal && (
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
                    zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Sélectionner les détails du problème
                            </h2>
                            <button
                                onClick={() => setShowProblemDetailsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            {Object.values(problemDetails).flat().filter((detail, index, arr) => arr.indexOf(detail) === index).map((detail) => (
                                <button
                                    key={detail}
                                    onClick={() => handleProblemDetailsSelect(detail)}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: formData.problemDetails.includes(detail)
                                            ? '#10b981'
                                            : '#f3f4f6',
                                        color: formData.problemDetails.includes(detail)
                                            ? 'white'
                                            : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {detail}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '20px'
                        }}>
                            *Vous avez la possibilité de choix multiples
                        </div>

                        <button
                            onClick={() => setShowProblemDetailsModal(false)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Popup */}
            {showConfirmation && (
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
                    zIndex: 1200
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Check size={32} color="white" />
                        </div>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '12px'
                        }}>
                            ✅ Ticket créé avec succès !
                        </h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            marginBottom: '20px'
                        }}>
                            Votre ticket a été créé et enregistré dans le système. L'équipe technique sera notifiée et prendra en charge votre demande.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketsPage;
