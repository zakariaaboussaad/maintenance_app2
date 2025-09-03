import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Search, Plus, Edit, Trash2, Camera, ArrowLeft, Check } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Page and Modal states
  const [showAddPage, setShowAddPage] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    matricule: '',
    numero_telephone: '',
    poste_affecte: '',
    role_id: '',
    gender: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { applyFilters(); }, [query, role, status, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/utilisateurs');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();

      if (res.success) {
        setAllUsers(res.users || res.data || []);
      } else {
        setError(res.message || 'Erreur lors du chargement');
      }
    } catch (e) {
      console.error('Fetch users error:', e);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(allUsers)) {
      setFilteredUsers([]);
      return;
    }
    let list = [...allUsers];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(u => `${u.prenom || ''} ${u.nom || ''} ${u.email || ''} ${u.matricule || ''}`.toLowerCase().includes(q));
    }
    if (role) {
      list = list.filter(u => (u.role_id === Number(role)));
    }
    if (status) {
      const isActive = status === 'active';
      list = list.filter(u => Boolean(u.is_active) === isActive);
    }
    setUsers(list);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);
  const showPagination = users.length > itemsPerPage;

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

  const openAddPage = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      password: '',
      matricule: '',
      numero_telephone: '',
      poste_affecte: '',
      role_id: '',
      gender: ''
    });
    setValidationErrors({});
    setError(null);
    setShowAddPage(true);
  };

  const openEditPage = (user) => {
    console.log('Opening edit for user:', user); // Debug: voir les données de l'utilisateur
    console.log('User gender value:', user.gender); // Debug: voir la valeur du genre

    setSelectedUser(user);
    setFormData({
      prenom: user.prenom || '',
      nom: user.nom || '',
      email: user.email || '',
      password: '',
      matricule: user.matricule || '',
      numero_telephone: user.numero_telephone || '',
      poste_affecte: user.poste_affecte || '',
      role_id: String(user.role_id || ''),
      gender: user.gender || '' // This should be pre-filled
    });
    setValidationErrors({});
    setError(null);
    setShowEditPage(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const validateForm = (data, isEdit = false) => {
    const errors = {};

    if (!data.prenom?.trim()) {
      errors.prenom = 'Le prénom est requis';
    }

    if (!data.nom?.trim()) {
      errors.nom = 'Le nom est requis';
    }

    if (!data.email?.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!isEdit && !data.password?.trim()) {
      errors.password = 'Le mot de passe est requis';
    } else if (data.password && data.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!data.gender?.trim()) {
      errors.gender = 'Le genre est requis';
    }

    if (!data.role_id?.trim()) {
      errors.role_id = 'Le rôle est requis';
    }

    return errors;
  };

  const handleAddSubmit = async () => {
    try {
      setError(null);
      setValidationErrors({});

      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const submitData = {
        ...formData,
        role_id: parseInt(formData.role_id, 10)
      };

      console.log('Submitting data:', submitData);

      const response = await fetch('/api/utilisateurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const res = await response.json();
      console.log('API Response:', res);

      if (res.success) {
        setShowAddPage(false);
        setShowSuccessModal(true);
        await fetchUsers();

        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        if (res.errors) {
          setValidationErrors(res.errors);
        } else {
          setError(res.message || 'Erreur lors de l\'ajout');
        }
      }
    } catch (e) {
      console.error('Error:', e);
      setError('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  const handleEditSubmit = async () => {
    try {
      setError(null);
      setValidationErrors({});

      const errors = validateForm(formData, true);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Prepare data for API
      const submitData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        matricule: formData.matricule,
        numero_telephone: formData.numero_telephone,
        poste_affecte: formData.poste_affecte,
        gender: formData.gender,
        role_id: parseInt(formData.role_id, 10) // Use the selected role
      };

      // Only include password if provided
      if (formData.password && formData.password.trim()) {
        submitData.password = formData.password;
      }

      console.log('Updating user with data:', submitData);

      const response = await fetch(`/api/utilisateurs/${selectedUser.id_user}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const res = await response.json();
      console.log('Update response:', res);

      if (res.success) {
        setShowEditPage(false);
        setShowSuccessModal(true);
        await fetchUsers();

        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        if (res.errors) {
          setValidationErrors(res.errors);
        } else {
          setError(res.message || 'Erreur lors de la modification');
        }
      }
    } catch (e) {
      console.error('Error:', e);
      setError('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/utilisateurs/${selectedUser.id_user}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const res = await response.json();

      if (res.success) {
        setShowDeleteModal(false);
        await fetchUsers();
      } else {
        setError(res.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('Error:', e);
      setError('Erreur lors de la suppression');
    }
  };

  const renderFormField = (label, name, type = 'text', options = null, placeholder = null) => {
    const hasError = validationErrors[name];

    // Debug pour le champ gender
    if (name === 'gender') {
      console.log(`Gender field - Current value: "${formData[name]}"`);
    }

    return (
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 600,
          color: hasError ? '#dc2626' : '#374151'
        }}>
          {label}
        </label>

        {type === 'select' ? (
          <select
            value={formData[name]}
            onChange={(e) => {
              setFormData({...formData, [name]: e.target.value});
              if (hasError) {
                const newErrors = {...validationErrors};
                delete newErrors[name];
                setValidationErrors(newErrors);
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${hasError ? '#dc2626' : '#d1d5db'}`,
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
        ) : (
          <input
            type={type}
            value={formData[name]}
            onChange={(e) => {
              setFormData({...formData, [name]: e.target.value});
              if (hasError) {
                const newErrors = {...validationErrors};
                delete newErrors[name];
                setValidationErrors(newErrors);
              }
            }}
            placeholder={placeholder || `Entrer ${label.toLowerCase()}`}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${hasError ? '#dc2626' : '#d1d5db'}`,
              borderRadius: 8,
              fontSize: 14,
              background: '#f8fafc'
            }}
          />
        )}

        {hasError && (
          <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
            {hasError}
          </div>
        )}
      </div>
    );
  }

  // Edit User Page
  if (showEditPage) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setShowEditPage(false)}
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
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Modifier le profile de {selectedUser?.prenom || 'Utilisateur'}
            </h1>
          </div>
          
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
          {/* Profile Photo Upload */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 120,
                height: 120,
                background: '#f8fafc',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #cbd5e1',
                margin: '0 auto 16px'
              }}>
                <Camera size={32} style={{ color: '#94a3b8' }} />
              </div>
              <button style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Upload Photo
              </button>
            </div>
          </div>



          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div>
              {renderFormField('Prénom *', 'prenom', 'text', null, 'Entrer le prénom')}
              {renderFormField('Email *', 'email', 'email', null, 'Entrer l\'adresse email')}
              {renderFormField('Mot de passe', 'password', 'password', null, 'Laisser vide pour ne pas changer')}
              {renderFormField('Role *', 'role_id', 'select', [
                { value: '', label: 'Sélectionner un rôle' },
                { value: '1', label: 'Admin' },
                { value: '2', label: 'Technicien' },
                { value: '3', label: 'Utilisateur' }
              ])}
              {renderFormField('Gender *', 'gender', 'select', [
                { value: '', label: 'Sélectionner le genre' },
                { value: 'male', label: 'Homme' },
                { value: 'female', label: 'Femme' }
              ])}
            </div>
            <div>
              {renderFormField('Nom *', 'nom', 'text', null, 'Entrer le nom')}
              {renderFormField('Numéro de téléphone', 'numero_telephone', 'tel', null, 'Entrer le numéro de téléphone')}
              {renderFormField('Poste affecté', 'poste_affecte', 'text', null, 'Entrer le poste')}
              {renderFormField('Matricule', 'matricule', 'text', null, 'Entrer le matricule')}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <button
              onClick={handleEditSubmit}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;

  // Add User Page
  if (showAddPage) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setShowAddPage(false)}
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
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Ajouter un utilisateur</h1>
          </div>
          
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
          {/* Profile Photo Upload */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 120,
                height: 120,
                background: '#f8fafc',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #cbd5e1',
                margin: '0 auto 16px'
              }}>
                <Camera size={32} style={{ color: '#94a3b8' }} />
              </div>
              <button style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Upload Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div>
              {renderFormField('Prénom *', 'prenom', 'text', null, 'Entrer le prénom')}
              {renderFormField('Email *', 'email', 'email', null, 'Entrer l\'adresse email')}
              {renderFormField('Mot de passe *', 'password', 'password', null, 'Entrer le mot de passe')}
              {renderFormField('Role *', 'role_id', 'select', [
                { value: '', label: 'Sélectionner un rôle' },
                { value: '1', label: 'Admin' },
                { value: '2', label: 'Technicien' },
                { value: '3', label: 'Utilisateur' }
              ])}
              {renderFormField('Gender *', 'gender', 'select', [
                { value: '', label: 'Sélectionner le genre' },
                { value: 'male', label: 'Homme' },
                { value: 'female', label: 'Femme' }
              ])}
            </div>
            <div>
              {renderFormField('Nom *', 'nom', 'text', null, 'Entrer le nom')}
              {renderFormField('Numéro de téléphone', 'numero_telephone', 'tel', null, 'Entrer le numéro de téléphone')}
              {renderFormField('Poste affecté', 'poste_affecte', 'text', null, 'Entrer le poste')}
              {renderFormField('Matricule', 'matricule', 'text', null, 'Entrer le matricule')}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <button
              onClick={handleAddSubmit}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Users List Page
  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Utilisateurs</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>Liste des utilisateurs avec filtres</p>
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

      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={20} style={{ color: '#6b7280' }} />
          <span style={{ fontWeight: 600, color: '#374151' }}>Filter By</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px' }}>
          <Search size={16} style={{ color: '#9ca3af' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" style={{ border: 'none', outline: 'none' }} />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Rôle</option>
          <option value="1">Admin</option>
          <option value="2">Technicien</option>
          <option value="3">Utilisateur</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Statut</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        <button onClick={() => {
          setQuery('');
          setRole('');
          setStatus('');
          setCurrentPage(1);
        }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 0, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <RefreshCw size={16} /> Reset Filter
        </button>
        <button onClick={openAddPage} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 0, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer' }}>
          <Plus size={16} /> Ajouter un utilisateur
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 100px', padding: '20px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
          <div>ID</div>
          <div>Nom</div>
          <div>Email</div>
          <div>Matricule</div>
          <div>Poste</div>
          <div>Statut</div>
          <div>Opération</div>
        </div>
        <div>
          {users.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
              Aucun utilisateur trouvé
            </div>
          ) : (
            currentUsers.map((u, index) => (
              <div key={u.id_user || u.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 120px 120px 100px', padding: '20px 24px', borderBottom: index < currentUsers.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{String(u.id_user || u.id).padStart(5, '0')}</div>
                <div>{u.prenom ? `${u.prenom} ${u.nom}` : (u.name || '—')}</div>
                <div>{u.email || '—'}</div>
                <div>{u.matricule || '—'}</div>
                <div>{u.poste_affecte || '—'}</div>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: 10, background: u.is_active ? '#d1fae5' : '#f3f4f6', color: u.is_active ? '#065f46' : '#374151', fontSize: 12, fontWeight: 600 }}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                <button
  title="Modifier"
  onClick={() => openEditPage(u)}
  onMouseEnter={(e) => { e.target.style.background = '#f59e0b'; }}
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
  <Edit size={16} />
</button>

<button
  title="Supprimer"
  onClick={() => openDeleteModal(u)}
  onMouseEnter={(e) => { e.target.style.background = '#ef4444'; }}
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
  <Trash2 size={16} />
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
              Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} style={{ color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#dc2626' }}>Supprimer l'utilisateur</h3>
            </div>
            <p style={{ color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action ne peut pas être annulée.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 8, color: '#374151', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 0, borderRadius: 8, cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} style={{ color: '#065f46' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#065f46' }}>
              {showEditPage ? 'Utilisateur modifié avec succès!' : 'Utilisateur ajouté avec succès!'}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {showEditPage ? 'Les informations de l\'utilisateur ont été mises à jour.' : 'L\'utilisateur a été créé et ajouté à la liste.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsersPage;
