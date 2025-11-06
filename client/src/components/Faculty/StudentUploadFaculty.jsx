import React, { useState } from "react";
// Assuming you have common CSS for cards/buttons, or you can add styles here
// import '../../components/FacultyDashboard.css'; // Uncomment if needed

export default function StudentUploadFaculty() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert("Please select a CSV file");
    alert(`Uploaded ${file.name}`);
    // TODO: Implement CSV parsing and backend upload
    // Example:
    // const formData = new FormData();
    // formData.append('csvFile', file);
    // fetch('/api/faculty/upload-students', {
    //   method: 'POST',
    //   body: formData,
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Upload successful:', data);
    //   alert('Students uploaded successfully!');
    // })
    // .catch(error => {
    //   console.error('Upload error:', error);
    //   alert('Failed to upload students.');
    // });
  };

  return (
    <div>
      <h1 className="page-title">Upload Student List</h1>
      <div className="card"> {/* Assuming .card is defined in FacultyDashboard.css or global styles */}
        <input 
          type="file" 
          accept=".csv" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="file-input" // Assuming .file-input is defined
        />
        <button className="primary-btn" onClick={handleUpload}> {/* Assuming .primary-btn is defined */}
          Upload
        </button>
      </div>
      {file && <p className="mt-2 text-muted">Selected file: {file.name}</p>}
      <p className="mt-3 text-info">
        Please upload a CSV file with student data (e.g., RollNo, Name, Department, CGPA, Preference1, Preference2).
      </p>
    </div>
  );
}