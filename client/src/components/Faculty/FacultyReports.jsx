import React from "react";

export default function FacultyReports() {
  const BASE_URL = "http://localhost:5000"; // change to your backend URL if different

  const handleExport = async (type, category) => {
    // category = "electives" | "life-skills"
    let url = "";
    let filename = "";

    switch(category) {
      case "electives":
        switch(type) {
          case 'PDF':
            url = `${BASE_URL}/api/faculty/download-report/pdf`;
            filename = "electives_report.pdf";
            break;
          case 'Excel':
            url = `${BASE_URL}/api/faculty/download-results`;
            filename = "electives_allotments.xlsx";
            break;
          case 'CSV':
            url = `${BASE_URL}/api/faculty/download-student-preferences`;
            filename = "electives_student_preferences.csv";
            break;
          default: return;
        }
        break;

      case "life-skills":
        switch(type) {
          case 'PDF':
            url = `${BASE_URL}/api/faculty/download-report-lifeskills/pdf`;
            filename = "lifeskills_report.pdf";
            break;
          case 'Excel':
            url = `${BASE_URL}/api/faculty/download-results-lifeskills`;
            filename = "lifeskills_allotments.xlsx";
            break;
          case 'CSV':
            url = `${BASE_URL}/api/faculty/download-student-preferences-lifeskills`;
            filename = "lifeskills_student_preferences.csv";
            break;
          default: return;
        }
        break;

      default: return;
    }

    try {
      const token = localStorage.getItem("token");
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
        <p className="mb-3">Generate and export reports for student allocations.</p>

        {/* Electives Buttons */}
        <h4>Electives Reports</h4>
        <div className="button-group mb-3">
          <button className="success-btn" onClick={() => handleExport("PDF", "electives")}>
            Download PDF Report
          </button>
          <button className="warning-btn" onClick={() => handleExport("Excel", "electives")}>
            Download Excel Report
          </button>
          <button className="primary-btn" onClick={() => handleExport("CSV", "electives")}>
            Download CSV Report
          </button>
        </div>

        {/* Life Skills Buttons */}
        <h4>Life Skills Reports</h4>
        <div className="button-group">
          <button className="success-btn" onClick={() => handleExport("PDF", "life-skills")}>
            Download PDF Report
          </button>
          <button className="warning-btn" onClick={() => handleExport("Excel", "life-skills")}>
            Download Excel Report
          </button>
          <button className="primary-btn" onClick={() => handleExport("CSV", "life-skills")}>
            Download CSV Report
          </button>
        </div>

        <p className="mt-3 text-info">
          Reports include student lists, allocated electives/life skills, preferences, and capacities.
        </p>
      </div>
    </div>
  );
}
