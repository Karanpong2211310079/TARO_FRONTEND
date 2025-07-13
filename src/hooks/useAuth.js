import { useState, useEffect, useCallback } from 'react';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = () => {
            // Use authUtils for faster authentication check
            if (authUtils.isAuthenticated()) {
                const userData = authUtils.getCurrentUser();
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
            setInitialized(true);
        };

        // Initialize immediately
        initializeAuth();
    }, []);

    const login = useCallback((userData) => {
        try {
            if (authUtils.setSession(userData)) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            authUtils.clearSession();
            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }, []);

    const isAuthenticated = !!user;
    const isAdmin = user?.user?.role === 'admin';

    return {
        user,
        loading,
        initialized,
        isAuthenticated,
        isAdmin,
        login,
        logout,
    };
}; 