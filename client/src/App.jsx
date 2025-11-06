import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/Admin/AdminDashboard";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";
// import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
