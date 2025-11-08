import { useState, useEffect } from "react";
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
import StudentUploadFacultySkills from "./StudentUploadFacultySkills";
import ManageElectivesFaculty from './ManageElectivesFaculty';
import ManageLifeSkillsFaculty from './ManageLifeSkillsFaculty';
import AutoAllocation from './AutoAllocation';
import ManualAllocation from './ManualAllocation';
import FacultyReports from './FacultyReports';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("upload-electives");
  const [faculty, setFaculty] = useState(null);

  // ------------------- Fetch Faculty Profile -------------------
  useEffect(() => {
    fetchFacultyProfile();
  }, []);

  const fetchFacultyProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/faculty/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.ok) setFaculty(data.faculty);
      else console.error("Failed to fetch profile.");
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // ------------------- Logout -------------------
 const handleLogout = () => {
    console.log("Logout clicked"); // DIAGNOSTIC LOG
    localStorage.removeItem("token");
    localStorage.removeItem("regdNo");
    localStorage.removeItem("user");
    window.location = "/"; // force redirect
  };

  // ------------------- Download Preferences -------------------
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

  const handleDownloadLifeSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/faculty/download-lifeskill-preferences",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to download Life Skills preferences");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lifeskill_preferences.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading Life Skills preferences. Check console.");
    }
  };

  // ------------------- Render Active Component -------------------
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "upload-electives":
        return <StudentUploadFaculty />;
      case "upload-lifeskills":
        return <StudentUploadFacultySkills />;
      case "electives":
        return <ManageElectivesFaculty />;
      case "life-skills":
        return <ManageLifeSkillsFaculty />;
      case "auto":
        return <AutoAllocation />;
      case "manual":
        return <ManualAllocation />;
      case "reports":
        return <FacultyReports />;
      default:
        return <ManageElectivesFaculty />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="topnav">
        <div className="topnav-title">Faculty</div>

        {/* ---------------- Navigation Links ---------------- */}
        <nav className="topnav-links">
          <TopnavButton 
            label="Upload Students By Electives" 
            icon={<FiUpload />} 
            active={activeTab === "upload-electives"} 
            onClick={() => setActiveTab("upload-electives")} 
          />
          <TopnavButton 
            label="Upload Students By Life Skills" 
            icon={<FiUpload />} 
            active={activeTab === "upload-lifeskills"} 
            onClick={() => setActiveTab("upload-lifeskills")} 
          />
          <TopnavButton 
            label="Manage Electives" 
            icon={<FiBookOpen />} 
            active={activeTab === "electives"} 
            onClick={() => setActiveTab("electives")} 
          />
          <TopnavButton 
            label="Manage Life Skills" 
            icon={<FiBookOpen />} 
            active={activeTab === "life-skills"} 
            onClick={() => setActiveTab("life-skills")} 
          />
          <TopnavButton 
            label="Auto Allocation" 
            icon={<FiBarChart2 />} 
            active={activeTab === "auto"} 
            onClick={() => setActiveTab("auto")} 
          />
          {/* <TopnavButton 
            label="Manual Allocation" 
            icon={<FiUsers />} 
            active={activeTab === "manual"} 
            onClick={() => setActiveTab("manual")} 
          /> */}
          <TopnavButton 
            label="Reports" 
            icon={<FiFileText />} 
            active={activeTab === "reports"} 
            onClick={() => setActiveTab("reports")} 
          />
          <TopnavButton 
            label="Download Electives Preferences" 
            icon={<FiDownload />} 
            active={false} 
            onClick={handleDownloadPreferences} 
          />
          <TopnavButton 
            label="Download Life Skills Preferences" 
            icon={<FiDownload />} 
            active={false} 
            onClick={handleDownloadLifeSkills} 
          />
        </nav>

        
        {/* <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="faculty-profile-dropdown">
            <FiUser className="me-2" size={20} /> {faculty?.name || "Profile"} <FiChevronDown className="ms-2" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg mt-2">
            {faculty && (
              <Dropdown.ItemText className="px-3">
                <strong>{faculty.name}</strong><br/>
              </Dropdown.ItemText>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FiLogOut className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}

        <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut className="me-2" /> Logout
          </button>
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
