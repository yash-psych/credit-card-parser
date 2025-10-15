import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function History() {
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
        <div className="text-center py-10">
          <p className="text-gray-500">You haven't uploaded any statements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-lg text-gray-800">{item.filename}</p>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{item.issuer}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <p><strong>Card (Last 4):</strong> {item.data?.last_4_digits || 'N/A'}</p>
                <p><strong>Card Variant:</strong> {item.data?.card_variant || 'N/A'}</p>
                <p><strong>Billing Cycle:</strong> {item.data?.billing_cycle || 'N/A'}</p>
                <p><strong>Payment Due Date:</strong> {item.data?.payment_due_date || 'N/A'}</p>
                <p><strong>Total Balance:</strong> {item.data?.total_balance || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}