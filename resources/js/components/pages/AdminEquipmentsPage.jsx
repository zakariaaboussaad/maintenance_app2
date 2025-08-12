// components/pages/AdminEquipmentsPage.jsx
import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Search } from 'lucide-react';
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

const AdminEquipmentsPage = () => {
  const [items, setItems] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [query, status, all]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await equipmentService.getEquipements();
      if (res.success) setAll(res.data);
      else setError('Erreur de chargement');
    } catch (e) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
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

  if (loading) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>Chargement…</div>;
  if (error) return <div style={{ minHeight: 300, display: 'grid', placeItems: 'center', color: '#b91c1c' }}>{error}</div>;

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Equipements</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>Parc Informatique</p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={20} style={{ color: '#6b7280' }} />
          <span style={{ fontWeight: 600, color: '#374151' }}>Filter By</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px' }}>
          <Search size={16} style={{ color: '#9ca3af' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche" style={{ border: 'none', outline: 'none' }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          <option value="">Order Status</option>
          <option value="actif">A marche</option>
          <option value="en maintenance">en panne</option>
          <option value="en veille">On Hold</option>
        </select>
        <button onClick={() => { setQuery(''); setStatus(''); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 0, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} /> Reset Filter
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 160px 120px 120px 120px', padding: '20px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
          <div>Numero de serie</div>
          <div>Name</div>
          <div>Adresse</div>
          <div>Date</div>
          <div>Utilisateur</div>
          <div>Status</div>
          <div>Operation</div>
        </div>
        <div>
          {items.map((e, index) => (
            <div key={e.numero_serie} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 160px 120px 120px 120px', padding: '20px 24px', borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{e.numero_serie}</div>
              <div>{e.modele}</div>
              <div>{e.localisation || '—'}</div>
              <div>{e.date_installation ? new Date(e.date_installation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
              <div>{e.utilisateur_assigne ? `#${e.utilisateur_assigne}` : '-'}</div>
              <div>{statusBadge(e.status)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6 }}>⟲</button>
                <button style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6 }}>✎</button>
                <button style={{ padding: 8, width: 32, height: 32, background: '#111827', color: 'white', border: 0, borderRadius: 6 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminEquipmentsPage;




