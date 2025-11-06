import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BG_IMAGE = "vignan.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    regdNo: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError("");
    setLoginFailed(false);
    setFormData({ regdNo: "", email: "", password: "" });
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

  // Actual API logic for login (replace with your backend endpoint!)
  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload =
      role === "student"
        ? { role, regdNo: formData.regdNo, password: formData.password }
        : { role, email: formData.email, password: formData.password };

    // Validate frontend fields
    if (
      (role === "admin" || role === "faculty") &&
      (!formData.email || !formData.password)
    ) {
      setError("Please fill all fields.");
      setLoginFailed(false);
      return;
    } else if (
      role === "student" &&
      (!formData.regdNo || !formData.password)
    ) {
      setError("Please fill all fields.");
      setLoginFailed(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok && data.token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setError("");
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed. Please check credentials.");
        setLoginFailed(true);
      }
    } catch (err) {
      setError("Server error. Please try again.");
      setLoginFailed(true);
    }
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
          background: "rgba(35,40,55,0.18)",
          boxShadow: "0 8px 28px rgba(40,32,105,0.18)",
          opacity: 1,
          border: "1px solid #e4e8ed",
          borderRadius: "12px",
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: "white" }}>
            Portal Login
          </h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label style={{ color: "white" }}>User Type</Form.Label>
              <Form.Select name="role" value={role} onChange={handleRoleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            {role === "admin" || role === "faculty" ? (
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label style={{ color: "white" }}>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ) : (
              <Form.Group className="mb-3" controlId="formRegdNo">
                <Form.Label style={{ color: "white" }}>
                  Registration Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="regdNo"
                  placeholder="Enter registration number"
                  value={formData.regdNo}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label style={{ color: "white" }}>Password</Form.Label>
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
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Login
            </Button>
          </Form>

          <div className="text-center mt-3">
            <span style={{ color: "white" }}>Don't have an account? </span>
            <Button
              variant="link"
              style={{ color: "#fff", padding: 0, textDecoration: "underline" }}
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
