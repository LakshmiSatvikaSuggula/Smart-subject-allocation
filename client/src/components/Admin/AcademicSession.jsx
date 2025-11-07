import { useState, useEffect } from "react";

export default function AcademicSession() {
  const [session, setSession] = useState("2025-26");
  const [semester, setSemester] = useState("Odd");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locked, setLocked] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSessions();
  }, []);

  // 🔹 Fetch all sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      setSessions(data);

      if (data.length > 0) {
        const latest = data[0];
        setSession(latest.academicYear);
        setSemester(latest.semester);
        setLocked(latest.locked);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching sessions");
    }
  };

  // 🔹 Add a new session
  const addSession = async () => {
    if (!session || !semester || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          academicYear: session,
          semester,
          startDate,
          endDate,
          locked,
        }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json();
      alert("✅ Session created successfully!");
      setSessions([data, ...sessions]);
    } catch (err) {
      console.error(err);
      alert("Error adding session");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lock/Unlock session toggle
  const toggleLock = async (id, currentLockStatus) => {
    const action = currentLockStatus ? "unlock" : "lock";
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/sessions/${id}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Failed to ${action} session`);

      const data = await res.json();
      alert(`Session ${action === "lock" ? "locked" : "unlocked"} successfully!`);
      setLocked(data.locked);
      fetchSessions(); // refresh list
    } catch (err) {
      console.error(err);
      alert(`Error while trying to ${action} session`);
    }
  };

  return (
    <div className="card shadow-lg rounded-4 p-4 mb-4 bg-light card-glassmorphism">
      <h3 className="mb-3 text-primary">Academic Session Management</h3>

      {/* Academic Year */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-secondary">
          Academic Year:
        </label>
        <input
          className="form-control form-control-lg"
          type="text"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="e.g. 2025-26"
        />
      </div>

      {/* Semester */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-secondary">
          Semester:
        </label>
        <select
          className="form-select form-select-lg"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="Odd">Odd</option>
          <option value="Even">Even</option>
        </select>
      </div>

      {/* Dates */}
      <div className="row mb-3">
        <div className="col">
          <label className="form-label fw-semibold text-secondary">
            Start Date:
          </label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col">
          <label className="form-label fw-semibold text-secondary">
            End Date:
          </label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Lock/Unlock toggle for the current session */}
      <button
        className={`btn ${locked ? "btn-warning" : "btn-success"} btn-lg mb-2 rounded-pill`}
        onClick={() => toggleLock(sessions[0]?._id, locked)}
      >
        {locked ? "Unlock Allocations" : "Lock Allocations"}
      </button>

      <p className={`fw-semibold ${locked ? "text-danger" : "text-success"} mb-0`}>
        Status: {locked ? "Allocations Locked" : "Allocations Open"}
      </p>

      {/* Save Button */}
      <button
        className="btn btn-primary mt-3"
        onClick={addSession}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Session"}
      </button>

      {/* Previous Sessions */}
      <h5 className="mt-4 text-secondary">Previous Sessions</h5>
      <ul className="list-group">
        {sessions.map((s) => (
          <li
            key={s._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{s.academicYear}</strong> — {s.semester} (
              {s.startDate?.slice(0, 10)} → {s.endDate?.slice(0, 10)})
            </div>
            <button
              className={`btn btn-sm ${
                s.locked ? "btn-warning" : "btn-outline-success"
              }`}
              onClick={() => toggleLock(s._id, s.locked)}
            >
              {s.locked ? "Unlock" : "Lock"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
