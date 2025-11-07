import { useState } from "react";
import { 
  FiUpload, 
  FiBookOpen, 
  FiBarChart2, 
  FiUsers, 
  FiLogOut, 
  FiFileText,
  FiDownload,
  FiUser,
  FiChevronDown
} from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './FacultyDashboard.css';
import { Dropdown } from 'react-bootstrap';

import StudentUploadFaculty from './StudentUploadFaculty';
import ManageElectivesFaculty from './ManageElectivesFaculty';
import AutoAllocation from './AutoAllocation';
import ManualAllocation from './ManualAllocation';
import FacultyReports from './FacultyReports';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    alert("Logging out...");
    // TODO: clear tokens and redirect
  };

  const handleDownloadPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/faculty/download-student-preferences", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to download preferences");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_preferences.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading student preferences. Check console.");
    }
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
      <header className="topnav">
        <div className="topnav-title">Faculty</div>
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
          <TopnavButton
            label="Download Preferences"
            icon={<FiDownload />}
            active={false}
            onClick={handleDownloadPreferences}
          />
        </nav>

        <Dropdown show={showProfileDropdown} onToggle={setShowProfileDropdown} align="end">
          <Dropdown.Toggle as="div" id="profile-dropdown" className="faculty-profile-dropdown-toggle">
            <FiUser className="me-2" size={20} /><FiChevronDown className="ms-2" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg mt-2">
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FiLogOut className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </header>

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
