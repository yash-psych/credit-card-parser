import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register", { username, password });
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
       console.error("Registration error:", err);
       const detail = err.response?.data?.detail || "An unknown error occurred.";
       alert(`Registration failed: ${detail}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}