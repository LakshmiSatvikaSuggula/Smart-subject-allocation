import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function FacultyManagementAdmin() {
  const [faculty, setFaculty] = useState([]);
  const [newFaculty, setNewFaculty] = useState({ facultyId: "", name: "", email: "" });

  // Get admin token from localStorage
  const token = localStorage.getItem("token");

  // Fetch all faculty
  const fetchFaculty = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setFaculty(data);
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Add new faculty
  const addFaculty = async () => {
    if (!newFaculty.facultyId || !newFaculty.name || !newFaculty.email) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFaculty.name,
          email: newFaculty.email,
          regdNo: newFaculty.facultyId // backend expects regdNo
        })
      });

      const added = await res.json();
      if (res.ok) {
        setFaculty([...faculty, added]);
        setNewFaculty({ facultyId: "", name: "", email: "" });
      } else {
        console.error("Error adding faculty:", added.message);
      }
    } catch (err) {
      console.error("Error adding faculty:", err);
    }
  };

  // Delete faculty
  const deleteFaculty = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/faculty/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setFaculty(faculty.filter(f => f._id !== id));
      else console.error("Failed to delete faculty");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card shadow-lg rounded-4 p-4 mb-4 bg-light card-glassmorphism">
      <h3 className="mb-3 text-primary">Faculty Management</h3>

      {/* Add Faculty Form */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            className="form-control form-control-lg rounded-pill"
            placeholder="Faculty ID"
            value={newFaculty.facultyId}
            onChange={(e) => setNewFaculty({ ...newFaculty, facultyId: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control form-control-lg rounded-pill"
            placeholder="Name"
            value={newFaculty.name}
            onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control form-control-lg rounded-pill"
            placeholder="Email"
            type="email"
            value={newFaculty.email}
            onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary btn-lg w-100 rounded-pill" onClick={addFaculty}>
            Add Faculty
          </button>
        </div>
      </div>

      {/* Faculty List Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle bg-white rounded-3 overflow-hidden">
          <thead className="table-dark">
            <tr>
              <th>Faculty ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f._id}>
                <td>{f.regdNo}</td>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm d-flex align-items-center rounded-pill px-3"
                    onClick={() => deleteFaculty(f._id)}
                  >
                    <FiTrash2 className="me-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">No faculty found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); 
} 