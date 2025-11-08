// // src/components/StudentDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { 
//   FiUser, FiList, FiCheckCircle, FiDownload, 
//   FiLogOut, FiChevronDown 
// } from "react-icons/fi";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './StudentDashboard.css';
// import { Dropdown, Button, Card } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';

// // Elective Components
// import PreferenceForm from './PreferenceForm';
// import AllocationStatus from './AllocationStatus';
// import ConfirmationSlip from './ConfirmationSlip';

// // LifeSkill Components
// import PreferenceSkillForm from './PreferenceSkillForm';
// import AllocationSkillStatus from './AllocationSkillStatus';
// import ConfirmationSkillSlip from './ConfirmationSkillSlip';


// function TopnavButton({ label, icon, active, onClick }) {
//   return (
//     <button
//       className={`btn btn-outline-light me-2 rounded-pill px-3 ${active ? "nav-btn-active-info" : ""}`}
//       onClick={onClick}
//     >
//       <span className="me-1">{icon}</span> {label}
//     </button>
//   );
// }

// export default function StudentDashboard() {
//   const [activeTab, setActiveTab] = useState("preferences");
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//   const [student, setStudent] = useState(null);
//   const [category, setCategory] = useState(""); // "elective" or "lifeskill"
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/");
//   };

//   // Fetch student info
//   useEffect(() => {
//     const fetchStudent = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/student/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = await res.json();
//         if (data.ok) setStudent(data.student);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchStudent();
//   }, [token]);

//   // --- Category selection screen ---
//   if (!category) {
//     return (
//       <div className="d-flex flex-column justify-content-center align-items-center vh-100">
//         <Card className="p-5 text-center shadow-lg">
//           <h3 className="mb-4 text-info fw-bold">Select Your Preference Type</h3>
//           <div className="d-flex gap-3 justify-content-center">
//             <Button variant="info" size="lg" onClick={() => setCategory("elective")}>
//               🎓 Elective
//             </Button>
//             <Button variant="success" size="lg" onClick={() => setCategory("lifeskill")}>
//               🌱 Life Skill
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   // --- Active component based on category and tab ---
//   const renderActiveComponent = () => {
//     if (category === "elective") {
//       switch (activeTab) {
//         case "preferences": return <PreferenceForm />;
//         case "status": return <AllocationStatus />;
//         case "download": return <ConfirmationSlip />;
//         default: return <PreferenceForm />;
//       }
//     } else {
//       switch (activeTab) {
//         case "preferences": return <PreferenceSkillForm />;
//         case "status": return <AllocationSkillStatus />;
//         case "download": return <ConfirmationSkillSlip />;
//         default: return <PreferenceSkillForm />;
//       }
//     }
//   };

//   return (
//     <div className="dashboard-body student-bg-image">
//       <nav className="navbar navbar-expand-lg navbar-dark shadow-lg px-4 bg-info-gradient">
//         <div className="d-flex align-items-center">
//           <FiUser className="me-2 text-white" size={28} />
//           <span className="navbar-brand mb-0 h3 fw-bold text-white">
//             Student Portal — {category === "elective" ? "Electives" : "Life Skills"}
//           </span>
//         </div>

//         <div className="collapse navbar-collapse justify-content-end">
//           <div className="navbar-nav me-3">
//             <TopnavButton 
//               label="Submit Preferences" 
//               icon={<FiList />} 
//               active={activeTab === "preferences"} 
//               onClick={() => setActiveTab("preferences")} 
//             />
//             <TopnavButton 
//               label="Allocation Status" 
//               icon={<FiCheckCircle />} 
//               active={activeTab === "status"} 
//               onClick={() => setActiveTab("status")} 
//             />
//             <TopnavButton 
//               label="Download Slip" 
//               icon={<FiDownload />} 
//               active={activeTab === "download"} 
//               onClick={() => setActiveTab("download")} 
//             />
//           </div>

//           <Dropdown show={showProfileDropdown} onToggle={setShowProfileDropdown} align="end">
//             <Dropdown.Toggle as="div" id="profile-dropdown" className="btn btn-outline-light rounded-pill px-3 py-2 d-flex align-items-center cursor-pointer">
//               <FiUser className="me-2" size={20} /> Profile <FiChevronDown className="ms-2" />
//             </Dropdown.Toggle>

