import React, { useState, useEffect } from "react";
import axios from "axios";
import './FacultyDashboard.css'; // Your CSS file

export default function ManageElectivesFaculty() {
  const [electives, setElectives] = useState([]);
  const [newElective, setNewElective] = useState({ code: "", name: "", capacity: "", minPercent: "" });

  // Fetch electives from backend on component mount
  useEffect(() => {
    fetchElectives();
  }, []);

  const fetchElectives = async () => {
    try {
      const res = await axios.get("http://localhost:5000/electives");
      setElectives(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch electives from server");
    }
  };

  // Add elective via backend
  const addElective = async () => {
    if (!newElective.code || !newElective.name || !newElective.capacity) {
      alert("Please fill in all required fields (Code, Name, Capacity)");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/electives", {
        code: newElective.code,
        name: newElective.name,
        capacity: parseInt(newElective.capacity),
        minPercent: parseInt(newElective.minPercent) || 0
      });
      setElectives([...electives, res.data]);
      setNewElective({ code: "", name: "", capacity: "", minPercent: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add elective. Make sure the code is unique.");
    }
  };

  // Delete elective via backend
  const deleteElective = async (code) => {
    if (window.confirm(`Are you sure you want to delete elective ${code}?`)) {
      try {
        await axios.delete(`http://localhost:5000/electives/${code}`);
        setElectives(electives.filter(e => e.code !== code));
      } catch (err) {
        console.error(err);
        alert("Failed to delete elective");
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Electives</h1>

      {/* Add Elective Form */}
      <div className="card add-elective-form">
        <input 
          type="text" 
          placeholder="Code" 
          value={newElective.code} 
          onChange={(e) => setNewElective({...newElective, code: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Name" 
          value={newElective.name} 
          onChange={(e) => setNewElective({...newElective, name: e.target.value})} 
        />
        <input 
          type="number" 
          placeholder="Capacity" 
          value={newElective.capacity} 
          onChange={(e) => setNewElective({...newElective, capacity: e.target.value})} 
        />
        <input 
          type="number" 
          placeholder="Min % Eligibility" 
          value={newElective.minPercent} 
          onChange={(e) => setNewElective({...newElective, minPercent: e.target.value})} 
        />
        <button className="primary-btn" onClick={addElective}>Add Elective</button>
      </div>

      {/* Electives Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Min %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {electives.map(e => (
            <tr key={e.code}>
              <td>{e.code}</td>
              <td>{e.name}</td>
              <td>{e.capacity}</td>
              <td>{e.minPercent}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteElective(e.code)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
