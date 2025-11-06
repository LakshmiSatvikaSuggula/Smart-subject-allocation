import { useState } from "react";

export default function AcademicSession() {
  const [session, setSession] = useState("2025-26");
  const [locked, setLocked] = useState(false);

  return (
    <div className="card shadow-lg rounded-4 p-4 mb-4 bg-light card-glassmorphism">
      <h3 className="mb-3 text-primary">Academic Session</h3>
      <div className="mb-3">
        <label className="form-label fw-semibold text-secondary">Current Session:</label>
        <input className="form-control form-control-lg" type="text" value={session} onChange={(e) => setSession(e.target.value)} />
      </div>
      <button className={`btn ${locked ? "btn-warning" : "btn-success"} btn-lg mb-2 rounded-pill`} onClick={() => setLocked(!locked)}>
        {locked ? "Unlock Allocations" : "Lock Allocations"}
      </button>
      <p className={`fw-semibold ${locked ? "text-danger" : "text-success"} mb-0`}>Status: {locked ? "Allocations Locked" : "Allocations Open"}</p>
    </div>
  );
}