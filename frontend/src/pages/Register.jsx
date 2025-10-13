import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function Register(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
       username,
       password
     });

      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
       console.error("Registration error:", err);
       // This will show the specific error from the backend (e.g., "Username already taken")
       const detail = err.response?.data?.detail || "An unknown error occurred.";
       alert(`Registration failed: ${detail}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Register</h2>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username" 
          className="w-full p-2 border rounded"
        />
        <input 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded"
        />
        <button 
          type="submit" 
          className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400" 
          disabled={isLoading}
        >
            {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}