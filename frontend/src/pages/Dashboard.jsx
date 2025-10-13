import { useState } from "react";
import { api, getAuthHeaders } from "../api/axios";

export default function Dashboard(){
  const [files, setFiles] = useState([]);
  const [uploaded, setUploaded] = useState([]);

  const handleChange = (e) => setFiles(Array.from(e.target.files || []));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) { alert("Choose files"); return; }
    const form = new FormData();
    files.forEach(f => form.append("files", f));
    try {
      const res = await api.post("/files/upload", form, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setUploaded(res.data.uploaded || res.data.uploaded);
      alert("Uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Credit Card Statements</h2>
      <form onSubmit={handleUpload} className="mb-6">
        <input type="file" multiple accept=".pdf" onChange={handleChange} className="mb-2" />
        <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Upload</button>
      </form>

      {uploaded.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Results</h3>
          <ul>
            {uploaded.map((u, i) => (
              <li key={i} className="p-2 border-b">
                <div><strong>{u.file || u.filename}</strong></div>
                <div className="text-sm text-gray-600">Issuer: {u.issuer}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
