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

      const token = res.data.accessToken;
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
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 border rounded"/>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}