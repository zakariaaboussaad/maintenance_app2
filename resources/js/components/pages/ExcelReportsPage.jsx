import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users, Monitor, CheckCircle, BarChart3 } from 'lucide-react';

const ExcelReportsPage = () => {
    const [activeTab, setActiveTab] = useState('equipment');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const tabs = [
        { id: 'equipment', label: 'Équipements', icon: <Monitor size={16} /> },
        { id: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
        { id: 'tickets', label: 'Tickets', icon: <CheckCircle size={16} /> },
        { id: 'monthly-report', label: 'Rapport Mensuel', icon: <BarChart3 size={16} /> }
    ];

    const handleExport = async (exportType) => {
        setLoading(true);
        setMessage('');
        
        try {
            // Map export types to ultra simple endpoints
            const ultraSimpleEndpoints = {
                'equipment-full': 'equipment',
                'equipment-only': 'equipment', 
                'users': 'users',
                'tickets': 'tickets',
                'monthly-report': 'tickets'
            };
            
            const endpoint = ultraSimpleEndpoints[exportType];
            
            if (endpoint) {
                // Use standalone PHP export script
                const response = await fetch(`http://localhost:8000/export.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: endpoint }),
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    setMessage('✅ Export réussi !');
                    return;
                }
            }

            // Fallback to original endpoints for other types
            const csvResponse = await fetch(`http://127.0.0.1:8000/api/csv-export/${exportType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (csvResponse.ok) {
                const blob = await csvResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setMessage('✅ Export réussi !');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            setMessage('❌ Erreur lors de l\'export. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    setTimeout(() => setMessage(''), 3000);

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Rapports Excel
                </h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    Exportez vos données en format Excel pour analyse et reporting
                </p>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    backgroundColor: message.includes('Erreur') ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${message.includes('Erreur') ? '#fecaca' : '#bbf7d0'}`,
                    color: message.includes('Erreur') ? '#dc2626' : '#16a34a'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                {/* Sidebar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    height: 'fit-content',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <nav>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                                    color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab.id ? '600' : '400',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Equipment Tab */}
                    {activeTab === 'equipment' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Export des Équipements
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Exportez la liste complète des équipements avec leurs détails
                            </p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <FileSpreadsheet size={20} style={{ color: '#3b82f6' }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                            Liste complète des équipements
                                        </h3>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                        Inclut: Nom, type, numéro de série, statut, utilisateur assigné, date d'achat
                                    </p>
                                    <button
                                        onClick={() => handleExport('equipment-full')}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download size={16} />
                                        {loading ? 'Export...' : 'Exporter'}
                                    </button>
                                </div>

                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <FileSpreadsheet size={20} style={{ color: '#10b981' }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                            Équipements seulement
                                        </h3>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                        Liste simplifiée: Nom, type, numéro de série, statut
                                    </p>
                                    <button
                                        onClick={() => handleExport('equipment-only')}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download size={16} />
                                        {loading ? 'Export...' : 'Exporter'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Export des Utilisateurs
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Exportez la liste des utilisateurs avec leurs informations
                            </p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <Users size={20} style={{ color: '#8b5cf6' }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                            Liste complète des utilisateurs
                                        </h3>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                        Inclut: Nom, prénom, email, téléphone, rôle, date de création
                                    </p>
                                    <button
                                        onClick={() => handleExport('users')}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#8b5cf6',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download size={16} />
                                        {loading ? 'Export...' : 'Exporter'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Export des Tickets
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Exportez la liste des tickets avec leurs détails
                            </p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <CheckCircle size={20} style={{ color: '#f59e0b' }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                            Tous les tickets
                                        </h3>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                        Inclut: Titre, description, statut, priorité, créateur, technicien, dates
                                    </p>
                                    <button
                                        onClick={() => handleExport('tickets')}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download size={16} />
                                        {loading ? 'Export...' : 'Exporter'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Monthly Report Tab */}
                    {activeTab === 'monthly-report' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                Rapport Mensuel
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>
                                Rapport complet des activités du mois en cours
                            </p>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <BarChart3 size={20} style={{ color: '#dc2626' }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                            Rapport du mois en cours
                                        </h3>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                                            Ce rapport inclut:
                                        </p>
                                        <ul style={{ color: '#6b7280', fontSize: '14px', paddingLeft: '20px' }}>
                                            <li>Statistiques des tickets traités par technicien</li>
                                            <li>Nouveaux équipements ajoutés</li>
                                            <li>Tickets créés par utilisateur</li>
                                            <li>Temps de résolution moyen</li>
                                            <li>Répartition par statut et priorité</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={() => handleExport('monthly-report')}
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#dc2626',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download size={16} />
                                        {loading ? 'Export...' : 'Générer le rapport'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExcelReportsPage;
