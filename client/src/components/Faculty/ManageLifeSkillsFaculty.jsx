// src/components/ManageLifeSkillsFaculty.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import './FacultyDashboard.css';

export default function ManageLifeSkillsFaculty() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ code: "", name: "", capacity: "", minPercent: "" });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:5000/lifeskills");
      setSkills(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch life skills");
    }
  };

  const addSkill = async () => {
    if (!newSkill.code || !newSkill.name || !newSkill.capacity) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/lifeskills", {
        ...newSkill,
        capacity: parseInt(newSkill.capacity),
        minPercent: parseInt(newSkill.minPercent) || 0
      });
      setSkills([...skills, res.data]);
      setNewSkill({ code: "", name: "", capacity: "", minPercent: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add skill. Make sure code is unique.");
    }
  };

  const deleteSkill = async (code) => {
    if (window.confirm(`Delete life skill ${code}?`)) {
      try {
        await axios.delete(`http://localhost:5000/lifeskills/${code}`);
        setSkills(skills.filter(s => s.code !== code));
      } catch (err) {
        console.error(err);
        alert("Failed to delete skill");
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Life Skills</h1>

      <div className="card add-elective-form">
        <input 
          type="text" placeholder="Code" 
          value={newSkill.code} 
          onChange={e => setNewSkill({...newSkill, code: e.target.value})} 
        />
        <input 
          type="text" placeholder="Name" 
          value={newSkill.name} 
          onChange={e => setNewSkill({...newSkill, name: e.target.value})} 
        />
        <input 
          type="number" placeholder="Capacity" 
          value={newSkill.capacity} 
          onChange={e => setNewSkill({...newSkill, capacity: e.target.value})} 
        />
        <input 
          type="number" placeholder="Min % Eligibility" 
          value={newSkill.minPercent} 
          onChange={e => setNewSkill({...newSkill, minPercent: e.target.value})} 
        />
        <button className="primary-btn" onClick={addSkill}>Add Life Skill</button>
      </div>

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
          {skills.map(s => (
            <tr key={s.code}>
              <td>{s.code}</td>
              <td>{s.name}</td>
              <td>{s.capacity}</td>
              <td>{s.minPercent}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteSkill(s.code)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
