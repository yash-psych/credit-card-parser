import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function History(){
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/files/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        alert("Could not fetch history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload History</h2>
      {isLoading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <p>No uploads yet.</p>
      ) : (
        <ul>
          {history.map((item, idx) => (
            <li key={idx} className="bg-white p-4 mb-2 shadow rounded">
              <p><strong>File:</strong> {item.filename}</p>
              <p><strong>Issuer:</strong> {item.issuer}</p>
              <p><strong>Due Date:</strong> {item.data?.due_date}</p>
              <p><strong>Total Due:</strong> {item.data?.total_due}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}