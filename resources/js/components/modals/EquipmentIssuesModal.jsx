import React, { useState, useEffect } from 'react';
import { X, Monitor, AlertTriangle, Wrench, User, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import apiService from '../../services/apiService';

const EquipmentIssuesModal = ({ equipment, isOpen, onClose }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [equipmentInfo, setEquipmentInfo] = useState(null);
    const [stats, setStats] = useState({ total_issues: 0, tickets_count: 0, pannes_count: 0 });

    useEffect(() => {
        if (isOpen && equipment) {
            fetchEquipmentIssues();
        }
    }, [isOpen, equipment]);

    const fetchEquipmentIssues = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.get(`/history/equipments/${equipment.numero_serie}/issues`);
            if (response.success) {
                setIssues(response.data.issues);
                setEquipmentInfo(response.data.equipment);
                setStats({
                    total_issues: response.data.total_issues,
                    tickets_count: response.data.tickets_count,
                    pannes_count: response.data.pannes_count
                });
            } else {
                setError('Erreur lors du chargement des problèmes');
            }
        } catch (err) {
            console.error('Error fetching equipment issues:', err);
            setError('Erreur lors du chargement des problèmes');
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

    const getTypeIcon = (type) => {
        return type === 'ticket' ? 
            <AlertTriangle className="h-5 w-5 text-orange-500" /> : 
            <Wrench className="h-5 w-5 text-red-500" />;
    };

    const getTypeColor = (type) => {
        return type === 'ticket' ? 
            'bg-orange-100 text-orange-800' : 
            'bg-red-100 text-red-800';
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

    const formatType = (type) => {
        return type === 'ticket' ? 'Ticket' : 'Panne';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <Monitor className="h-6 w-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Historique des Problèmes - {equipment.marque} {equipment.modele}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {equipment.numero_serie} • {equipment.localisation}
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
                    ) : issues.length === 0 ? (
                        <div className="text-center py-8">
                            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun problème trouvé pour cet équipement</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Equipment Info */}
                            {equipmentInfo && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informations Équipement</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Type:</span>
                                            <span className="ml-2 font-medium">{equipmentInfo.type_equipement || 'Non défini'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Statut:</span>
                                            <span className="ml-2 font-medium">{equipmentInfo.status}</span>
                                        </div>
                                        {equipmentInfo.utilisateur_assigne && (
                                            <div>
                                                <span className="text-gray-600">Assigné à:</span>
                                                <span className="ml-2 font-medium">{equipmentInfo.utilisateur_assigne.full_name}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-600">Localisation:</span>
                                            <span className="ml-2 font-medium">{equipmentInfo.localisation}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Résumé des Problèmes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{stats.total_issues}</div>
                                        <div className="text-sm text-gray-600">Total Problèmes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{stats.tickets_count}</div>
                                        <div className="text-sm text-gray-600">Tickets</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{stats.pannes_count}</div>
                                        <div className="text-sm text-gray-600">Pannes</div>
                                    </div>
                                </div>
                            </div>

                            {/* Issues List */}
                            <div className="space-y-4">
                                {issues.map((issue, index) => (
                                    <div key={`${issue.type}-${issue.id}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    {getTypeIcon(issue.type)}
                                                    {getStatusIcon(issue.status)}
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {issue.titre}
                                                    </h4>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(issue.type)}`}>
                                                        {formatType(issue.type)}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                                                        {formatStatus(issue.status)}
                                                    </span>
                                                    {issue.priorite && (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priorite)}`}>
                                                            {formatPriority(issue.priorite)}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-gray-600 mb-3">{issue.description}</p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    {issue.user && (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">Créé par:</span>
                                                            <span className="font-medium">{issue.user.full_name}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {issue.technicien_assigne && (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">Technicien:</span>
                                                            <span className="font-medium">{issue.technicien_assigne.full_name}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {issue.type === 'ticket' ? 'Créé le:' : 'Date panne:'}
                                                        </span>
                                                        <span className="font-medium">
                                                            {new Date(issue.type === 'ticket' ? issue.created_at : (issue.date_panne || issue.created_at)).toLocaleDateString('fr-FR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    
                                                    {issue.categorie && (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-gray-600">Catégorie:</span>
                                                            <span className="font-medium">{issue.categorie}</span>
                                                        </div>
                                                    )}

                                                    {issue.date_resolution && (
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">Résolu le:</span>
                                                            <span className="font-medium">
                                                                {new Date(issue.date_resolution).toLocaleDateString('fr-FR', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {issue.commentaire_resolution && (
                                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-sm text-green-800">
                                                            <strong>Résolution:</strong> {issue.commentaire_resolution}
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

export default EquipmentIssuesModal;
