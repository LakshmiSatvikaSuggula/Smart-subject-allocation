import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
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

  // Pie chart data
  const pieData = [
    { name: "Allocated", value: data.totalAllocated },
    { name: "Unallocated", value: data.totalUnallocated },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary fw-bold">📊 Analytics Dashboard</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <SummaryCard title="Total Students" value={data.totalStudents} color="#2196F3" />
        <SummaryCard title="Total Subjects" value={data.totalSubjects} color="#9C27B0" />
        <SummaryCard title="Allocated" value={data.totalAllocated} color="#4CAF50" />
        <SummaryCard title="Unallocated" value={data.totalUnallocated} color="#F44336" />
      </div>

      {/* Charts Section */}
      <div className="row">
        {/* Bar Chart: Subject-wise Allocation */}
        <div className="col-lg-8 col-md-12 mb-4">
          <div className="card shadow-lg rounded-4 p-4 bg-light card-glassmorphism">
            <h5 className="text-secondary mb-3">📘 Subject-wise Allocation</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocated" fill="#4CAF50" name="Allocated" />
                <Bar dataKey="capacity" fill="#2196F3" name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Allocation Ratio */}
        <div className="col-lg-4 col-md-12">
          <div className="card shadow-lg rounded-4 p-4 bg-light card-glassmorphism">
            <h5 className="text-secondary mb-3">🎯 Allocation Ratio</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
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
