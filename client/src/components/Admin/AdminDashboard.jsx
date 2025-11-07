import { useState, useEffect } from "react";
import {
  FiUser,
  FiBookOpen,
  FiBarChart2,
  FiUpload,
  FiUsers,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import { Dropdown } from "react-bootstrap";

// Import page components
import AcademicSession from "./AcademicSession";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ExportResults from "./ExportResults";
import FacultyManagementAdmin from "./FacultyManagementAdmin";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const token = localStorage.getItem("token");

  // 🔹 Fetch admin profile on mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch admin profile");
        const data = await res.json();
        setAdminData(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    if (token) fetchAdminProfile();
  }, [token]);

  // 🔹 Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // 🔹 Render dynamic tabs
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "session":
        return <AcademicSession />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "export":
        return <ExportResults />;
      case "faculty":
        return <FacultyManagementAdmin />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="dashboard-body bg-image">
      {/* ---------- Navbar ---------- */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg px-4 bg-dark-gradient">
        <div className="d-flex align-items-center">
          <FiUser className="me-2 text-white" size={28} />
          <span className="navbar-brand mb-0 h3 fw-bold text-white">Admin</span>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topnavMenu"
          aria-controls="topnavMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="topnavMenu"
        >
          <div className="navbar-nav me-3">
            <TopnavButton
              label="Academic Session"
              icon={<FiBookOpen />}
              active={activeTab === "session"}
              onClick={() => setActiveTab("session")}
            />
            <TopnavButton
              label="Analytics"
              icon={<FiBarChart2 />}
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
            />
            <TopnavButton
              label="Export Results"
              icon={<FiUpload />}
              active={activeTab === "export"}
              onClick={() => setActiveTab("export")}
            />
            <TopnavButton
              label="Faculty Management"
              icon={<FiUsers />}
              active={activeTab === "faculty"}
              onClick={() => setActiveTab("faculty")}
            />
          </div>

          {/* ---------- Profile Dropdown ---------- */}
          <Dropdown
            show={showProfileDropdown}
            onToggle={setShowProfileDropdown}
            align="end"
          >
            <Dropdown.Toggle
              as="div"
              id="profile-dropdown"
              className="btn btn-outline-light rounded-pill px-3 py-2 d-flex align-items-center cursor-pointer"
            >
              <FiUser className="me-2" size={20} /> Profile{" "}
              <FiChevronDown className="ms-2" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg mt-2">
              {adminData ? (
                <>
                  <Dropdown.Header>
                    <strong className="text-primary">Admin:</strong>{" "}
                    {adminData.name || "Vignan"}
                    <br />
                    <strong className="text-primary">Regd No:</strong>{" "}
                    {adminData.regdNo}
                  </Dropdown.Header>
                  <Dropdown.Divider />
                </>
              ) : (
                <Dropdown.Header>Loading profile...</Dropdown.Header>
              )}

              <Dropdown.Item
                onClick={handleLogout}
                className="text-danger fw-semibold"
              >
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

// ---------- Reusable Topnav Button ----------
function TopnavButton({ label, icon, active, onClick }) {
  return (
    <button
      className={`btn btn-outline-light me-2 rounded-pill px-3 ${
        active ? "nav-btn-active" : ""
      }`}
      onClick={onClick}
    >
      <span className="me-1">{icon}</span> {label}
    </button>
  );
}
