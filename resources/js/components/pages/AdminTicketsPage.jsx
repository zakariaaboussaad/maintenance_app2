// components/pages/AdminTicketsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Eye, UserPlus, Filter, RefreshCw, Hand } from 'lucide-react';
import { ticketService, userService } from '../../services/apiService';

const AdminTicketsPage = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ date: '', orderType: '', orderStatus: '' });

  // assignment modal state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allTickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ticketService.getAllTickets();
      setAllTickets(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let items = [...allTickets];
    if (filters.date) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (filters.date === 'today') {
        items = items.filter(t => new Date(t.date_creation) >= startOfDay);
      } else if (filters.date === 'week') {
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        items = items.filter(t => new Date(t.date_creation) >= startOfWeek);
      } else if (filters.date === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        items = items.filter(t => new Date(t.date_creation) >= startOfMonth);
      }
    }
    if (filters.orderType) {
      items = items.filter(ticket => {
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
    if (filters.orderStatus) {
      items = items.filter(t => t.status === filters.orderStatus);
    }
    setTickets(items);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const date = new Date(d);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      resolu: { bg: '#d1fae5', color: '#065f46', text: 'Résolu' },
      ferme: { bg: '#e5e7eb', color: '#374151', text: 'Fermé' },
      en_cours: { bg: '#e0e7ff', color: '#3730a3', text: 'En cours' },
      en_attente: { bg: '#fef3c7', color: '#92400e', text: 'En attente' },
      ouvert: { bg: '#fee2e2', color: '#991b1b', text: 'Ouvert' },
      annule: { bg: '#f3f4f6', color: '#6b7280', text: 'Annulé' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#374151', text: status };
    return (
      <div style={{
        padding: '4px 12px',
        borderRadius: 12,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-block',  // Add this
        width: 'fit-content'      // Add this
      }}>
        {s.text}
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const map = {
      critique: { bg: '#fef2f2', color: '#991b1b', text: 'Elevée' },
      haute: { bg: '#fef3c7', color: '#92400e', text: 'Moyenne' },
      normale: { bg: '#d1fae5', color: '#065f46', text: 'Normale' },
      basse: { bg: '#f3f4f6', color: '#6b7280', text: 'Basse' },
    };
    const s = map[priority] || { bg: '#f3f4f6', color: '#374151', text: priority };
    return (
      <div style={{
        padding: '4px 8px',
        borderRadius: 8,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        display: 'inline-block',  // Add this
        width: 'fit-content'      // Add this
      }}>
        {s.text}
      </div>
    );
  };
  const openAssignDialog = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      const result = await userService.getTechnicians();
      if (result.success) {
        // exclude current technician if exists
        const excludeId = ticket?.technicien?.id_user || ticket?.technicien?.id;
        let list = result.data.filter(t => (t.id_user || t.id) !== excludeId);

        // Ajouter l'admin à la liste s'il n'est pas déjà assigné
        const adminId = user?.id_user || user?.id;
        if (adminId !== excludeId) {
          const adminTechnician = {
            id_user: adminId,
            id: adminId,
            prenom: user?.prenom || 'System',
            nom: user?.nom || 'Admin',
            name: `${user?.prenom || 'System'} ${user?.nom || 'Admin'}`
          };
          list = [adminTechnician, ...list]; // Ajouter l'admin en premier
        }

        setTechnicians(list);
        setSelectedTechnicianId('');
        // If already assigned, ask confirmation first
        if (ticket.technicien) {
          setConfirmOpen(true);
        } else {
          setAssignDialogOpen(true);
        }
      } else {
        setMessage(result.message || 'Impossible de récupérer les techniciens');
      }
    } catch (e) {
      setMessage('Erreur lors du chargement des techniciens');
    }
  };

  const handleTakeTicket = async (ticket) => {
    try {
      // Check if ticket is already assigned
      const response = await ticketService.checkTicketAssignment(ticket.id);

      if (response.success) {
        if (response.isAssigned) {
          // Ticket already assigned - show error popup
          setErrorMessage(`Ce ticket est déjà pris par ${response.assignedTechnician || 'un autre technicien'}`);
          setShowErrorModal(true);
        } else {
          // Ticket available - show confirmation popup
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
        // Refresh ticket list
        await fetchTickets();
        setShowConfirmationModal(false);
        setSelectedTicket(null);
        setMessage('Ticket pris en charge avec succès');
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

  // Fonction corrigée pour confirmer le changement de technicien
  const handleConfirmChange = () => {
    setConfirmOpen(false);
    // Attendre un peu avant d'ouvrir la nouvelle modal pour éviter les conflits
    setTimeout(() => {
      setAssignDialogOpen(true);
    }, 100);
  };

  const assignToTechnician = async () => {
    if (!selectedTicket || !selectedTechnicianId) return;

    // Fermer toutes les modals d'assignation
    setAssignDialogOpen(false);
    setConfirmOpen(false);

    try {
      let res;
      if (selectedTicket.technicien) {
        // Reassign using update endpoint to allow changing tech
        res = await ticketService.updateTicket(selectedTicket.id, {
          technicien_assigne: Number(selectedTechnicianId),
          status: selectedTicket.status === 'en_attente' ? 'en_cours' : selectedTicket.status
        });
        if (res.success) {
          res = { success: true };
        }
      } else {
        res = await ticketService.assignTicket(selectedTicket.id, Number(selectedTechnicianId));
      }

      if (res.success) {
        setSelectedTicket(null);
        setSelectedTechnicianId('');
        await fetchTickets();
        setMessage('Ticket assigné avec succès');
      } else {
        setMessage(res.message || "Erreur lors de l'assignation");
      }
    } catch (e) {
      setMessage("Erreur lors de l'assignation du ticket");
    }
  };

  if (loading) {
    return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;
  }
  if (error) {
    return (
      <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>
        <div>
          <div style={{ marginBottom: 12, color: '#b91c1c', fontWeight: 700 }}>Erreur</div>
          <button onClick={fetchTickets} style={{ background: '#111827', color: 'white', border: 0, borderRadius: 8, padding: '8px 12px' }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Tickets</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>Assignez les tickets aux techniciens</p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={20} style={{ color: '#6b7280' }} />
          <span style={{ fontWeight: 600, color: '#374151' }}>Filter By</span>
        </div>
        <select value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Date</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
        <select value={filters.orderType} onChange={(e) => setFilters({ ...filters, orderType: e.target.value })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Order Type</option>
          <option value="hardware">HARDWARE</option>
          <option value="software">SOFTWARE</option>
          <option value="network">NETWORK</option>
        </select>
        <select value={filters.orderStatus} onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Order Status</option>
          <option value="resolu">Résolu</option>
          <option value="en_cours">En cours</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_attente">En attente</option>
        </select>
        <button onClick={() => setFilters({ date: '', orderType: '', orderStatus: '' })} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 0, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} /> Reset Filter
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 120px 120px 100px 100px 100px', padding: '20px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          <div>ID Ticket</div>
          <div>Nom d'equipment</div>
          <div>N/S</div>
          <div>Technician</div>
          <div>Date de creation</div>
          <div>Utilisateur</div>
          <div>Status</div>
          <div>Categorie</div>
          <div>Opération</div>
        </div>

        <div>
          {tickets.map((ticket, index) => (
            <div key={ticket.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 120px 120px 100px 100px 100px', padding: '20px 24px', borderBottom: index < tickets.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{String(ticket.id).padStart(5, '0')}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>{ticket.equipement?.type_equipement?.nom_type || 'N/A'} - {ticket.equipement?.modele || 'N/A'}</div>
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{ticket.equipement?.localisation || 'N/A'}</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : 'Non assigné'}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{formatDate(ticket.date_creation)}</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{ticket.user ? `${ticket.user.prenom} ${ticket.user.nom}` : 'N/A'}</div>
              <div>{getStatusBadge(ticket.status)}</div>
              <div>{getPriorityBadge(ticket.priorite)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button title="Voir les détails" onClick={() => { setSelectedTicket(ticket); setDetailsOpen(true); }} style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                  <Eye size={16} />
                </button>
                <button title="Affecter" onClick={() => openAssignDialog(ticket)} style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                  <UserPlus size={16} />
                </button>
                <button title="Prendre en charge" onClick={() => handleTakeTicket(ticket)} style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                  <Hand size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {detailsOpen && selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '96%', maxWidth: 900, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#111827', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {selectedTicket?.equipement?.modele?.slice(0,2)?.toUpperCase() || 'TK'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{selectedTicket.equipement?.type_equipement?.nom_type || 'Équipement'} - {selectedTicket.equipement?.modele || ''}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Ticket #{String(selectedTicket.id).padStart(5,'0')} • {formatDate(selectedTicket.date_creation)}</div>
                </div>
              </div>
              <button onClick={() => setDetailsOpen(false)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white' }}>Fermer</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24, padding: 24 }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 6 }}>Probléme de l'utilisateur</div>
                    <div style={{ minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151' }}>{selectedTicket.description || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 6 }}>Commentaire du technicien</div>
                    <div style={{ minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap', color: '#374151' }}>{selectedTicket.commentaire_resolution || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Utilisateur</div>
                    <div style={{ marginTop: 6, color: '#111827' }}>{selectedTicket.user ? `${selectedTicket.user.prenom} ${selectedTicket.user.nom}` : 'N/A'}</div>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Technicien</div>
                    <div style={{ marginTop: 6, color: '#111827' }}>{selectedTicket.technicien ? `${selectedTicket.technicien.prenom} ${selectedTicket.technicien.nom}` : 'Non assigné'}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Statut</div>
                  <div style={{ marginTop: 6 }}>{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Priorité</div>
                  <div style={{ marginTop: 6 }}>{getPriorityBadge(selectedTicket.priorite)}</div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Catégorie</div>
                  <div style={{ marginTop: 6, color: '#111827' }}>{selectedTicket.categorie?.nom || 'N/A'}</div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Numéro de série</div>
                  <div style={{ marginTop: 6, color: '#111827' }}>{selectedTicket.equipement_id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation de technicien - CORRIGÉE */}
      {assignDialogOpen && !confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 20, width: '92%', maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Affecter le ticket #{String(selectedTicket?.id).padStart(5, '0')}</div>
              <button onClick={() => setAssignDialogOpen(false)} style={{ background: 'transparent', border: 0, fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ color: '#6b7280', marginBottom: 12 }}>Choisissez un technicien à affecter</div>

            <div style={{ display: 'grid', gap: 10, maxHeight: 360, overflowY: 'auto', paddingRight: 6 }}>
              {technicians.length === 0 && <div style={{ color: '#9ca3af' }}>Aucun technicien trouvé</div>}
              {technicians.map((t) => (
                <label key={t.id_user || t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {t.prenom ? `${t.prenom} ${t.nom}` : (t.name || `Technicien #${t.id_user || t.id}`)}
                      {(t.id_user === user?.id_user || t.id === user?.id) && <span style={{ color: '#10b981', fontSize: 12, marginLeft: 8 }}>(Vous)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {t.id_user || t.id}</div>
                  </div>
                  <input type="radio" name="tech" value={t.id_user || t.id} onChange={(e) => setSelectedTechnicianId(e.target.value)} />
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setAssignDialogOpen(false)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8 }}>Annuler</button>
              <button onClick={assignToTechnician} disabled={!selectedTechnicianId} style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 0, borderRadius: 8, opacity: selectedTechnicianId ? 1 : 0.6, cursor: selectedTechnicianId ? 'pointer' : 'not-allowed' }}>Affecter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour réassignation - CORRIGÉE */}
      {confirmOpen && !assignDialogOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: '90%', maxWidth: 420 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Confirmer l'affectation</div>
            <div style={{ color: '#6b7280', marginBottom: 16 }}>
              {selectedTicket?.technicien
                ? <>Ce ticket est déjà pris par <strong>{selectedTicket.technicien.prenom} {selectedTicket.technicien.nom}</strong>. Êtes-vous sûr de vouloir changer le technicien ?</>
                : <>Voulez-vous affecter le ticket #{String(selectedTicket?.id).padStart(5, '0')} au technicien sélectionné ?</>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '8px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8 }}>Annuler</button>
              <button onClick={handleConfirmChange} style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 0, borderRadius: 8 }}>Continuer</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for taking ticket */}
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
                onClick={() => setShowConfirmationModal(false)}
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
                onClick={() => setShowConfirmationModal(false)}
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
                onClick={() => setShowErrorModal(false)}
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
                onClick={() => setShowErrorModal(false)}
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

      {/* Message de notification */}
      {message && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#111827', color: 'white', padding: '10px 14px', borderRadius: 8 }}>
          {message}
          <button onClick={() => setMessage('')} style={{ marginLeft: 12, background: 'transparent', color: 'white', border: 0, cursor: 'pointer' }}>×</button>
        </div>
      )}
    </>
  );
};

export default AdminTicketsPage;
