import React from "react";
// import '../../components/FacultyDashboard.css'; // Uncomment if needed

export default function AutoAllocation() {
  const handleAllocate = () => {
    alert("Automatic allocation triggered! (Placeholder)");
    // TODO: Implement API call to backend for automatic allocation
    // Example:
    // fetch('/api/faculty/auto-allocate', { method: 'POST' })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('Allocation successful:', data);
    //     alert('Students allocated automatically!');
    //   })
    //   .catch(error => {
    //     console.error('Allocation error:', error);
    //     alert('Failed to run automatic allocation.');
    //   });
  };

  return (
    <div>
      <h1 className="page-title">Automatic Allocation</h1>
      <div className="card">
        <p>Click below to automatically allocate students to electives based on preferences and eligibility criteria.</p>
        <button className="primary-btn" onClick={handleAllocate}>
          Run Allocation
        </button>
        <p className="mt-3 text-info">
          Ensure all student data and elective capacities are up-to-date before running automatic allocation.
        </p>
      </div>
    </div>
  );
}