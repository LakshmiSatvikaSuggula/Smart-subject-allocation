// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom for navigation
import './LandingPage.css'; // Import the CSS for this component

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Welcome to Smart Subject Allocation System</h1>
        <p className="lead">
          Streamline the process of allocating students to their preferred electives.
          Our intelligent system uses advanced algorithms to ensure fair and efficient distribution,
          considering student preferences, eligibility criteria, and faculty capacities.
        </p>
        <p>
          Empower your academic institution with a robust platform for managing courses,
          student data, and generating comprehensive allocation reports.
        </p>
        <p>
          Say goodbye to manual headaches and hello to automated precision.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg mt-4 get-started-btn">
          Get Started
        </Link>
      </div>
    </div>
  );
}