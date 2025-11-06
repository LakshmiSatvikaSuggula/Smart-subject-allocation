import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BG_IMAGE = "register.jpg"; // Your background image path

// Calculate today's date in YYYY-MM-DD for date input "max" property
const todayStr = new Date().toISOString().split("T")[0];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    regdNo: "",
    percentage: "",
    cgpa: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRoleChange = (e) => setRole(e.target.value);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation example
    for (const key in formData) {
      if (!formData[key]) {
        setError("Please fill all fields.");
        return;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.dob > todayStr) {
      setError("Date of birth cannot be in future.");
      return;
    }

    setSuccess("Registered successfully! You may now login.");
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "540px",
          minHeight: "420px",
          background: "#fff",
          boxShadow: "0 8px 28px rgba(40,32,105,0.18)",
          borderRadius: "18px",
          padding: "16px 18px",
          opacity: 1,
          border: "1px solid #e4e8ed",
        }}
      >
        <Card.Body style={{ padding: "18px 18px 14px 18px" }}>
          <h2 className="text-center mb-3" style={{ color: "#223c56" }}>Register</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2" controlId="role">
              <Form.Label>User Type</Form.Label>
              <Form.Select value={role} onChange={handleRoleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="regdNo">
              <Form.Label>Registration Number</Form.Label>
              <Form.Control
                type="text"
                name="regdNo"
                placeholder="Enter registration number"
                value={formData.regdNo}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="department">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="percentage">
              <Form.Label>Percentage</Form.Label>
              <Form.Control
                type="number"
                name="percentage"
                placeholder="Enter percentage"
                value={formData.percentage}
                onChange={handleChange}
                min={0}
                max={100}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="cgpa">
              <Form.Label>CGPA</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="cgpa"
                placeholder="Enter CGPA"
                value={formData.cgpa}
                onChange={handleChange}
                min={0}
                max={10}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="dob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={todayStr}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {error && <Alert variant="danger" className="mt-2 mb-1">{error}</Alert>}
            {success && <Alert variant="success" className="mt-2 mb-1">{success}</Alert>}
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Register
            </Button>
            <div className="text-center">
              <Button
                variant="link"
                style={{ padding: 0, color: "#223c56" }}
                onClick={() => navigate("/")}
              >
                Already have an account? Login
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
