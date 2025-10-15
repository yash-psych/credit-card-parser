import { useState, useRef } from "react";
import { api } from "../api/axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [skippedFiles, setSkippedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.target.files || []));
  };
  
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
        
        <div
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleChange}
            className="hidden"
          />
          <p className="text-gray-500">Drag & drop your PDF files here, or click to select files</p>
        </div>
        
        {files.length > 0 && (
          <div className="py-2">
            <h4 className="font-semibold text-gray-700">Selected files:</h4>
            <ul className="list-disc list-inside text-gray-600">
              {files.map((file, i) => <li key={i}>{file.name}</li>)}
            </ul>
          </div>
        )}

        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400" type="submit" disabled={isLoading || files.length === 0}>
          {isLoading ? 'Processing...' : `Upload and Extract ${files.length} File(s)`}
        </button>
      </form>

      {/* --- Processed Files Section (FILLED IN) --- */}
      {processedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Successfully Processed</h3>
          <div className="space-y-4">
            {processedFiles.map((result, i) => (
              <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <h4 className="font-bold text-lg text-gray-800">{result.filename}</h4>
                      {result.data && result.data['Bank Name'] && (
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                              {result.data['Bank Name']}
                          </span>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-600">
                      <p><strong>Card (Last 4):</strong> {result.data['Card (Last 4)'] || 'N/A'}</p>
                      <p><strong>Card Variant:</strong> {result.data['Card Variant'] || 'N/A'}</p>
                      <p><strong>Billing Cycle:</strong> {result.data['Billing Cycle'] || 'N/A'}</p>
                      <p><strong>Payment Due Date:</strong> {result.data['Payment Due Date'] || 'N/A'}</p>
                      <p className="md:col-span-2 mt-2">
                          <strong>Total Balance:</strong> 
                          <span className="font-semibold text-xl text-gray-900 ml-2">
                              {result.data['Total Balance'] || 'N/A'}
                          </span>
                      </p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Skipped Files Section (FILLED IN) --- */}
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