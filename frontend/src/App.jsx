import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import DataPage from "./pages/DataPage"; // Import the new page

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><History /></ProtectedRoute>}
          />
          <Route
            path="/data"
            element={<ProtectedRoute><DataPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}