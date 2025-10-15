import { useEffect, useState } from "react";
import { api } from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: loggedInUser } = useAuth(); // Get the currently logged-in user

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      alert("Could not fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApiCall = async (endpoint) => {
    if (!window.confirm("Are you sure you want to perform this action?")) return;
    try {
      await api.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers(); // Refresh the list after action
    } catch (err) {
      console.error(err);
      alert(`Action failed: ${err.response?.data?.detail || "An error occurred."}`);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert(`Password reset successfully!\nNew Password: ${res.data.new_password}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(`Action failed: ${err.response?.data?.detail || "An error occurred."}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 border-b pb-4">Admin Dashboard: User Management</h2>
      {isLoading ? (
        <p className="text-neutral-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-500 uppercase">Username</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-500 uppercase">Role</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-500 uppercase">Status</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="text-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4 border-b">{user.username}</td>
                  <td className="py-3 px-4 border-b">{user.role}</td>
                  <td className="py-3 px-4 border-b">
                    {user.status === 'active' ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Suspended</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b text-center space-x-2">
                    {/* --- Action Buttons --- */}
                    {loggedInUser?.sub !== user.username && user.role !== 'super_admin' && (
                      <>
                        {loggedInUser?.role === 'super_admin' && user.role === 'user' && (
                          <button onClick={() => handleApiCall(`/admin/users/${user.id}/promote`)} className="bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600">Promote</button>
                        )}
                        {loggedInUser?.role === 'super_admin' && user.role === 'admin' && (
                          <button onClick={() => handleApiCall(`/admin/users/${user.id}/demote`)} className="bg-yellow-500 text-white text-xs py-1 px-2 rounded hover:bg-yellow-600">Demote</button>
                        )}
                        <button onClick={() => handleApiCall(`/admin/users/${user.id}/toggle-suspend`)} className={`text-white text-xs py-1 px-2 rounded ${user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                          {user.status === 'active' ? 'Suspend' : 'Unsuspend'}
                        </button>
                        <button onClick={() => handleResetPassword(user.id)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600">Reset Pass</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}