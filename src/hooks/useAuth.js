import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Preload user data from localStorage
    const loadUserData = useCallback(() => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return null;
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user'); // Clear corrupted data
            return null;
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = () => {
            const userData = loadUserData();
            setUser(userData);
            setLoading(false);
            setInitialized(true);
        };

        // Use setTimeout to ensure DOM is ready and prevent blocking
        const timer = setTimeout(initializeAuth, 0);
        return () => clearTimeout(timer);
    }, [loadUserData]);

    const login = useCallback((userData) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastLogin', Date.now().toString());
            setUser(userData);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('lastLogin');
            setUser(null);
        } catch (error) {
            console.error('Error clearing user data:', error);
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