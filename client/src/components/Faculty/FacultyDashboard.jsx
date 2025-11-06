import { useState } from "react";
import { 
  FiUpload, 
  FiBookOpen, 
  FiBarChart2, 
  FiUsers, 
  FiLogOut, 
  FiFileText,
  FiUser,        // Import FiUser for the profile icon
  FiChevronDown  // Import FiChevronDown for the dropdown arrow
} from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './FacultyDashboard.css'; // Your custom CSS for dashboard layout
import { Dropdown } from 'react-bootstrap'; // Import Dropdown from react-bootstrap

// Import the separate page components from the SAME directory
import StudentUploadFaculty from './StudentUploadFaculty';
import ManageElectivesFaculty from './ManageElectivesFaculty';
import AutoAllocation from './AutoAllocation';
import ManualAllocation from './ManualAllocation';
import FacultyReports from './FacultyReports';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State for dropdown

  // Placeholder for faculty info (you would fetch this from your backend)
  const facultyInfo = {
    name: "Dr. Jane Doe",
    fac_id: "FCLT12345", // Example Registration Number
    // Add other profile info as needed
  };

  const handleLogout = () => {
    alert("Logging out...");
    // TODO: Implement actual logout logic (e.g., clear tokens, redirect)
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "upload":
        return <StudentUploadFaculty />;
      case "electives":
        return <ManageElectivesFaculty />;
      case "auto":
        return <AutoAllocation />;
      case "manual":
        return <ManualAllocation />;
      case "reports":
        return <FacultyReports />;
      default:
        return <StudentUploadFaculty />;
    }
  };

  return (
    <div className="dashboard-container"> 
      {/* Top Navigation */}
      <header className="topnav">
        <div className="topnav-title">
            Faculty
        </div>
        <nav className="topnav-links">
          <TopnavButton
            label="Upload Students"
            icon={<FiUpload />}
            active={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
          />
          <TopnavButton
            label="Manage Electives"
            icon={<FiBookOpen />}
            active={activeTab === "electives"}
            onClick={() => setActiveTab("electives")}
          />
          <TopnavButton
            label="Auto Allocation"
            icon={<FiBarChart2 />}
            active={activeTab === "auto"}
            onClick={() => setActiveTab("auto")}
          />
          <TopnavButton
            label="Manual Allocation"
            icon={<FiUsers />}
            active={activeTab === "manual"}
            onClick={() => setActiveTab("manual")}
          />
          <TopnavButton
            label="Reports"
            icon={<FiFileText />}
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
          />
        </nav>

        {/* --- Profile Dropdown Section (Copied from Admin Dashboard logic) --- */}
        <Dropdown show={showProfileDropdown} onToggle={setShowProfileDropdown} align="end">
          <Dropdown.Toggle as="div" id="profile-dropdown" className="faculty-profile-dropdown-toggle">
            <FiUser className="me-2" size={20} /><FiChevronDown className="ms-2" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg mt-2">
            <Dropdown.Header>
              <strong className="text-primary">Fac_ID:</strong> {facultyInfo.fac_id}
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FiLogOut className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {/* --- End Profile Dropdown Section --- */}

      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

function TopnavButton({ label, icon, active, onClick }) {
  return (
    <button className={`topnav-button ${active ? "active" : ""}`} onClick={onClick}>
      <span className="icon">{icon}</span> {label}
    </button>
  );
}