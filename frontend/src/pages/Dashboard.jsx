import { useState } from "react";
import { api } from "../api/axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [uploaded, setUploaded] = useState([]); // This state will hold the results of the last upload
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFiles(Array.from(e.target.files || []));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please choose at least one PDF file to upload.");
      return;
    }
    const form = new FormData();
    files.forEach(f => form.append("files", f));

    setIsLoading(true);
    setUploaded([]); // Clear previous results from the dashboard view

    try {
      // The backend responds with the data from the files you just uploaded
      const res = await api.post("/files/upload", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart-form-data",
        },
      });

      // 1. Set the 'uploaded' state with the results from the backend
      setUploaded(res.data);
      alert("Files uploaded and processed successfully!");
      e.target.reset(); // Clear the file input
      setFiles([]);

    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "An error occurred during upload.";
      alert(`Upload failed: ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Upload Statements</h2>
      <p className="text-gray-600 mb-6">Welcome! Upload your credit card statements to extract key information.</p>
      
      <form onSubmit={handleUpload} className="mb-6 space-y-4">
        <input type="file" multiple accept=".pdf" onChange={handleChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400" type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Upload and Extract Data'}
        </button>
      </form>

      {/* 2. This section now correctly displays the results of the most recent upload */}
      {uploaded.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Last Upload Results</h3>
          <div className="space-y-4">
            {uploaded.map((result, i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-gray-800">{result.filename}</p>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{result.issuer}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><strong>Card (Last 4):</strong> {result.data?.last_4_digits || 'N/A'}</p>
                  <p><strong>Card Variant:</strong> {result.data?.card_variant || 'N/A'}</p>
                  <p><strong>Billing Cycle:</strong> {result.data?.billing_cycle || 'N/A'}</p>
                  <p><strong>Payment Due Date:</strong> {result.data?.payment_due_date || 'N/A'}</p>
                  <p><strong>Total Balance:</strong> {result.data?.total_balance || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}