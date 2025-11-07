import React, { useState } from "react";

export default function AutoAllocation() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAllocate = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token"); // optional if using JWT
      const response = await fetch("http://localhost:5000/api/faculty/auto-allocate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setMessage("Students allocated automatically!");
      } else {
        setMessage(data.error || "Automatic allocation failed.");
      }
    } catch (err) {
      console.error("Allocation error:", err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Automatic Allocation</h1>
      <div className="card">
        <p>Click below to automatically allocate students to electives based on preferences and eligibility criteria.</p>
        <button className="primary-btn" onClick={handleAllocate} disabled={loading}>
          {loading ? "Allocating..." : "Run Allocation"}
        </button>
        {message && <p className="mt-2 text-info">{message}</p>}
        <p className="mt-3 text-info">
          Ensure all student data and elective capacities are up-to-date before running automatic allocation.
        </p>
      </div>
    </div>
  );
}
