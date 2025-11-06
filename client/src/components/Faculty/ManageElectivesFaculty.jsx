import React, { useState } from "react";
// import '../../components/FacultyDashboard.css'; // Uncomment if needed

export default function ManageElectivesFaculty() {
  const [electives, setElectives] = useState([
    { code: "EL101", name: "Data Science", capacity: 50, minPercent: 70 },
    { code: "EL102", name: "Machine Learning", capacity: 45, minPercent: 75 },
    { code: "EL103", name: "Cyber Security", capacity: 60, minPercent: 65 },
  ]);
  const [newElective, setNewElective] = useState({ code: "", name: "", capacity: "", minPercent: "" });

  const addElective = () => {
    if (!newElective.code || !newElective.name || !newElective.capacity) {
      alert("Please fill in all required fields (Code, Name, Capacity)");
      return;
    }
    setElectives([...electives, { 
      ...newElective, 
      capacity: parseInt(newElective.capacity) || 0, // Ensure it's a number
      minPercent: parseInt(newElective.minPercent) || 0 // Ensure it's a number
    }]);
    setNewElective({ code: "", name: "", capacity: "", minPercent: "" });
  };

  const deleteElective = (code) => {
    if (window.confirm(`Are you sure you want to delete elective ${code}?`)) {
      setElectives(electives.filter(e => e.code !== code));
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Electives</h1>
      <div className="card add-elective-form"> {/* Assuming .add-elective-form is defined */}
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

      <table className="data-table"> {/* Assuming .data-table is defined */}
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
                <button className="delete-btn" onClick={() => deleteElective(e.code)}> {/* Assuming .delete-btn is defined */}
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