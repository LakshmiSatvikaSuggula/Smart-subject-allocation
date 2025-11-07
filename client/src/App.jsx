import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/Admin/AdminDashboard";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Login/RegisterPage";
import ResetPasswordRequest from "./components/Login/ResetPasswordRequest";
// import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage/>} />
          <Route path="/reset-password" element={<ResetPasswordRequest/>} />
        </Routes>
      </div>
    </Router>
  );
}
