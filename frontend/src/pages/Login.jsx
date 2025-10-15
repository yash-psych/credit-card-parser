import { useState } from "react";
import { api } from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Login() {
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
      login(token, username);
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
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}