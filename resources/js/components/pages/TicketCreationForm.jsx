import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const TicketCreationForm = ({ equipment, onClose, onTicketCreated }) => {
    const [formData, setFormData] = useState({
        equipment: equipment,
        problemType: [],
        problemDetails: [],
        description: '',
        comment: ''
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

    const handleSubmit = async () => {
        if (!formData.problemType.length || !formData.description.trim()) {
            alert('Veuillez sélectionner au moins un type de problème et ajouter une description.');
            return;
        }

        setIsSubmitting(true);
        try {
            const ticketData = {
                equipement_id: equipment.numero_serie,
                demandeur_id: equipment.utilisateur_assigne,
                categorie_id: 1, // Default category
                type_probleme: formData.problemType.join(', '),
                details_probleme: formData.problemDetails.join(', '),
                description: formData.description,
                commentaire: formData.comment,
                status: 'En Attente',
                priorite: 'Normale'
            };

            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(ticketData)
            });

            if (response.ok) {
                setShowConfirmation(true);
                setTimeout(() => {
                    onTicketCreated();
                    onClose();
                }, 2000);
            } else {
                throw new Error('Erreur lors de la création du ticket');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création du ticket. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                maxWidth: '1000px',
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
                        onClick={onClose}
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
                                        {equipment.marque} {equipment.modele}
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
                                    {equipment.status}
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
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
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

                        {/* Comment */}
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
                                Ajouter un commentaire (optionnel)
                            </div>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    comment: e.target.value
                                }))}
                                placeholder="Commentaire pour le technicien..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
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
                                        lineHeight: '1.5'
                                    }}>
                                        {formData.description}
                                    </div>
                                </div>
                            )}

                            {/* Comment */}
                            {formData.comment && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Commentaire:
                                    </div>
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        lineHeight: '1.5',
                                        fontStyle: 'italic'
                                    }}>
                                        {formData.comment}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
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
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1f2937',
                                marginBottom: '12px'
                            }}>
                                Confirmer la création du ticket
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '20px'
                            }}>
                                Votre ticket a été créé avec succès ! L'équipe technique sera notifiée.
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
            </div>
        </div>
    );
};

export default TicketCreationForm;
