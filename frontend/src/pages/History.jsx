import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [allIssuers, setAllIssuers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ issuer: '', period: '' });

  // Fetch data whenever filters change
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/files/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: {
            issuer: filters.issuer || null,
            period: filters.period || null,
          }
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch history");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [filters]);

  // Fetch all unique issuers on initial component load for the dropdown
  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const res = await api.get("/files/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const uniqueIssuers = [...new Set(res.data.map(item => item.issuer))];
        setAllIssuers(uniqueIssuers);
      } catch (err) {
        console.error("Could not fetch issuers", err);
      }
    };
    fetchIssuers();
  }, []);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setFilters({ issuer: '', period: '' });
  };

  const handleExport = async (format) => {
    const fileName = `exported_data.${format}`;
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/data/export/${format}`, {
        params: {
          authorization: `Bearer ${token}`,
          issuer: filters.issuer || null,
          period: filters.period || null,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("An error occurred while exporting the data.");
    }
  };

  const timePeriodLabels = { day: 'Last 24 Hours', week: 'Last Week', month: 'Last Month', year: 'Last Year' };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Upload History</h2>
        
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Bank/Issuer</label>
            <select
              value={filters.issuer}
              onChange={(e) => handleFilterChange('issuer', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Issuers</option>
              {allIssuers.map(issuer => <option key={issuer} value={issuer}>{issuer}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Time Period</label>
            <div className="flex space-x-2">
              {Object.keys(timePeriodLabels).map(period => (
                <button
                  key={period}
                  onClick={() => handleFilterChange('period', period)}
                  className={`px-3 py-2 text-sm rounded-md ${filters.period === period ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {timePeriodLabels[period]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Active Filters:</span>
                {filters.issuer ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Bank: {filters.issuer}</span> : <span>None</span>}
                {filters.period ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Period: {timePeriodLabels[filters.period]}</span> : null}
            </div>
            <button onClick={clearFilters} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition">
                Clear Filters
            </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Export Filtered Data</h3>
          <div className="flex space-x-4">
            <button onClick={() => handleExport('xlsx')} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Export to Excel (.xlsx)</button>
            <button onClick={() => handleExport('pdf')} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">Export to PDF (.pdf)</button>
            <button onClick={() => handleExport('docx')} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Export to Word (.docx)</button>
          </div>
      </div>

      {/* History List Section */}
      {isLoading ? (
        <p>Loading history...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No records found for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
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