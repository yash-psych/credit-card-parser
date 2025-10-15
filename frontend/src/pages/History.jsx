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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        alert("Could not fetch upload history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Upload History</h2>
      {isLoading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">You haven't uploaded any statements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-lg text-gray-800">{item.filename}</p>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{item.issuer}</span>
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