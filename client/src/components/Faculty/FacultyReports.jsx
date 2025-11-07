import React from "react";

export default function FacultyReports() {
  const BASE_URL = "http://localhost:5000"; // change to your backend URL if different

  const handleExport = async (type) => {
    let url = "";
    let filename = "";

    switch(type) {
      case 'PDF':
        url = `${BASE_URL}/api/faculty/download-report/pdf`; // optional
        filename = "report.pdf";
        break;
      case 'Excel':
        url = `${BASE_URL}/api/faculty/download-results`;
        filename = "allotments.xlsx";
        break;
      case 'CSV':
        url = `${BASE_URL}/api/faculty/download-student-preferences`;
        filename = "student_preferences.csv";
        break;
      default:
        return;
    }

    try {
      const token = localStorage.getItem("token"); // JWT if needed
      const res = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert("Error downloading file. Check console for details.");
    }
  };

  return (
    <div>
      <h1 className="page-title">Faculty Reports</h1>
      <div className="card">
        <p className="mb-3">Generate and export reports related to student elective allocations.</p>

        <div className="button-group">
          <button className="success-btn" onClick={() => handleExport("PDF")}>
            Download PDF Report
          </button>
          <button className="warning-btn" onClick={() => handleExport("Excel")}>
            Download Excel Report
          </button>
          <button className="primary-btn" onClick={() => handleExport("CSV")}>
            Download CSV Report
          </button>
        </div>

        <p className="mt-3 text-info">
          Reports will include student lists, allocated electives, preferences, and available capacities.
        </p>
      </div>
    </div>
  );
}
