import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSession, initDB, loginUser } from '../services/db';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDB().finally(() => setLoading(false));
    const stored = getSession();
    if (stored) setUser(stored);
  }, []);

  const login = async ({ loginId, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      const authenticated = await loginUser(loginId, password, role);
      if (!authenticated) {
        setError('Incorrect credentials.');
        return null;
      }
      setUser(authenticated);
      navigate(`/${authenticated.role}`);
      return authenticated;
    } catch (err) {
      setError(err?.message || 'Login failed.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
