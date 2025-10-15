import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", new URLSearchParams({
        username, password
      }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const token = res.data.access_token;
      if (!token) throw new Error("No token returned");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Please check your credentials.";
      alert(`Login failed: ${detail}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Admin Username" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" required />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" required />
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-200" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Not an admin? <Link to="/login" className="text-blue-600 hover:underline">Go to user login</Link>
        </p>
      </div>
    </div>
  );
}