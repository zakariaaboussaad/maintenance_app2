// services/apiService.js

// Mock auth token storage (since localStorage isn't available)
let authToken = null;

const API_BASE_URL = 'http://localhost:8000/api';

// Demo accounts for initial login only
const demoAccounts = {
    'admin@onee.com': {
        password: '123456',
        id: 1,
        role_id: 1,
        name: 'Admin ONEE',
        prenom: 'System',
        nom: 'Admin'
    },
    'technicien@onee.com': {
        password: '123456',
        id: 2,
        role_id: 2,
        name: 'Technicien Maintenance',
        prenom: 'Ahmed',
        nom: 'Benali'
    },
    'user@onee.com': {
        password: '123456',
        id: 4,
        role_id: 3,
        name: 'Utilisateur Test',
        prenom: 'Mohamed',
        nom: 'Mansouri'
    }
};

// Enhanced error logging
const logError = (operation, error, additionalInfo = {}) => {
    console.error(`❌ ${operation} failed:`, {
        message: error.message,
        stack: error.stack,
        ...additionalInfo
    });
};

// Enhanced API request function with better error handling
const makeApiRequest = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for session-based auth
    };

    // Only add Authorization header if we have a real token (not demo)
    if (authToken && !authToken.startsWith('demo_token_')) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`, {
        headers: finalOptions.headers,
        body: finalOptions.body ? JSON.parse(finalOptions.body) : undefined
    });

    try {
        const response = await fetch(url, finalOptions);

        console.log(`📡 API Response: ${response.status} ${response.statusText}`, {
            url,
            ok: response.ok
        });

        // Try to parse response as JSON
        let result;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            console.warn('⚠️ Non-JSON response:', text);
            throw new Error(`Invalid response format: ${text}`);
        }

        if (!response.ok) {
            console.error(`❌ API Error ${response.status}:`, result);
            throw new Error(`HTTP ${response.status}: ${result.message || result.error || 'Unknown error'}`);
        }

        console.log('✅ API Success:', result);
        return result;

    } catch (error) {
        logError('API Request', error, { url, options: finalOptions });
        throw error;
    }
};

// Auth API functions
export const authService = {
    async login(email, password) {
        // Try to connect to Laravel API with session-based auth
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (result.success && result.user) {
                // Store token if provided (for compatibility)
                authToken = result.token || 'session_auth_' + Date.now();
                console.log('✅ API login successful with session auth');
                return { success: true, user: result.user, token: authToken };
            } else {
                return { success: false, message: result.message || 'Login failed' };
            }

        } catch (error) {
            console.log('🔌 API connection failed:', error.message);
            return { success: false, message: 'Unable to connect to server: ' + error.message };
        }
    },

    logout() {
        authToken = null;
    },

    getToken() {
        return authToken;
    },

    isDemoMode() {
        return authToken && authToken.startsWith('demo_token_');
    },

    isSessionAuth() {
        return authToken && authToken.startsWith('session_auth_');
    },

    async getCurrentUser() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/auth/me`, {
                method: 'GET'
            });

            if (result.success && result.user) {
                return result.user;
            } else {
                throw new Error(result.message || 'Failed to get current user');
            }
        } catch (err) {
            logError('Get Current User', err);
            throw new Error(`Unable to get current user: ${err.message}`);
        }
    },

    async updateProfile(profileData) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message || 'Profile update failed' };
            }
        } catch (err) {
            logError('Update Profile', err);
            throw new Error(`Unable to update profile: ${err.message}`);
        }
    },

    async requestPasswordChange(requestData) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/password-requests`, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Password request failed' };
            }
        } catch (err) {
            logError('Request Password Change', err);
            throw new Error(`Unable to request password change: ${err.message}`);
        }
    },

    async getPasswordRequests() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/password-requests`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from password requests API');
            }
        } catch (err) {
            logError('Get Password Requests', err);
            throw new Error(`Unable to fetch password requests: ${err.message}`);
        }
    },

    async approvePasswordRequest(requestId, newPassword) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/password-requests/${requestId}/approve`, {
                method: 'POST',
                body: JSON.stringify({ new_password: newPassword })
            });

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Approval failed' };
            }
        } catch (err) {
            logError('Approve Password Request', err);
            throw new Error(`Unable to approve password request: ${err.message}`);
        }
    },

    async rejectPasswordRequest(requestId, reason) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/password-requests/${requestId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ rejection_reason: reason })
            });

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Rejection failed' };
            }
        } catch (err) {
            logError('Reject Password Request', err);
            throw new Error(`Unable to reject password request: ${err.message}`);
        }
    }
};

// Equipment API functions
export const equipmentService = {
    async getEquipements() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/equipements`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from equipment API');
            }

        } catch (err) {
            logError('Get Equipements', err);
            throw new Error(`Unable to fetch equipment: ${err.message}`);
        }
    },

    async getUserEquipements(userId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/equipements/user/${userId}`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from user equipment API');
            }

        } catch (err) {
            logError('Get User Equipements', err, { userId });
            throw new Error(`Unable to fetch user equipment: ${err.message}`);
        }
    }
};

// Tickets API functions
export const ticketService = {
    async getUserTickets(userId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/tickets/user/${userId}`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from user tickets API');
            }

        } catch (err) {
            logError('Get User Tickets', err, { userId });
            throw new Error(`Unable to fetch user tickets: ${err.message}`);
        }
    },

    async getAllTickets() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/tickets`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from tickets API');
            }

        } catch (err) {
            logError('Get All Tickets', err);
            throw new Error(`Unable to fetch tickets: ${err.message}`);
        }
    },

    async checkTicketAssignment(ticketId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/tickets/${ticketId}/check-assignment`);

            if (result.success) {
                return {
                    success: true,
                    isAssigned: result.isAssigned,
                    assignedTechnician: result.assignedTechnician
                };
            } else {
                throw new Error('Invalid response format from assignment check API');
            }

        } catch (err) {
            logError('Check Ticket Assignment', err, { ticketId });
            throw new Error(`Unable to check ticket assignment: ${err.message}`);
        }
    },

    async assignTicket(ticketId, technicianId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
                method: 'POST',
                body: JSON.stringify({ technician_id: technicianId })
            });

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Assignment failed' };
            }

        } catch (err) {
            logError('Assign Ticket', err, { ticketId, technicianId });
            throw new Error(`Unable to assign ticket: ${err.message}`);
        }
    },

    async updateTicket(ticketId, payload) {
        console.log(`🔧 Updating ticket ${ticketId} with payload:`, payload);

        try {
            // Validate payload
            if (!payload || Object.keys(payload).length === 0) {
                throw new Error('Empty payload provided');
            }

            // Clean payload - remove any undefined values
            const cleanPayload = {};
            Object.keys(payload).forEach(key => {
                if (payload[key] !== undefined && payload[key] !== null) {
                    cleanPayload[key] = payload[key];
                }
            });

            console.log('🧹 Clean payload:', cleanPayload);

            const result = await makeApiRequest(`${API_BASE_URL}/tickets/${ticketId}`, {
                method: 'PUT',
                body: JSON.stringify(cleanPayload)
            });

            if (result.success) {
                console.log('✅ Ticket updated successfully:', result.data);
                return { success: true, data: result.data };
            } else {
                console.error('❌ Update failed:', result);
                return { success: false, message: result.message || 'Update failed' };
            }

        } catch (err) {
            logError('Update Ticket', err, { ticketId, payload });
            throw new Error(`Unable to update ticket: ${err.message}`);
        }
    },

    async getTechnicianTickets(technicianId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/tickets/technician/${technicianId}`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from technician tickets API');
            }

        } catch (err) {
            logError('Get Technician Tickets', err, { technicianId });
            throw new Error(`Unable to fetch technician tickets: ${err.message}`);
        }
    }
};

// Users API functions
export const userService = {
    async getAllUsers() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/utilisateurs`);

            if (result.success && Array.isArray(result.users)) {
                return { success: true, data: result.users };
            } else if (result.success && Array.isArray(result.data)) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from users API');
            }
        } catch (err) {
            logError('Get All Users', err);
            throw new Error(`Unable to fetch users: ${err.message}`);
        }
    },

    async getTechnicians() {
        const all = await this.getAllUsers();
        if (!all.success) return all;

        const technicians = all.data.filter((u) => {
            const roleName = (u.role?.nom_role || u.role?.nom || u.role?.name || '').toLowerCase();
            return u.role_id === 2 || u.id_role === 2 || roleName.includes('tech');
        });

        return { success: true, data: technicians };
    }
};

