import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Assume BG_IMAGE is defined or imported, or use inline styles.
 const BG_IMAGE = "vignan.png";

export default function ResetPasswordRequest() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setUserId(""); // Clear ID field when role changes
    setError("");
    setMessage("");
  };

  const handleChange = (e) => {
    setUserId(e.target.value);
    setError("");
    setMessage("");
  };

  // Helper function to determine the input label text
  const getInputLabel = () => {
    switch (role) {
      case "student":
        return "Registration Number";
      case "faculty":
        return "Faculty ID";
      case "admin":
        return "Admin ID";
      default:
        return "User ID";
    }
  };

  const getInputPlaceholder = () => {
    switch (role) {
      case "student":
        return "Enter registration number";
      case "faculty":
        return "Enter faculty ID";
      case "admin":
        return "Enter admin ID";
      default:
        return "Enter user ID";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!userId) {
      setError("Please enter your User ID.");
      return;
    }

    setLoading(true);

    let payload;
    // Determine the unique ID key for the backend based on role
    if (role === "student") {
      payload = { role, regdNo: userId };
    } else if (role === "faculty") {
      payload = { role, facultyId: userId };
    } else if (role === "admin") {
      payload = { role, adminId: userId };
    }

    try {
      // ⚠ REPLACE WITH YOUR ACTUAL BACKEND ENDPOINT
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Success message should be generic for security
        setMessage(
          "If an account with that ID exists, a password reset link has been sent to the associated email address."
        );
        setUserId(""); // Clear the input field
      } else {
        // Use generic success message even on potential error, for security
        setMessage(
          "If an account with that ID exists, a password reset link has been sent to the associated email address."
        );
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        // backgroundImage: url(${BG_IMAGE}), // Uncomment if using BG_IMAGE
        backgroundColor: "#1f2d3f", // Placeholder background
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: "100%",
          background: "rgba(35,40,55,0.8)",
          boxShadow: "0 8px 28px rgba(40,32,105,0.18)",
          border: "1px solid #e4e8ed",
          borderRadius: "12px",
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: "white" }}>
            Reset Password Request
          </h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label style={{ color: "white" }}>User Type</Form.Label>
              <Form.Select name="role" value={role} onChange={handleRoleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            {/* User ID Input Field */}
            <Form.Group className="mb-3" controlId="formUserId">
              <Form.Label style={{ color: "white" }}>
                {getInputLabel()}
              </Form.Label>
              <Form.Control
                type="text"
                name="userId"
                placeholder={getInputPlaceholder()}
                value={userId}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="warning"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Form>

          {/* Back to Login Link */}
          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              style={{
                color: "#fff",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}