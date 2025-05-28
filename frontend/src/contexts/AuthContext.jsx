import React, { createContext, useState, useEffect, useContext } from 'react';
import http, { ensureCsrf } from '../lib/http';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Fetch current user once on app load
    useEffect(() => {
        (async () => {
            try {
                await ensureCsrf();           // make sure CSRF cookie is set
                const res = await http.get('/api/user');
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // logout helper
    const logout = async () => {
        await http.post('/auth/logout');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// custom hook for convenience
export function useAuth() {
    return useContext(AuthContext);
}