//             <Dropdown.Menu className="shadow-lg mt-2">
//               <Dropdown.Header>
//                 <strong className="text-info">Student ID:</strong> {student?.regdNo || "Loading..."}
//               </Dropdown.Header>
//               <Dropdown.Divider />
//               <Dropdown.Item onClick={handleLogout} className="text-danger">
//                 <FiLogOut className="me-2" /> Logout
//               </Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//         </div>
//       </nav>

//       <div className="container mt-4 flex-grow-1 d-flex flex-column">
//         {renderActiveComponent()}
//       </div>
//     </div>
//   );
// }










// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  FiUser, FiList, FiCheckCircle, FiDownload, 
  FiLogOut, FiChevronDown 
} from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './StudentDashboard.css';
import { Dropdown, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Elective Components
import PreferenceForm from './PreferenceForm';
import AllocationStatus from './AllocationStatus';
import ConfirmationSlip from './ConfirmationSlip';

// LifeSkill Components
import PreferenceSkillForm from './PreferenceSkillForm';
import AllocationSkillStatus from './AllocationSkillStatus';
import ConfirmationSkillSlip from './ConfirmationSkillSlip';

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
  const [activeTab, setActiveTab] = useState("preferences");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [student, setStudent] = useState(null);
  const [category, setCategory] = useState(""); // "elective" or "lifeskill"
  const [allocationLocked, setAllocationLocked] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch student info
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/student/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) setStudent(data.student);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudent();
  }, [token]);

  // Fetch allocation lock status
  useEffect(() => {
    const fetchAllocationStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/allocation-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllocationLocked(data.allocationLocked);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllocationStatus();
  }, [token]);

  // --- Category selection screen ---
  if (!category) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Card className="p-5 text-center shadow-lg">
          <h3 className="mb-4 text-info fw-bold">Select Your Preference Type</h3>
          <div className="d-flex gap-3 justify-content-center">
            <Button variant="info" size="lg" onClick={() => setCategory("elective")}>
              🎓 Elective
            </Button>
            <Button variant="success" size="lg" onClick={() => setCategory("lifeskill")}>
              🌱 Life Skill
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Active component based on category and tab ---
  const renderActiveComponent = () => {
    if (activeTab === "preferences" && allocationLocked) {
      return (
        <div className="alert alert-warning text-center mt-4">
          Preferences are locked by the admin. You cannot submit or edit preferences now.
        </div>
      );
    }

    if (category === "elective") {
      switch (activeTab) {
        case "preferences": return <PreferenceForm />;
        case "status": return <AllocationStatus />;
        case "download": return <ConfirmationSlip />;
        default: return <PreferenceForm />;
      }
    } else {
      switch (activeTab) {
        case "preferences": return <PreferenceSkillForm />;
        case "status": return <AllocationSkillStatus />;
        case "download": return <ConfirmationSkillSlip />;
        default: return <PreferenceSkillForm />;
      }
    }
  };

  return (
    <div className="dashboard-body student-bg-image">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg px-4 bg-info-gradient">
        <div className="d-flex align-items-center">
          <FiUser className="me-2 text-white" size={28} />
          <span className="navbar-brand mb-0 h3 fw-bold text-white">
            Student Portal — {category === "elective" ? "Electives" : "Life Skills"}
          </span>
        </div>

        <div className="collapse navbar-collapse justify-content-end">
          <div className="navbar-nav me-3">
            {/* Hide or disable Submit Preferences button if allocation is locked */}
            <TopnavButton 
              label="Submit Preferences" 
              icon={<FiList />} 
              active={activeTab === "preferences"} 
              onClick={() => !allocationLocked && setActiveTab("preferences")} 
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

          <Dropdown show={showProfileDropdown} onToggle={setShowProfileDropdown} align="end">
            <Dropdown.Toggle as="div" id="profile-dropdown" className="btn btn-outline-light rounded-pill px-3 py-2 d-flex align-items-center cursor-pointer">
              <FiUser className="me-2" size={20} /> Profile <FiChevronDown className="ms-2" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg mt-2">
              <Dropdown.Header>
                <strong className="text-info">Student ID:</strong> {student?.regdNo || "Loading..."}
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FiLogOut className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      <div className="container mt-4 flex-grow-1 d-flex flex-column">
        {renderActiveComponent()}
      </div>
    </div>
  );
}
