// components/pages/AdminEquipmentsPage.jsx
import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Search, UserCheck, X, Check, Edit, Trash2, ArrowLeft, Plus, User, Users } from 'lucide-react';
import { equipmentService } from '../../services/apiService';

const statusBadge = (status) => {
  const map = {
    'Actif': { bg: '#d1fae5', color: '#065f46', text: 'A marche' },
    'En maintenance': { bg: '#fee2e2', color: '#991b1b', text: 'en panne' },
    'En veille': { bg: '#e5e7eb', color: '#374151', text: 'On hold' }
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', text: status || '—' };
  return <span style={{ padding: '4px 10px', borderRadius: 10, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>{s.text}</span>;
};

// Helper function to format the assigned user
const formatAssignedUser = (utilisateur_assigne) => {
  if (!utilisateur_assigne) return '-';

  if (typeof utilisateur_assigne === 'object') {
    const prenom = utilisateur_assigne.prenom || '';
    const nom = utilisateur_assigne.nom || utilisateur_assigne.name || '';
    const id = utilisateur_assigne.id_user || utilisateur_assigne.id || utilisateur_assigne.matricule;

    if (prenom && nom) {
      return `${prenom} ${nom}`;
    } else if (nom) {
      return nom;
    } else if (prenom) {
      return prenom;
    } else if (id) {
      return `#${id}`;
    } else {
      return `User #${Object.values(utilisateur_assigne)[0] || 'N/A'}`;
    }
  }

  return `#${utilisateur_assigne}`;
};

const AdminEquipmentsPage = () => {
  const [items, setItems] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  // Page and Modal states
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isForAddForm, setIsForAddForm] = useState(false);

  const [editFormData, setEditFormData] = useState({
    modele: '',
    marque: '',
    localisation: '',
    status: '',
    os: '',
    prix_achat: '',
    date_installation: ''
  });

  const [addFormData, setAddFormData] = useState({
    numero_serie: '',
    modele: '',
    marque: '',
    localisation: '',
    status: 'Actif',
    os: '',
    prix_achat: '',
    date_installation: '',
    type_equipement_id: '1',
    utilisateur_assigne: ''
  });

  const [editValidationErrors, setEditValidationErrors] = useState({});
  const [addValidationErrors, setAddValidationErrors] = useState({});

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [query, status, all]);
  useEffect(() => { filterUsers(); }, [userSearchQuery, availableUsers]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await equipmentService.getEquipements();
      if (res.success) {
        setAll(res.data);
        // Force update items state to trigger re-render
        setItems(res.data);
      } else {
        setError('Erreur de chargement');
      }
    } catch (e) {
      setError('Erreur de chargement: ' + e.message);
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!userSearchQuery) {
      setFilteredUsers(availableUsers);
    } else {
      const query = userSearchQuery.toLowerCase();
      const filtered = availableUsers.filter(user => {
        const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const matricule = (user.matricule || '').toString().toLowerCase();
        const id = (user.id_user || user.id || '').toString().toLowerCase();

        return fullName.includes(query) ||
               email.includes(query) ||
               matricule.includes(query) ||
               id.includes(query);
      });
      setFilteredUsers(filtered);
    }
  };




const openUserSelectionModal = async (forAddForm = false) => {
    console.log('Opening user selection modal, forAddForm:', forAddForm);

    setIsForAddForm(forAddForm);
    setUserSearchQuery('');
    setSelectedUserId('');
    setError(null);

    // Réinitialiser les listes d'utilisateurs
    setAvailableUsers([]);
    setFilteredUsers([]);

    // CORRECTION : Charger les utilisateurs AVANT d'ouvrir la modal
    try {
      console.log('Loading users... isForAddForm:', forAddForm);

      const response = await fetch('/api/utilisateurs', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      console.log('Users API response:', res);

      if (res.success && res.data && Array.isArray(res.data)) {
        // Filtrer pour obtenir seulement les utilisateurs normaux actifs
        let normalUsers = res.data.filter(user => {
          const isNormalUser = user.role_id === 3;
          const isActive = user.is_active === true || user.is_active === 1 || user.is_active === "1";
          return isNormalUser && isActive;
        });

        // Si ce n'est pas pour le formulaire d'ajout, exclure l'utilisateur actuel
        if (!forAddForm && selectedEquipment?.utilisateur_assigne) {
          const currentUserId = selectedEquipment.utilisateur_assigne;
          normalUsers = normalUsers.filter(user => {
            const userId = user.id_user || user.id;
            return userId != currentUserId;
          });
        }

        console.log('Filtered normal users:', normalUsers);

        // Mettre à jour les deux états
        setAvailableUsers(normalUsers);
        setFilteredUsers(normalUsers);

        if (normalUsers.length === 0) {
          setError('Aucun utilisateur normal actif trouvé');
        }

        // Ouvrir la modal SEULEMENT après avoir chargé les utilisateurs
        setShowUserSelectionModal(true);
      } else {
        console.error('Invalid response format:', res);
        setError('Format de réponse invalide du serveur');
        setAvailableUsers([]);
        setFilteredUsers([]);
        // Ne pas ouvrir la modal en cas d'erreur
        alert('Erreur lors du chargement des utilisateurs. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs: ' + error.message);
      setAvailableUsers([]);
      setFilteredUsers([]);
      // Ne pas ouvrir la modal en cas d'erreur
      alert('Erreur de connexion. Veuillez vérifier votre connexion réseau et réessayer.');
    }
  };

  const closeUserSelectionModal = () => {
    setShowUserSelectionModal(false);
    setUserSearchQuery('');
    // Don't reset selectedUserId here - keep the selection for reassignment
    setIsForAddForm(false);
  };

  const handleUserSelection = () => {
    console.log('Selecting user:', selectedUserId);

    if (!selectedUserId) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }

    const selectedUser = availableUsers.find(u => {
      const userId = u.id_user || u.id;
      return userId == selectedUserId;
    });

    if (!selectedUser) {
      console.error('User not found:', selectedUserId, 'Available users:', availableUsers);
      setError('Utilisateur introuvable');
      return;
    }

    console.log('User selected:', selectedUser);

    if (isForAddForm) {
      // Pour le formulaire d'ajout
      console.log('Setting user for add form:', selectedUserId);
      setAddFormData(prev => ({
        ...prev,
        utilisateur_assigne: selectedUserId.toString()
      }));
      // Reset selectedUserId for add form
      setSelectedUserId('');
    } else {
      // Pour la réaffectation - garder l'utilisateur sélectionné
      console.log('Setting user for reassignment:', selectedUserId);
      // selectedUserId reste défini pour la réaffectation
    }

    // Fermer la modal
    setShowUserSelectionModal(false);
    setUserSearchQuery('');
    setIsForAddForm(false);
  };
 const openReassignModal = (equipment) => {
  setSelectedEquipment(equipment);
  setSelectedUserId('');
  setError(null);
  setShowReassignModal(true);
  setIsForAddForm(false);
  // Don't automatically open user selection modal - let user click the button
};
  const closeReassignModal = () => {
    setShowReassignModal(false);
    setSelectedEquipment(null);
    setSelectedUserId('');
    setError(null);
  };

  const openAddPage = () => {
    setAddFormData({
      numero_serie: '',
      modele: '',
      marque: '',
      localisation: '',
      status: '',
      os: '',
      prix_achat: '',
      date_installation: '',
      type_equipement_id: '',
      utilisateur_assigne: ''
    });
    setAddValidationErrors({});
    setError(null);
    setShowAddPage(true);
  };

  const closeAddPage = () => {
    setShowAddPage(false);
    setAddFormData({
      numero_serie: '',
      modele: '',
      marque: '',
      localisation: '',
      status: '',
      os: '',
      prix_achat: '',
      date_installation: '',
      type_equipement_id: '',
      utilisateur_assigne: ''
    });
    setAddValidationErrors({});
    setError(null);
  };

  const openEditPage = (equipment) => {
    setSelectedEquipment(equipment);
    setEditFormData({
      modele: equipment.modele || '',
      marque: equipment.marque || '',
      localisation: equipment.localisation || '',
      status: equipment.status || '',
      os: equipment.os || '',
      prix_achat: equipment.prix_achat || '',
      date_installation: equipment.date_installation || ''
    });
    setEditValidationErrors({});
    setError(null);
    setShowEditPage(true);
  };

  const closeEditPage = () => {
    setShowEditPage(false);
    setSelectedEquipment(null);
    setEditFormData({
      modele: '',
      marque: '',
      localisation: '',
      status: '',
      os: '',
      prix_achat: '',
      date_installation: ''
    });
    setEditValidationErrors({});
    setError(null);
  };

  const openDeleteModal = (equipment) => {
    setSelectedEquipment(equipment);
    setError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEquipment(null);
    setError(null);
  };

  const handleReassign = async () => {
    if (!selectedUserId) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setReassignLoading(true);
      setError(null);

      const response = await fetch(`/api/equipements/${selectedEquipment.numero_serie}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          utilisateur_assigne: parseInt(selectedUserId)
        })
      });

      const res = await response.json();

      if (res.success) {
        setShowReassignModal(false);
        setShowSuccessModal(true);
        await load();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        setError(res.message || 'Erreur lors de la réaffectation');
      }
    } catch (e) {
      setError('Erreur lors de la réaffectation: ' + e.message);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setReassignLoading(true);
      setError(null);
      setAddValidationErrors({});

      // Validate required fields
      if (!addFormData.numero_serie || !addFormData.modele || !addFormData.marque) {
        setError('Veuillez remplir tous les champs obligatoires');
        setReassignLoading(false);
        return;
      }

      const submitData = {
        ...addFormData,
        type_equipement_id: parseInt(addFormData.type_equipement_id) || 1,
        utilisateur_assigne: addFormData.utilisateur_assigne ? parseInt(addFormData.utilisateur_assigne) : null,
        prix_achat: addFormData.prix_achat ? parseFloat(addFormData.prix_achat) : null,
        status: addFormData.status || 'Actif'
      };

      console.log('Submitting equipment data:', submitData);

      let response;
      try {
        response = await fetch('/api/equipements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          body: JSON.stringify(submitData)
        });
      } catch (networkError) {
        console.error('Network error:', networkError);
        setError('Erreur réseau. Vérifiez votre connexion.');
        setReassignLoading(false);
        return;
      }

      let res;
      try {
        res = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        setError('Erreur de traitement de la réponse du serveur');
        setReassignLoading(false);
        return;
      }

      console.log('Server response:', { status: response.status, data: res });

      if (response.ok) {
        setShowAddPage(false);
        setShowSuccessModal(true);
        // Reset form data
        setAddFormData({
          numero_serie: '',
          modele: '',
          marque: '',
          localisation: '',
          status: 'Actif',
          os: '',
          prix_achat: '',
          date_installation: '',
          type_equipement_id: '1',
          utilisateur_assigne: ''
        });
        setAddValidationErrors({});
        await load();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        if (res.errors) {
          setAddValidationErrors(res.errors);
        } else {
          setError(res.message || 'Erreur lors de l\'ajout');
        }
      }
    } catch (e) {
      setError('Erreur lors de l\'ajout: ' + e.message);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setReassignLoading(true);
      setError(null);
      setEditValidationErrors({});

      const response = await fetch(`/api/equipements/${selectedEquipment.numero_serie}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(editFormData)
      });

      const res = await response.json();

      if (res.success) {
        setShowEditPage(false);
        setShowSuccessModal(true);
        await load();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        if (res.errors) {
          setEditValidationErrors(res.errors);
        } else {
          setError(res.message || 'Erreur lors de la modification');
        }
      }
    } catch (e) {
      setError('Erreur lors de la modification: ' + e.message);
    } finally {
      setReassignLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setError(null);

      const response = await fetch(`/api/equipements/${selectedEquipment.numero_serie}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      const res = await response.json();

      if (res.success) {
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        await load();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        setError(res.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      setError('Erreur lors de la suppression: ' + e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...all];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e => `${e.numero_serie} ${e.modele} ${e.marque} ${e.localisation}`.toLowerCase().includes(q));
    }
    if (status) list = list.filter(e => (e.status || '').toLowerCase() === status);
    setItems(list);
  };

  const renderAddFormField = (label, name, type = 'text', options = null, placeholder = null) => {
    const error = addValidationErrors[name];

    if (name === 'utilisateur_assigne') {
      // Trouver l'utilisateur sélectionné
      const selectedUser = addFormData[name]
        ? availableUsers.find(u => {
            const userId = u.id_user || u.id;
            return userId == addFormData[name];
          })
        : null;

      console.log('Rendering user field. Selected:', addFormData[name], 'Found user:', selectedUser);

      return (
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
            color: error ? '#dc2626' : '#374151'
          }}>
            {label}
          </label>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => {
                console.log('Clicking to open user selection modal for add form');
                openUserSelectionModal(true);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${error ? '#dc2626' : '#d1d5db'}`,
                borderRadius: 8,
                fontSize: 14,
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!error) e.target.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                if (!error) e.target.style.borderColor = '#d1d5db';
              }}
            >
              <span style={{
                color: selectedUser ? '#374151' : '#9ca3af',
                flex: 1,
                fontSize: 14
              }}>
                {selectedUser
                  ? `${(selectedUser.prenom || '')} ${(selectedUser.nom || '')}`.trim() ||
                    selectedUser.name ||
                    `Utilisateur #${selectedUser.id_user || selectedUser.id}`
                  : 'Cliquer pour sélectionner un utilisateur'
                }
              </span>
              <Users size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
            </div>

            {/* Afficher l'utilisateur sélectionné sous le champ */}
            {selectedUser && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                background: '#ecfdf5',
                border: '1px solid #86efac',
                borderRadius: 6,
                fontSize: 12,
                color: '#065f46'
              }}>
                ✓ Sélectionné: {selectedUser.prenom} {selectedUser.nom} (ID: {selectedUser.id_user || selectedUser.id})
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
              {Array.isArray(error) ? error[0] : error}
            </div>
          )}
        </div>
      );
    }

    // ... reste du code pour les autres types de champs inchangé
    if (type === 'select') {
      return (
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
            color: error ? '#dc2626' : '#374151'
          }}>
            {label}
          </label>
          <select
            value={addFormData[name]}
            onChange={(e) => {
              setAddFormData({...addFormData, [name]: e.target.value});
              if (error) {
                const newErrors = {...addValidationErrors};
                delete newErrors[name];
                setAddValidationErrors(newErrors);
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
              borderRadius: 8,
              fontSize: 14,
              background: '#f8fafc'
            }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
              {error[0] || error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 24 }}>
        <label style={{
          display: 'block',
          marginBottom: 8,
          fontWeight: 600,
          color: error ? '#dc2626' : '#374151'
        }}>
          {label}
        </label>
        <input
          type={type}
          value={addFormData[name]}
          onChange={(e) => {
            setAddFormData({...addFormData, [name]: e.target.value});
            if (error) {
              const newErrors = {...addValidationErrors};
              delete newErrors[name];
              setAddValidationErrors(newErrors);
            }
          }}
          placeholder={placeholder || `Entrer ${label.toLowerCase()}`}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
            borderRadius: 8,
            fontSize: 14,
            background: '#f8fafc'
          }}
        />
        {error && (
          <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
            {error[0] || error}
          </div>
        )}
      </div>
    );
  };

  const renderEditFormField = (key, label, type = 'text') => {
    const error = editValidationErrors[key];

    if (key === 'status') {
      return (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
            {label} {error && <span style={{ color: '#dc2626' }}>*</span>}
          </label>
          <select
            value={editFormData[key]}
            onChange={(e) => setEditFormData({...editFormData, [key]: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: error ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          >
            <option value="">Sélectionner un statut</option>
            <option value="Actif">Actif</option>
            <option value="En maintenance">En maintenance</option>
            <option value="En veille">En veille</option>
          </select>
          {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error[0]}</p>}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
          {label} {error && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        <input
          type={type}
          value={editFormData[key]}
          onChange={(e) => setEditFormData({...editFormData, [key]: e.target.value})}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: error ? '2px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = '#d1d5db';
          }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error[0]}</p>}
      </div>
    );
  };

  if (loading) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;
  if (error && !showReassignModal && !showEditPage && !showDeleteModal && !showAddPage && !showUserSelectionModal) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center', color: '#b91c1c' }}>{error}</div>;

  // Page d'édition
  if (showEditPage) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={closeEditPage}
              style={{
                padding: 8,
                background: '#3b82f6',
                color: 'white',
                border: 0,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Modifier l'équipement</h1>
          </div>
          <button
            onClick={closeEditPage}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Revenir
          </button>
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

        <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 800, margin: '0 auto' }}>
            <div>
              {renderEditFormField('modele', 'Modèle')}
              {renderEditFormField('marque', 'Marque')}
              {renderEditFormField('localisation', 'Localisation')}
              {renderEditFormField('os', 'Système d\'exploitation')}
            </div>
            <div>
              {renderEditFormField('status', 'Statut')}
              {renderEditFormField('prix_achat', 'Prix d\'achat', 'number')}
              {renderEditFormField('date_installation', 'Date d\'installation', 'date')}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <button
              onClick={handleEdit}
              disabled={reassignLoading}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 16,
                cursor: reassignLoading ? 'not-allowed' : 'pointer',
                opacity: reassignLoading ? 0.5 : 1
              }}
            >
              {reassignLoading ? 'Modification en cours...' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page d'ajout
  if (showAddPage) {
    return (
      <>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={closeAddPage}
                style={{
                  padding: 8,
                  background: '#3b82f6',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
              </button>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Ajouter un équipement</h1>
            </div>
            <button
              onClick={closeAddPage}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 0,
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Revenir
            </button>
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

          <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 800, margin: '0 auto' }}>
              <div>
                {renderAddFormField('Numéro de série *', 'numero_serie', 'text', null, 'Entrer le numéro de série')}
                {renderAddFormField('Modèle *', 'modele', 'text', null, 'Entrer le modèle')}
                {renderAddFormField('Marque *', 'marque', 'text', null, 'Entrer la marque')}
                {renderAddFormField('Localisation', 'localisation', 'text', null, 'Entrer la localisation')}
                {renderAddFormField('Système d\'exploitation', 'os', 'text', null, 'Entrer le système d\'exploitation')}
              </div>
              <div>
                {renderAddFormField('Statut *', 'status', 'select', [
                  { value: '', label: 'Sélectionner un statut' },
                  { value: 'Actif', label: 'Actif' },
                  { value: 'En maintenance', label: 'En maintenance' },
                  { value: 'En veille', label: 'En veille' }
                ])}
                {renderAddFormField('Prix d\'achat', 'prix_achat', 'number', null, 'Entrer le prix d\'achat')}
                {renderAddFormField('Date d\'installation', 'date_installation', 'date')}
                {renderAddFormField('Type d\'équipement', 'type_equipement_id', 'select', [
                  { value: '', label: 'Sélectionner un type' },
                  { value: '1', label: 'Ordinateur' },
                  { value: '2', label: 'Écran' },
                  { value: '3', label: 'Switch/Réseau' },
                  { value: '4', label: 'Imprimante' },
                  { value: '5', label: 'Serveur' }
                ])}
                {renderAddFormField('Utilisateur assigné', 'utilisateur_assigne')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <button
                onClick={handleAdd}
                disabled={reassignLoading}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: reassignLoading ? 'not-allowed' : 'pointer',
                  opacity: reassignLoading ? 0.5 : 1
                }}
              >
                {reassignLoading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de sélection d'utilisateur pour le formulaire d'ajout */}
        {showUserSelectionModal && (
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
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
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={24} style={{ color: 'white' }} />
                  </div>
                  Sélectionner un utilisateur
                </h2>
                <button
                  onClick={closeUserSelectionModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Barre de recherche */}
              <div style={{
                position: 'relative',
                marginBottom: 24
              }}>
                <div style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }}>
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, matricule..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              {/* Liste des utilisateurs */}
              <div style={{ marginBottom: 24 }}>
                {filteredUsers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      {userSearchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id_user}
                        onClick={() => setSelectedUserId(user.id_user)}
                        style={{
                          padding: '16px 20px',
                          border: selectedUserId === user.id_user
                            ? '2px solid #3b82f6'
                            : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: selectedUserId === user.id_user
                            ? '#eff6ff'
                            : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            background: selectedUserId === user.id_user
                              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <User size={20} style={{
                              color: selectedUserId === user.id_user ? 'white' : '#6b7280'
                            }} />
                          </div>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1f2937',
                              marginBottom: '4px'
                            }}>
                              {`${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Nom non disponible'}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              ID: {user.id_user} • {user.email}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: selectedUserId === user.id_user
                            ? '6px solid #3b82f6'
                            : '2px solid #d1d5db',
                          background: 'white'
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={closeUserSelectionModal}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: 8,
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleUserSelection}
                  disabled={!selectedUserId}
                  style={{
                    padding: '10px 20px',
                    background: selectedUserId ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 0,
                    borderRadius: 8,
                    cursor: selectedUserId ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Check size={16} />
                  Sélectionner
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Liste principale des équipements
  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Parc Informatique</h1>
          <button
            onClick={openAddPage}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Plus size={20} />
            Ajouter un équipement
          </button>
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
              <Filter size={12} style={{color: 'white'}} />
            </div>
            <span style={{fontWeight: '600', color: '#374151'}}>Filter By</span>
          </div>

          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Rechercher par numéro de série, modèle, marque..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '14px',
                color: '#374151'
              }}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px',
              color: '#374151',
              minWidth: '120px'
            }}
          >
            <option value="">Statut</option>
            <option value="actif">Actif</option>
            <option value="en maintenance">En maintenance</option>
            <option value="en veille">En veille</option>
          </select>

          <button
            onClick={() => { setQuery(''); setStatus(''); }}
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
            onClick={load}
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
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>

        {/* Equipment Table */}
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
              Chargement des équipements...
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 120px 140px 100px 140px 120px',
                padding: '20px 24px',
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>
                <div>N° SÉRIE</div>
                <div>MODÈLE</div>
                <div>MARQUE</div>
                <div>LOCALISATION</div>
                <div>STATUT</div>
                <div>UTILISATEUR</div>
                <div>ACTIONS</div>
              </div>

              {/* Table Body */}
              <div>
                {items.length === 0 ? (
                  <div style={{
                    padding: '60px 24px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Aucun équipement trouvé
                    </div>
                    <div style={{
                      fontSize: '14px'
                    }}>
                      {query || status ? 'Essayez de modifier vos filtres de recherche' : 'Commencez par ajouter votre premier équipement'}
                    </div>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={item.numero_serie}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 120px 140px 100px 140px 120px',
                        padding: '16px 24px',
                        borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                        alignItems: 'center',
                        fontSize: '14px',
                        transition: 'background-color 0.15s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {item.numero_serie}
                      </div>
                      <div style={{
                        color: '#374151'
                      }}>
                        {item.modele || '—'}
                      </div>
                      <div style={{
                        color: '#374151'
                      }}>
                        {item.marque || '—'}
                      </div>
                      <div style={{
                        color: '#374151'
                      }}>
                        {item.localisation || '—'}
                      </div>
                      <div>
                        {statusBadge(item.status)}
                      </div>
                      <div style={{
                        color: '#374151'
                      }}>
                        {formatAssignedUser(item.utilisateur_assigne)}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => openReassignModal(item)}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1f2937';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#374151';
                          }}
                          title="Réaffecter"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button
                          onClick={() => openEditPage(item)}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1f2937';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#374151';
                          }}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1f2937';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#374151';
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de réaffectation */}
      {showReassignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} style={{ color: '#3b82f6' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>Réaffecter l'équipement</h3>
              </div>
              <button onClick={closeReassignModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#374151' }}>Équipement sélectionné:</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                <strong>{selectedEquipment?.modele}</strong> - {selectedEquipment?.numero_serie}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                Utilisateur actuel: {formatAssignedUser(selectedEquipment?.utilisateur_assigne)}
              </p>
            </div>

            <p style={{ color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Sélectionnez le nouvel utilisateur pour cet équipement:
            </p>

            <button
              onClick={() => openUserSelectionModal(false)}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px dashed #d1d5db',
                borderRadius: 12,
                background: '#f9fafb',
                cursor: 'pointer',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            >
              <Users size={20} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
                {selectedUserId
                  ? (() => {
                      const user = availableUsers.find(u => (u.id_user || u.id) == selectedUserId);
                      if (user) {
                        const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
                        return `Utilisateur sélectionné: ${fullName || user.name || `Utilisateur #${user.id_user || user.id}`}`;
                      }
                      return 'Utilisateur introuvable';
                    })()
                  : 'Cliquez pour sélectionner un utilisateur'
                }
              </span>
            </button>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeReassignModal}
                disabled={reassignLoading}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  color: '#374151',
                  cursor: reassignLoading ? 'not-allowed' : 'pointer',
                  opacity: reassignLoading ? 0.5 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleReassign}
                disabled={reassignLoading || !selectedUserId}
                style={{
                  padding: '10px 20px',
                  background: selectedUserId ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  cursor: (reassignLoading || !selectedUserId) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {reassignLoading ? 'Réaffectation...' : 'Réaffecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection d'utilisateur */}
      {showUserSelectionModal && (
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
          zIndex: 999999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
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
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={24} style={{ color: 'white' }} />
                </div>
                Sélectionner un utilisateur
              </h2>
              <button
                onClick={closeUserSelectionModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div style={{
              position: 'relative',
              marginBottom: 24
            }}>
              <div style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email, matricule..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>

          {/* Liste des utilisateurs */}
          <div style={{ marginBottom: 24 }}>
              {filteredUsers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    {userSearchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id_user}
                      onClick={() => setSelectedUserId(user.id_user)}
                      style={{
                        padding: '16px 20px',
                        border: selectedUserId === user.id_user
                          ? '2px solid #3b82f6'
                          : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: selectedUserId === user.id_user
                          ? '#eff6ff'
                          : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          background: selectedUserId === user.id_user
                            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                            : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={20} style={{
                            color: selectedUserId === user.id_user ? 'white' : '#6b7280'
                          }} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {`${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Nom non disponible'}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            ID: {user.id_user} • {user.email}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: selectedUserId === user.id_user
                          ? '6px solid #3b82f6'
                          : '2px solid #d1d5db',
                        background: 'white'
                      }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 16,
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={closeUserSelectionModal}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: 8,
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleUserSelection}
                disabled={!selectedUserId}
                style={{
                  padding: '10px 20px',
                  background: selectedUserId ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  cursor: selectedUserId ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Check size={16} />
                Sélectionner
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de réaffectation */}
      {showReassignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} style={{ color: '#3b82f6' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>Réaffecter l'équipement</h3>
              </div>
              <button onClick={closeReassignModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#374151' }}>Équipement sélectionné:</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                <strong>{selectedEquipment?.modele}</strong> - {selectedEquipment?.numero_serie}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                Utilisateur actuel: {formatAssignedUser(selectedEquipment?.utilisateur_assigne)}
              </p>
            </div>

            <p style={{ color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Sélectionnez le nouvel utilisateur pour cet équipement:
            </p>

            <button
              onClick={() => openUserSelectionModal(false)}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px dashed #d1d5db',
                borderRadius: 12,
                background: '#f9fafb',
                cursor: 'pointer',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            >
              <Users size={20} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
                {selectedUserId
                  ? (() => {
                      const user = availableUsers.find(u => (u.id_user || u.id) == selectedUserId);
                      if (user) {
                        const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
                        return `Utilisateur sélectionné: ${fullName || user.name || `Utilisateur #${user.id_user || user.id}`}`;
                      }
                      return 'Utilisateur introuvable';
                    })()
                  : 'Cliquez pour sélectionner un utilisateur'
                }
              </span>
            </button>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeReassignModal}
                disabled={reassignLoading}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  color: '#374151',
                  cursor: reassignLoading ? 'not-allowed' : 'pointer',
                  opacity: reassignLoading ? 0.5 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleReassign}
                disabled={reassignLoading || !selectedUserId}
                style={{
                  padding: '10px 20px',
                  background: selectedUserId ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  cursor: (reassignLoading || !selectedUserId) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {reassignLoading ? 'Réaffectation...' : 'Réaffecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={20} style={{ color: '#dc2626' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>Supprimer l'équipement</h3>
              </div>
              <button onClick={closeDeleteModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#374151' }}>Équipement à supprimer:</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                <strong>{selectedEquipment?.modele}</strong> - {selectedEquipment?.numero_serie}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                Marque: {selectedEquipment?.marque} | Localisation: {selectedEquipment?.localisation}
              </p>
            </div>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20
            }}>
              <p style={{ color: '#92400e', margin: 0, fontWeight: 600, fontSize: 14 }}>
                ⚠️ Attention !
              </p>
              <p style={{ color: '#92400e', margin: '8px 0 0 0', fontSize: 14 }}>
                Cette action est irréversible. L'équipement sera définitivement supprimé de la base de données.
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  color: '#374151',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.5 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 0,
                  borderRadius: 8,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} style={{ color: '#065f46' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#065f46' }}>
              Opération réussie !
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              L'action a été effectuée avec succès.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEquipmentsPage;
