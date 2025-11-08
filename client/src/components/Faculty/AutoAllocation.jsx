import React, { useState } from "react";

export default function AutoAllocation() {
  const [loadingElectives, setLoadingElectives] = useState(false);
  const [loadingLifeSkills, setLoadingLifeSkills] = useState(false);
  const [message, setMessage] = useState("");

  const handleAllocate = async (type) => {
    setMessage("");
    if (type === "electives") setLoadingElectives(true);
    else setLoadingLifeSkills(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint =
        type === "electives"
          ? "http://localhost:5000/api/faculty/auto-allocate"
          : "http://localhost:5000/api/faculty/auto-allocate-lifeskills";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setMessage(
          type === "electives"
            ? "Students allocated automatically to Electives!"
            : "Students allocated automatically to Life Skills!"
        );
      } else {
        setMessage(data.error || "Automatic allocation failed.");
      }
    } catch (err) {
      console.error("Allocation error:", err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoadingElectives(false);
      setLoadingLifeSkills(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Automatic Allocation</h1>
      <div className="card">
        <p>Automatically allocate students based on their preferences and eligibility.</p>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            className="primary-btn"
            onClick={() => handleAllocate("electives")}
            disabled={loadingElectives}
          >
            {loadingElectives ? "Allocating Electives..." : "Run Electives Allocation"}
          </button>

          <button
            className="primary-btn"
            onClick={() => handleAllocate("life-skills")}
            disabled={loadingLifeSkills}
          >
            {loadingLifeSkills ? "Allocating Life Skills..." : "Run Life Skills Allocation"}
          </button>
        </div>

        {message && <p className="mt-2 text-info">{message}</p>}

        <p className="mt-3 text-info">
          Ensure all student data and capacities are up-to-date before running automatic allocation.
        </p>
      </div>
    </div>
  );
}
