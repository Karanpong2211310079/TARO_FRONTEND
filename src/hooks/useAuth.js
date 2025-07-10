import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = () => {
            const userData = localStorage.getItem('user');
            if (!userData) return null;
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        };

        const userData = getUser();
        setUser(userData);
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('lastLogin', Date.now().toString());
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('lastLogin');
        setUser(null);
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.user?.role === 'admin';

    return {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
    };
}; 