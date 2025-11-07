import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";





const BG_IMAGE = "login.jpg";

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
    setFormData({ regdNo: "", password: "" });
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

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  // Change only the text shown to user, not field name
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

  // Actual API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.regdNo || !formData.password) {
      setError("Please fill all required fields.");
      setLoginFailed(false);
      return;
    }

    const payload = {
      regdNo: formData.regdNo, // always regdNo
      password: formData.password,
      role, // added for clarity
    };

    try {
      const response = await fetch("http://localhost:5000/login", {
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
        if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "faculty") {
        navigate("/faculty");
      } else if (data.user.role === "student") {
        navigate("/student");
      } 
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

            <Form.Group className="mb-3" controlId="formRegdNo">
              <Form.Label style={{ color: "white" }}>{getInputLabel()}</Form.Label>
              <Form.Control
                type="text"
                name="regdNo"
                placeholder={getInputPlaceholder()}
                value={formData.regdNo}
                onChange={handleChange}
                required
              />
            </Form.Group>

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
              <div className="w-100 text-end mt-1">
                <Button
                  variant="link"
                  onClick={handleResetPassword}
                  style={{ color: "#fff", padding: 0, fontSize: "0.85rem" }}
                >
                  Forgot Password?
                </Button>
              </div>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Login
            </Button>
          </Form>

          {role === "student" && (
            <div className="text-center mt-3">
              <span style={{ color: "white" }}>Don't have an account? </span>
              <Button
                variant="link"
                style={{
                  color: "#fff",
                  padding: 0,
                  textDecoration: "underline",
                }}
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
