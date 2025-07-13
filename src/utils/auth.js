// Authentication utilities
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const authUtils = {
    // Check if user is authenticated
    isAuthenticated: () => {
        try {
            const user = localStorage.getItem('user');
            if (!user) return false;

            const lastLogin = localStorage.getItem('lastLogin');
            if (!lastLogin) return false;

            const lastLoginTime = parseInt(lastLogin);
            const currentTime = Date.now();

            // Check if session is expired
            if ((currentTime - lastLoginTime) > SESSION_EXPIRY) {
                authUtils.clearSession();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    // Get current user
    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            if (!user) return null;

            // Check if session is expired
            if (!authUtils.isAuthenticated()) {
                return null;
            }

            return JSON.parse(user);
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Set user session
    setSession: (userData) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastLogin', Date.now().toString());
            return true;
        } catch (error) {
            console.error('Error setting session:', error);
            return false;
        }
    },

    // Clear user session
    clearSession: () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('lastLogin');
            return true;
        } catch (error) {
            console.error('Error clearing session:', error);
            return false;
        }
    },

    // Check if user is admin
    isAdmin: () => {
        try {
            const user = authUtils.getCurrentUser();
            return user?.user?.role === 'admin';
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    },

    // Get session expiry time
    getSessionExpiry: () => {
        try {
            const lastLogin = localStorage.getItem('lastLogin');
            if (!lastLogin) return null;

            const lastLoginTime = parseInt(lastLogin);
            return lastLoginTime + SESSION_EXPIRY;
        } catch (error) {
            console.error('Error getting session expiry:', error);
            return null;
        }
    },

    // Check if session is about to expire (within 1 hour)
    isSessionExpiringSoon: () => {
        try {
            const expiryTime = authUtils.getSessionExpiry();
            if (!expiryTime) return true;

            const currentTime = Date.now();
            const oneHour = 60 * 60 * 1000;

            return (expiryTime - currentTime) < oneHour;
        } catch (error) {
            console.error('Error checking session expiry soon:', error);
            return true;
        }
    },

    // Refresh session
    refreshSession: () => {
        try {
            const user = authUtils.getCurrentUser();
            if (user) {
                localStorage.setItem('lastLogin', Date.now().toString());
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing session:', error);
            return false;
        }
    }
};

export default authUtils; 