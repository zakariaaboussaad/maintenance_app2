import React, { useState, useEffect } from 'react';
import { X, Ticket, Monitor, User, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import apiService from '../../services/apiService';

const UserTicketsModal = ({ user, isOpen, onClose }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserTickets();
        }
    }, [isOpen, user]);

    const fetchUserTickets = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.get(`/history/users/${user.id_user}/tickets`);
            if (response.success) {
                setTickets(response.data.tickets);
                setUserInfo(response.data.user);
            } else {
                setError('Erreur lors du chargement des tickets');
            }
        } catch (err) {
            console.error('Error fetching user tickets:', err);
            setError('Erreur lors du chargement des tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ouvert':
                return <AlertCircle className="h-4 w-4 text-blue-500" />;
            case 'en_cours':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'resolu':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ferme':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            case 'en_attente':
                return <Clock className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ouvert':
                return 'bg-blue-100 text-blue-800';
            case 'en_cours':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolu':
                return 'bg-green-100 text-green-800';
            case 'ferme':
                return 'bg-gray-100 text-gray-800';
            case 'en_attente':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priorite) => {
        switch (priorite) {
            case 'haute':
                return 'bg-red-100 text-red-800';
            case 'normale':
                return 'bg-blue-100 text-blue-800';
            case 'basse':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status) => {
        const statusMap = {
            'ouvert': 'Ouvert',
            'en_cours': 'En cours',
            'resolu': 'Résolu',
            'ferme': 'Fermé',
            'en_attente': 'En attente'
        };
        return statusMap[status] || status;
    };

    const formatPriority = (priorite) => {
        const priorityMap = {
            'haute': 'Haute',
            'normale': 'Normale',
            'basse': 'Basse'
        };
        return priorityMap[priorite] || priorite;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <User className="h-6 w-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Historique des Tickets - {user.full_name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {user.email} • {user.role_name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-8">
                            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun ticket trouvé pour cet utilisateur</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Résumé</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
                                        <div className="text-sm text-gray-600">Total Tickets</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {tickets.filter(t => t.status === 'resolu').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Résolus</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {tickets.filter(t => ['ouvert', 'en_cours', 'en_attente'].includes(t.status)).length}
                                        </div>
                                        <div className="text-sm text-gray-600">En cours</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {tickets.filter(t => t.priorite === 'haute').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Priorité Haute</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tickets List */}
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    {getStatusIcon(ticket.status)}
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {ticket.titre}
                                                    </h4>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {formatStatus(ticket.status)}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorite)}`}>
                                                        {formatPriority(ticket.priorite)}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 mb-3">{ticket.description}</p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    {ticket.equipement && (
                                                        <div className="flex items-center space-x-2">
                                                            <Monitor className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">Équipement:</span>
                                                            <span className="font-medium">
                                                                {ticket.equipement.marque} {ticket.equipement.modele}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {ticket.technicien_assigne && (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">Technicien:</span>
                                                            <span className="font-medium">
                                                                {ticket.technicien_assigne.full_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600">Créé le:</span>
                                                        <span className="font-medium">
                                                            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    
                                                    {ticket.categorie && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-gray-600">Catégorie:</span>
                                                            <span className="font-medium">{ticket.categorie}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {ticket.commentaire_resolution && (
                                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-sm text-green-800">
                                                            <strong>Résolution:</strong> {ticket.commentaire_resolution}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserTicketsModal;
