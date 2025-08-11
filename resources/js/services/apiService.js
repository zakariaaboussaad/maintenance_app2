// services/apiService.js

// Mock auth token storage (since localStorage isn't available)
let authToken = null;

const API_BASE_URL = 'http://localhost:8000/api';

// Demo accounts for testing when API is not available
// These match the actual database users with correct IDs and role_ids
const demoAccounts = {
    'admin@onee.com': {
        password: '123456',
        id: 1,           // user_id from database
        role_id: 1,      // for routing to admin dashboard
        name: 'Admin ONEE',
        prenom: 'System',
        nom: 'Admin'
    },
    'technicien@onee.com': {
        password: '123456',
        id: 2,           // user_id from database
        role_id: 2,      // for routing to technician dashboard
        name: 'Technicien Maintenance',
        prenom: 'Ahmed',
        nom: 'Benali'
    },
    'user@onee.com': {
        password: '123456',
        id: 4,           // user_id from database (matching tickets table)
        role_id: 3,      // for routing to user dashboard
        name: 'Utilisateur Test',
        prenom: 'Mohamed',
        nom: 'Mansouri'
    }
};

// Auth API functions
export const authService = {
    async login(email, password) {
        // First, try demo login for known demo accounts
        const emailLower = email.toLowerCase();
        if (demoAccounts[emailLower]) {
            if (demoAccounts[emailLower].password === password) {
                console.log(`✅ Demo account found: ${emailLower} with user_id: ${demoAccounts[emailLower].id} and role_id: ${demoAccounts[emailLower].role_id}`);
                const account = demoAccounts[emailLower];
                const demoUser = {
                    id: account.id,           // Use actual user ID from database for data fetching
                    name: account.name,
                    email: email,
                    role_id: account.role_id, // Use role_id for routing to correct dashboard
                    prenom: account.prenom,
                    nom: account.nom
                };

                authToken = 'demo_token_' + Date.now();
                return { success: true, user: demoUser, token: authToken };
            } else {
                return { success: false, message: 'Email ou mot de passe incorrect' };
            }
        }

        // Try to connect to Laravel API
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (result.token) {
                    authToken = result.token;
                }
                return { success: true, user: result.user, token: result.token };
            } else {
                return { success: false, message: result.message || 'Email ou mot de passe incorrect' };
            }

        } catch (error) {
            console.log('API non disponible, démonstration disponible avec les comptes de test');
            return { success: false, message: 'Impossible de se connecter au serveur. Utilisez les comptes de démonstration.' };
        }
    },

    logout() {
        authToken = null;
    },

    getToken() {
        return authToken;
    }
};

// Equipment API functions
export const equipmentService = {
    async getEquipements() {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/equipements`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour les équipements');
            throw new Error('Impossible de récupérer les équipements');
        }
    },

    async getUserEquipements(userId) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/equipements/user/${userId}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour les équipements utilisateur');
            throw new Error('Impossible de récupérer les équipements utilisateur');
        }
    }
};

// Tickets API functions
export const ticketService = {
    async getUserTickets(userId) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour les tickets');
            throw new Error('Impossible de récupérer les tickets');
        }
    },

    async getAllTickets() {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour les tickets');
            throw new Error('Impossible de récupérer les tickets');
        }
    },

    async checkTicketAssignment(ticketId) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/check-assignment`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    isAssigned: result.isAssigned,
                    assignedTechnician: result.assignedTechnician
                };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour la vérification d\'assignation');
            throw new Error('Impossible de vérifier l\'assignation du ticket');
        }
    },

    async assignTicket(ticketId, technicianId) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ technician_id: technicianId })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Erreur lors de l\'assignation' };
            }

        } catch (err) {
            console.log('API non disponible pour l\'assignation');
            throw new Error('Impossible d\'assigner le ticket');
        }
    },

    async updateTicket(ticketId, payload) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, message: result.message || 'Erreur lors de la mise à jour du ticket' };
            }

            return { success: true, data: result.data };
        } catch (err) {
            console.log('API non disponible pour la mise à jour du ticket');
            throw new Error('Impossible de mettre à jour le ticket');
        }
    },

    async getTechnicianTickets(technicianId) {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/tickets/technician/${technicianId}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Format de réponse invalide');
            }

        } catch (err) {
            console.log('API non disponible pour les tickets du technicien');
            throw new Error('Impossible de récupérer les tickets du technicien');
        }
    }
};
