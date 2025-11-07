import React, { useState } from "react";
import './FacultyDashboard.css';
import { Alert } from "react-bootstrap";

export default function StudentUploadFaculty() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return setError("Please select a CSV file.");

    setLoading(true);
    setMessage("");
    setError("");
    setPreview([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token"); // optional
      const response = await fetch("http://localhost:5000/api/faculty/upload-csv", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        const previewData = data.preview || [];
        setPreview(previewData);
        setMessage(`CSV uploaded successfully! Showing preview of first ${previewData.length} rows.`);
      } else {
        setError(data.error || "Failed to upload CSV.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Upload Student List</h1>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="card">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input"
        />
        <button className="primary-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && <p className="mt-2 text-muted">Selected file: {file.name}</p>}

      {preview.length > 0 && (
        <div className="preview-table mt-3">
          <h5>Preview of Uploaded Students</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Percentage</th>
                <th>CGPA</th>
                <th>DOB</th>
                <th>Preferences</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.regdNo}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.department}</td>
                  <td>{row.percentage}</td>
                  <td>{row.cgpa}</td>
                  <td>{row.dob ? new Date(row.dob).toLocaleDateString() : ""}</td>
                  <td>{row.preferences.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-info">
        CSV columns required: <br/>
        <strong>regdNo, name, email, department, percentage, cgpa, dob, Preference1, Preference2, Preference3</strong>
      </p>
    </div>
  );
}
