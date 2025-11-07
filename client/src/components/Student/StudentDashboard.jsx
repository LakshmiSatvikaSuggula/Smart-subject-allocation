// src/components/Student/StudentDashboard.jsx

import React, { useState } from "react";
import { FiUser, FiList, FiCheckCircle, FiDownload, FiLogOut, FiChevronDown } from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './StudentDashboard.css'; // Ensure this file is created
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Import the separate student page components
import PreferenceForm from './PreferenceForm';
import AllocationStatus from './AllocationStatus';
import ConfirmationSlip from './ConfirmationSlip';

// Helper component for the navigation buttons
function TopnavButton({ label, icon, active, onClick }) {
    return (
        <button
            className={`btn btn-outline-light me-2 rounded-pill px-3 ${active ? "nav-btn-active-info" : ""}`}
            onClick={onClick}
        >
            <span className="me-1">{icon}</span> {label}
        </button>
    );
}

export default function StudentDashboard() {
    // FIX 1: Set the initial state to "preferences"
    const [activeTab, setActiveTab] = useState("preferences"); 
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login'); 
    };

    const loggedInStudentId = "STUDENT_XYZ_789"; // Placeholder ID

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "preferences":
                return <PreferenceForm />;
            case "status":
                return <AllocationStatus />;
            case "download":
                return <ConfirmationSlip />;
            default:
                // FIX 2: Ensure the fallback is PreferenceForm
                return <PreferenceForm />; 
        }
    };

    return (
        <div className="dashboard-body student-bg-image">
            {/* ---------- Navbar - Blue/Info Theme ---------- */}
            <nav className="navbar navbar-expand-lg navbar-dark shadow-lg px-4 bg-info-gradient">
                <div className="d-flex align-items-center">
                    <FiUser className="me-2 text-white" size={28} />
                    <span className="navbar-brand mb-0 h3 fw-bold text-white">Student Portal</span>
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topnavMenu" aria-controls="topnavMenu" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="topnavMenu">
                    <div className="navbar-nav me-3">
                        <TopnavButton 
                            label="Submit Preferences" 
                            icon={<FiList />} 
                            active={activeTab === "preferences"} 
                            onClick={() => setActiveTab("preferences")} 
                        />
                        <TopnavButton 
                            label="Allocation Status" 
                            icon={<FiCheckCircle />} 
                            active={activeTab === "status"} 
                            onClick={() => setActiveTab("status")} 
                        />
                        <TopnavButton 
                            label="Download Slip" 
                            icon={<FiDownload />} 
                            active={activeTab === "download"} 
                            onClick={() => setActiveTab("download")} 
                        />
                    </div>

                    {/* Profile Dropdown */}
                    <Dropdown show={showProfileDropdown} onToggle={setShowProfileDropdown} align="end">
                        <Dropdown.Toggle as="div" id="profile-dropdown" className="btn btn-outline-light rounded-pill px-3 py-2 d-flex align-items-center cursor-pointer">
                            <FiUser className="me-2" size={20} /> Profile <FiChevronDown className="ms-2" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow-lg mt-2">
                            <Dropdown.Header>
                                <strong className="text-info">Student ID:</strong> {loggedInStudentId}
                            </Dropdown.Header>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout} className="text-danger">
                                <FiLogOut className="me-2" /> Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </nav>

            {/* ---------- Main Content ---------- */}
            <div className="container mt-4 flex-grow-1 d-flex flex-column">
                {renderActiveComponent()}
            </div>
        </div>
    );
}