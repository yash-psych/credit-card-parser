import { useState } from "react";
import { api } from "../api/axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [skippedFiles, setSkippedFiles] = useState([]);
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
    setProcessedFiles([]);
    setSkippedFiles([]);

    try {
      const res = await api.post("/files/upload", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProcessedFiles(res.data.processed);
      setSkippedFiles(res.data.skipped);

      let alertMessage = "Upload complete.";
      if (res.data.processed.length > 0) {
        alertMessage += ` ${res.data.processed.length} file(s) processed.`;
      }
      if (res.data.skipped.length > 0) {
        alertMessage += ` ${res.data.skipped.length} file(s) were duplicates and skipped.`;
      }
      alert(alertMessage);

      e.target.reset();
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

      {/* Processed Files Section */}
      {processedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Successfully Processed</h3>
          <div className="space-y-4">
            {processedFiles.map((result, i) => (
              <div key={i} className="p-4 border rounded-lg bg-green-50 border-green-200">
                <p className="font-bold text-gray-800">{result.filename}</p>
                {/* ... display other data as before ... */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skipped Files Section */}
      {skippedFiles.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Skipped Duplicates</h3>
          <div className="space-y-2">
            {skippedFiles.map((filename, i) => (
              <div key={i} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                <p className="text-sm text-gray-600">{filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}