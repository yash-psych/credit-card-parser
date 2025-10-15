import { createContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  
  const navigate = useNavigate();

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    
    try {
      const decodedUser = jwtDecode(newToken);
      if (decodedUser.role === 'admin' || decodedUser.role === 'super_admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      console.error("Failed to decode token, logging out:", e);
      localStorage.removeItem("token");
      setToken(null);
      navigate("/login");
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  }, [navigate]);

  const user = useMemo(() => {
    if (token) {
      try {
        return jwtDecode(token);
      } catch (e) {
        logout();
        return null;
      }
    }
    return null;
  }, [token, logout]);

  const value = useMemo(() => ({ token, user, login, logout }), [token, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};