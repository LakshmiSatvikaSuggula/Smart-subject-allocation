import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/analytics", {
      headers: { Authorization: "Bearer YOUR_DUMMY_TOKEN" }
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="card shadow-lg rounded-4 p-4 mb-4 bg-light card-glassmorphism">
      <h3 className="mb-3 text-primary">Analytics Dashboard</h3>
      <div className="p-3 bg-white rounded border">
        <p>Total Students: {data.totalStudents}</p>
        <p>Total Subjects: {data.totalSubjects}</p>
        <p>Total Allocated: {data.totalAllocated}</p>
        <p>Total Unallocated: {data.totalUnallocated}</p>
        <h5>Subject-wise Allocation:</h5>
      <ul>
          {/*  FIX applied here: Check if data.subjectData exists and is an array */}
          {data.subjectData && Array.isArray(data.subjectData) && data.subjectData.map((s, i) => (
            <li key={i}>{s.subject}: {s.allocated}/{s.capacity}</li>
          ))}
        </ul>
      </div>
    </div>
  );ss
}
