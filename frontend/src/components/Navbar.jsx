import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { token, username, logout } = useAuth();

  const activeLinkStyle = {
    textDecoration: 'underline',
    color: '#2563eb'
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <NavLink to="/" className="text-blue-600 font-bold text-xl">
          💳 Credit Parser
        </NavLink>
        {token && <span className="text-gray-600">Welcome, {username}!</span>}
      </div>
      <div className="space-x-6">
        {token ? (
          <>
            <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Dashboard</NavLink>
            <NavLink to="/history" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>History</NavLink>
            <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Login</NavLink>
            <NavLink to="/register" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}