import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleVerify = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to verify user.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 border-b pb-4">Admin Dashboard: User Management</h2>
      {isLoading ? (
        <p className="text-neutral-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-neutral-500 uppercase">ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-neutral-500 uppercase">Username</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-neutral-500 uppercase">Role</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-neutral-500 uppercase">Status</th>
                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-neutral-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="text-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4 border-b">{user.id}</td>
                  <td className="py-3 px-4 border-b">{user.username}</td>
                  <td className="py-3 px-4 border-b">{user.role}</td>
                  <td className="py-3 px-4 border-b">
                    {user.is_verified ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Not Verified</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    {!user.is_verified && user.role !== 'super_admin' && (
                      <button 
                        onClick={() => handleVerify(user.id)}
                        className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                      >
                        Verify
                      </button>
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