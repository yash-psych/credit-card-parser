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
      const res = await api.post("/auth/login", new URLSearchParams({ username, password }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      const token = res.data.access_token;
      if (!token) throw new Error("No token returned");
      login(token);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Please check your credentials.";
      alert(`Login failed: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Access for authorized personnel only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin Username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-neutral-800"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-neutral-800"
            required
          />
          <button
            type="submit"
            className="w-full py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Not an admin?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Go to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}