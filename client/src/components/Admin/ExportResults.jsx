import React from 'react';
import axios from 'axios';

export default function ExportResults() {
  const handleExport = async (type) => {
    try {
      let url = '';
      switch(type) {
        case 'PDF':
          url = '/api/admin/export/pdf';
          break;
        case 'Excel':
          url = '/api/admin/export/excel';
          break;
        case 'CSV':
          url = '/api/admin/export/csv';
          break;
        default:
          return;
      }

      // Trigger the download
      const response = await axios.get(url, {
        responseType: 'blob', // Important for files
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass token if routes are protected
        },
      });

      // Create a download link
      const blob = new Blob([response.data], { type: response.data.type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `allotments.${type.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href); // Clean up
    } catch (err) {
      console.error(err);
      alert('Error exporting file. Make sure backend is running and token is valid.');
    }
  };

  return (
    <div className="card shadow-lg rounded-4 p-4 mb-4 bg-light card-glassmorphism">
      <h3 className="mb-3 text-primary">Export Results</h3>
      <p className="text-secondary mb-4">
        Select the format to download or export the academic results.
      </p>
      <div className="d-flex gap-3 flex-wrap">
        <button
          className="btn btn-success btn-lg rounded-pill"
          onClick={() => handleExport("PDF")}
        >
          Download PDF
        </button>
        <button
          className="btn btn-warning btn-lg rounded-pill"
          onClick={() => handleExport("Excel")}
        >
          Export Excel
        </button>
        <button
          className="btn btn-info btn-lg rounded-pill"
          onClick={() => handleExport("CSV")}
        >
          Export CSV
        </button>
      </div>
      <small className="text-muted mt-3 d-block">
        Downloads will include student allotments for electives and life skills.
      </small>
    </div>
  );
}
