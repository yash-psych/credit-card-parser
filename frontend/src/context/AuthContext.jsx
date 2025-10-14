import { createContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const navigate = useNavigate();

  const login = useCallback((newToken, newUsername) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    navigate("/dashboard");
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    navigate("/login");
  }, [navigate]);

  const value = { token, username, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};