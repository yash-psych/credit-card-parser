import { useEffect, useState } from "react";
import { api } from "../api/axios"; // We don't need BASE_URL here anymore
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DataPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/files/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const chartData = res.data.map(item => ({
          ...item,
          total_balance: parseFloat(item.data?.total_balance?.replace(/,/g, '') || 0)
        }));
        setHistory(chartData);
      } catch (err) {
        console.error(err);
        alert("Could not fetch upload history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // NEW, MORE ROBUST EXPORT FUNCTION
  const handleExport = async (format) => {
    const fileExtensions = {
      xlsx: 'xlsx',
      pdf: 'pdf',
      docx: 'docx'
    };
    const fileName = `exported_data.${fileExtensions[format]}`;

    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/data/export/${format}`, {
        params: {
          authorization: `Bearer ${token}` // Pass token as query param
        },
        responseType: 'blob', // This is the crucial part
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export failed:", err);
      alert("An error occurred while exporting the data.");
    }
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Data Visualization & Export</h2>
      
      {/* Chart Section */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Total Balance by Issuer</h3>
        {isLoading ? (
          <p>Loading chart data...</p>
        ) : (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="issuer" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total_balance" fill="#8884d8" name="Total Balance Due" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Export All Data</h3>
        <div className="flex space-x-4">
          <button onClick={() => handleExport('xlsx')} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">
            Export to Excel (.xlsx)
          </button>
          <button onClick={() => handleExport('pdf')} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
            Export to PDF (.pdf)
          </button>
          <button onClick={() => handleExport('docx')} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Export to Word (.docx)
          </button>
        </div>
      </div>
    </div>
  );
}