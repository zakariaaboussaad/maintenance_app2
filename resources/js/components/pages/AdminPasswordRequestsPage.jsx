import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const AdminPasswordRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadPasswordRequests();
    }, []);

    const loadPasswordRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.auth.getPasswordRequests();
            setRequests(response.data);
        } catch (error) {
            console.error('Error loading password requests:', error);
            setMessage('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!newPassword.trim()) {
            setMessage('Veuillez saisir un nouveau mot de passe');
            return;
        }

        setActionLoading(true);
        try {
            await apiService.auth.approvePasswordRequest(selectedRequest.id, { new_password: newPassword });
            setMessage('Demande approuvée avec succès');
            setShowApproveModal(false);
            setNewPassword('');
            setSelectedRequest(null);
            loadPasswordRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Erreur lors de l\'approbation');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            await apiService.auth.rejectPasswordRequest(selectedRequest.id, { rejection_reason: rejectionReason });
            setMessage('Demande rejetée');
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedRequest(null);
            loadPasswordRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Erreur lors du rejet');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'approved': return 'Approuvée';
            case 'rejected': return 'Rejetée';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ fontSize: '18px', color: '#6b7280' }}>Chargement...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Demandes de Mot de Passe
                </h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    Gérez les demandes de changement de mot de passe des utilisateurs
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

            {/* Requests Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {requests.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                        <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🔐</span>
                        <p style={{ fontSize: '18px', marginBottom: '8px' }}>Aucune demande de mot de passe</p>
                        <p style={{ fontSize: '14px' }}>Les demandes de changement de mot de passe apparaîtront ici</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Utilisateur</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Raison</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Statut</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>
                                                    {request.user?.prenom} {request.user?.nom}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                    {request.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ maxWidth: '200px', fontSize: '14px', color: '#374151' }}>
                                                {request.reason || 'Aucune raison fournie'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: `${getStatusColor(request.status)}20`,
                                                color: getStatusColor(request.status)
                                            }}>
                                                {getStatusText(request.status)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                                            {formatDate(request.requested_at)}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {request.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowApproveModal(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Approuver
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowRejectModal(true);
                                                        }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Rejeter
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
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
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                            Approuver la demande de mot de passe
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                            Utilisateur: {selectedRequest?.user?.prenom} {selectedRequest?.user?.nom}
                        </p>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                Nouveau mot de passe
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Saisissez le nouveau mot de passe"
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={generateRandomPassword}
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Générer
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setNewPassword('');
                                    setSelectedRequest(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading || !newPassword.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: actionLoading || !newPassword.trim() ? 'not-allowed' : 'pointer',
                                    opacity: actionLoading || !newPassword.trim() ? 0.7 : 1
                                }}
                            >
                                {actionLoading ? 'Approbation...' : 'Approuver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
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
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                            Rejeter la demande de mot de passe
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                            Utilisateur: {selectedRequest?.user?.prenom} {selectedRequest?.user?.nom}
                        </p>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                Raison du rejet (optionnel)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Expliquez pourquoi cette demande est rejetée..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedRequest(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                            >
                                {actionLoading ? 'Rejet...' : 'Rejeter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPasswordRequestsPage;
