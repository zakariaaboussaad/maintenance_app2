import './bootstrap';
import '../css/app.css';

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Composant principal
const App = () => {
    const [equipements, setEquipements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEquipement, setSelectedEquipement] = useState(null);

    // Récupérer les équipements
    useEffect(() => {
        fetchEquipements();
    }, []);

    const fetchEquipements = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/equipements');
            const data = await response.json();

            if (data.success) {
                setEquipements(data.data);
            } else {
                setError('Erreur lors du chargement des équipements');
            }
        } catch (err) {
            setError('Erreur de connexion à l\'API');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const showEquipementDetails = async (id) => {
        try {
            const response = await fetch(`/api/equipements/${id}`);
            const data = await response.json();

            if (data.success) {
                setSelectedEquipement(data.data);
            }
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'maintenance': 'bg-yellow-100 text-yellow-800',
            'hors_service': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            'active': 'Actif',
            'maintenance': 'En maintenance',
            'hors_service': 'Hors service'
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg">Chargement...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Erreur!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button
                        onClick={fetchEquipements}
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Maintenance App - Test
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Gestion des équipements ({equipements.length} équipements)
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Liste des équipements */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Liste des équipements
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {equipements.map((equipement) => (
                                    <div
                                        key={equipement.id}
                                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        onClick={() => showEquipementDetails(equipement.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                    {equipement.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Code: {equipement.code}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    📍 {equipement.location}
                                                </p>
                                                {equipement.type_equipement && (
                                                    <p className="text-sm text-blue-600">
                                                        Type: {equipement.type_equipement.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipement.status)}`}>
                                                    {getStatusText(equipement.status)}
                                                </span>
                                                <span className="text-xs text-gray-400 mt-2">
                                                    Cliquer pour détails
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Détails de l'équipement sélectionné */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Détails de l'équipement
                                </h2>
                            </div>
                            <div className="p-6">
                                {selectedEquipement ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {selectedEquipement.name}
                                            </h3>
                                            <p className="text-gray-600">
                                                {selectedEquipement.description}
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Code</dt>
                                                    <dd className="text-sm text-gray-900">{selectedEquipement.code}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                                                    <dd className="text-sm text-gray-900">{selectedEquipement.location}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                                                    <dd className="text-sm text-gray-900">
                                                        {selectedEquipement.type_equipement?.name || 'Non défini'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Date d'installation</dt>
                                                    <dd className="text-sm text-gray-900">
                                                        {selectedEquipement.date_installation || 'Non définie'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                                    <dd>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEquipement.status)}`}>
                                                            {getStatusText(selectedEquipement.status)}
                                                        </span>
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* Statistiques */}
                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Statistiques</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <div className="text-lg font-semibold text-blue-600">
                                                        {selectedEquipement.tickets?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-blue-500">Tickets</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 rounded">
                                                    <div className="text-lg font-semibold text-red-600">
                                                        {selectedEquipement.pannes?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-red-500">Pannes</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Sélectionnez un équipement pour voir les détails
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Montage de l'application
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
