import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AdminProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}