import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching analytics:", err));
  }, []);

  if (!data) return <div className="text-center mt-4">Loading analytics...</div>;

  // Pie chart data for electives
  const pieElectiveData = [
    { name: "Allocated", value: data.totalAllocatedElective },
    { name: "Unallocated", value: data.totalUnallocatedElective },
  ];

  // Pie chart data for life skills
  const pieLifeSkillData = [
    { name: "Allocated", value: data.totalAllocatedLifeSkill },
    { name: "Unallocated", value: data.totalUnallocatedLifeSkill },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary fw-bold">📊 Analytics Dashboard</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <SummaryCard title="Total Students" value={data.totalStudents} color="#2196F3" />
        <SummaryCard title="Allocated Electives" value={data.totalAllocatedElective} color="#4CAF50" />
        <SummaryCard title="Unallocated Electives" value={data.totalUnallocatedElective} color="#F44336" />
        <SummaryCard title="Allocated Life Skills" value={data.totalAllocatedLifeSkill} color="#4CAF50" />
        <SummaryCard title="Unallocated Life Skills" value={data.totalUnallocatedLifeSkill} color="#F44336" />
      </div>

      {/* Pie Charts */}
      <div className="row">
        {/* Pie Chart: Elective Allocation */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-lg rounded-4 p-4 bg-light card-glassmorphism">
            <h5 className="text-secondary mb-3">🎯 Elective Allocation</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieElectiveData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieElectiveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Life Skill Allocation */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card shadow-lg rounded-4 p-4 bg-light card-glassmorphism">
            <h5 className="text-secondary mb-3">🌱 Life Skill Allocation</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieLifeSkillData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieLifeSkillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small card component for summary boxes
function SummaryCard({ title, value, color }) {
  return (
    <div className="col-md-3 col-sm-6 mb-3">
      <div className="card text-center shadow-sm rounded-4 p-3" style={{ borderTop: `5px solid ${color}` }}>
        <h6 className="text-muted">{title}</h6>
        <h3 style={{ color }}>{value}</h3>
      </div>
    </div>
  );
}