// API Health Check
export const checkApiHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        return response.ok;
    } catch (error) {
        console.log('🔴 API Health Check Failed:', error.message);
        return false;
    }
};

// Notification API functions
export const notificationService = {
    async getNotifications() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/notifications`);

            if (result.success && result.data) {
                return { success: true, data: result.data };
            } else {
                throw new Error('Invalid response format from notifications API');
            }
        } catch (err) {
            logError('Get Notifications', err);
            throw new Error(`Unable to fetch notifications: ${err.message}`);
        }
    },

    async markAsRead(notificationId) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'POST'
            });

            if (result.success) {
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Mark as read failed' };
            }
        } catch (err) {
            logError('Mark Notification as Read', err);
            throw new Error(`Unable to mark notification as read: ${err.message}`);
        }
    },

    async markAllAsRead() {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/notifications/mark-all-read`, {
                method: 'POST'
            });

            if (result.success) {
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Mark all as read failed' };
            }
        } catch (err) {
            logError('Mark All Notifications as Read', err);
            throw new Error(`Unable to mark all notifications as read: ${err.message}`);
        }
    },

    async getPreferences() {
        if (authService.isDemoMode()) {
            // Return default preferences for demo mode
            return {
                ticket_nouveau: true,
                ticket_assigne: true,
                ticket_mis_a_jour: true,
                ticket_ferme: true,
                commentaire_ajoute: true,
                system: true
            };
        }

        try {
            const result = await makeApiRequest(`${API_BASE_URL}/notification-preferences`);

            if (result.success && result.data) {
                return result.data;
            } else {
                // Return default preferences if none exist
                return {
                    ticket_nouveau: true,
                    ticket_assigne: true,
                    ticket_mis_a_jour: true,
                    ticket_ferme: true,
                    commentaire_ajoute: true,
                    system: true
                };
            }
        } catch (err) {
            logError('Get Notification Preferences', err);
            // Return default preferences on error
            return {
                ticket_nouveau: true,
                ticket_assigne: true,
                ticket_mis_a_jour: true,
                ticket_ferme: true,
                commentaire_ajoute: true,
                system: true
            };
        }
    },

    async updatePreferences(preferences) {
        try {
            const result = await makeApiRequest(`${API_BASE_URL}/notification-preferences`, {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });

            if (result.success) {
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Preferences update failed' };
            }
        } catch (err) {
            logError('Update Notification Preferences', err);
            throw new Error(`Unable to update notification preferences: ${err.message}`);
        }
    }
};

// Debug function to test API endpoints
export const debugApi = {
    async testEndpoints() {
        console.log('🧪 Testing API endpoints...');

        const endpoints = [
            `${API_BASE_URL}/tickets`,
            `${API_BASE_URL}/equipements`,
            `${API_BASE_URL}/utilisateurs`
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': authToken ? `Bearer ${authToken}` : undefined
                    }
                });
                console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }
};

// Default export for the main API service
const apiService = {
    // HTTP methods
    async get(endpoint) {
        return await makeApiRequest(`${API_BASE_URL}${endpoint}`);
    },

    async post(endpoint, data) {
        return await makeApiRequest(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return await makeApiRequest(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return await makeApiRequest(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE'
        });
    },

    // Service modules
    auth: authService,
    equipment: equipmentService,
    ticket: ticketService,
    user: userService,
    notification: notificationService,
    debug: debugApi
};

export default apiService;
