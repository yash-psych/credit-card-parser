import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar(){
  const { token, username, logout } = useAuth();

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="text-blue-600 font-bold text-lg">💳 Credit Parser</div>
        {token && <div className="text-sm text-gray-600">Welcome, {username}</div>}
      </div>

      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link to="/history" className="text-sm hover:underline">History</Link>
            <button onClick={logout} className="text-red-500 text-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:underline">Login</Link>
            <Link to="/register" className="text-sm hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}