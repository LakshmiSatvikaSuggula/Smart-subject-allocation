// src/pages/LoginPage.jsx

import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BG_IMAGE = "vignan.png"; // Replace with your desired image

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    regdNo: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError("");
    setLoginFailed(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setLoginFailed(false);
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.regdNo || !formData.password) {
      setError("Please fill all fields.");
      setLoginFailed(false);
      return;
    }

    // Simulated failed login. Replace this with your own login check/API call.
    const isLoginSuccessful = false; // set to API result or test as needed
    if (!isLoginSuccessful) {
      setError("Login failed. Please check credentials.");
      setLoginFailed(true);
      return;
    }

    localStorage.setItem("user", JSON.stringify({ role, ...formData }));
    navigate("/dashboard");
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
          maxWidth: 400,
          width: "100%",
          background: 'transparent',      // Box is fully transparent
          boxShadow: 'none',              // No shadow
          opacity: 1
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: 'white' }}>Portal Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label style={{ color: 'white' }}>User Type</Form.Label>
              <Form.Select name="role" value={role} onChange={handleRoleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRegdNo">
              <Form.Label style={{ color: 'white' }}>Registration Number</Form.Label>
              <Form.Control
                type="text"
                name="regdNo"
                placeholder="Enter registration number"
                value={formData.regdNo}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label style={{ color: 'white' }}>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
          <div className="text-center mt-3">
            <span style={{ color: 'white' }}>Don't have an account?{' '}</span>
            <Button
              variant="link"
              style={{ color: '#fff', padding: 0, textDecoration: 'underline' }}
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
