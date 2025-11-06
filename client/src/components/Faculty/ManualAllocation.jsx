import React, { useState } from "react";
// import '../../components/FacultyDashboard.css'; // Uncomment if needed

export default function ManualAllocation() {
  const [students, setStudents] = useState([
    { roll: "R001", name: "Alice", allocated: "EL101", preferences: ["EL101", "EL102"] },
    { roll: "R002", name: "Bob", allocated: "", preferences: ["EL103", "EL101"] },
    { roll: "R003", name: "Charlie", allocated: "EL102", preferences: ["EL102", "EL103"] },
  ]);

  const reassign = (roll, newElectiveCode) => {
    const updatedStudents = students.map(s => 
      s.roll === roll ? { ...s, allocated: newElectiveCode.toUpperCase() } : s
    );
    setStudents(updatedStudents);
    alert(`Student ${roll} reassigned to ${newElectiveCode.toUpperCase()}`);
    // TODO: Implement API call to update allocation in backend
  };

  return (
    <div>
      <h1 className="page-title">Manual Allocation & Reassignment</h1>
      <div className="card">
        <p className="mb-3">Manually assign or reassign electives to individual students.</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Preferences</th>
              <th>Allocated</th>
              <th>Reassign To</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.roll}>
                <td>{s.roll}</td>
                <td>{s.name}</td>
                <td>{s.preferences.join(', ')}</td>
                <td>{s.allocated || "Unassigned"}</td>
                <td>
                  <input 
                    type="text" 
                    placeholder="Elective Code" 
                    defaultValue={s.allocated} // Show current allocation as default
                    onBlur={(e) => reassign(s.roll, e.target.value)} 
                    onKeyPress={(e) => { // Allow pressing Enter to trigger reassign
                      if (e.key === 'Enter') {
                        e.target.blur(); // Trigger onBlur
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}