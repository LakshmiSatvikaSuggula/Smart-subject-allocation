import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BG_IMAGE = "Register.jpg"; 

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

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setError("");
        setSuccess("");
        // Reset form data completely when role changes
        setFormData({
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
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // *CRITICAL CHANGE: Only allow student registration to proceed.*
        if (role !== "student") {
            setError(`Registration  is only available for Students. ${role} should use the Login page.`);
            return;
        }

        let payload = {};
        let fieldsValid = true;

        // --- Student Validation & Payload ---
        if (role === "student") {
            const studentFields = [
                "name", "email", "password", "confirmPassword", "department",
                "regdNo", "percentage", "cgpa", "dob"
            ];

            for (const key of studentFields) {
                if (!formData[key]) {
                    fieldsValid = false;
                    break;
                }
            }

            if (!fieldsValid) {
                setError("Please fill all student registration fields.");
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (formData.dob > todayStr) {
                setError("Date of birth cannot be in future.");
                return;
            }

            // Prepare student payload for the BACKEND
            payload = {
                role,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                department: formData.department,
                regdNo: formData.regdNo,
                percentage: parseFloat(formData.percentage), // Convert to number
                cgpa: parseFloat(formData.cgpa), // Convert to number
                dob: formData.dob,
            };
        } 
        
        // Faculty/Admin are blocked by the initial 'if (role !== "student")' check above.
        
        // 2. API Call to Register User
        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                setError("");
                setSuccess(data.message || "Registration successful! Redirecting to login...");
                // Redirect to the main Login page (which is usually '/')
                setTimeout(() => navigate("/"), 2000); 
            } else {
                setSuccess("");
                setError(data.error || "Registration failed. Please check your data.");
            }
        } catch (err) {
            setSuccess("");
            setError("Server connection error. Please ensure the backend is running.");
            console.error("Registration API error:", err);
        }
    };
    
    // Helper message for restricted roles
    const RestrictedMessage = ({ role }) => (
        <div className="text-center p-4">
            <Alert variant="info">
                *{role}* accounts are managed internally. You do not need to register here.
                <br />
                Please proceed to the Login page to access the portal using your credentials.
            </Alert>
            <Button variant="primary" onClick={() => navigate("/")}>
                Go to Login
            </Button>
        </div>
    );


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
                    <h2 className="text-center mb-3" style={{ color: "#223c56" }}>
                        Student Registration 🧑‍🎓
                    </h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2" controlId="role">
                            <Form.Label>User Type</Form.Label>
                            <Form.Select value={role} onChange={handleRoleChange}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        
                        {/* ------------------------------------------- */}
                        {/* CONDITIONAL RENDERING BASED ON ROLE */}
                        {/* ------------------------------------------- */}
                        {role === "student" ? (
                            <>
                                {/* Student Fields */}
                                <Form.Group className="mb-2" controlId="name">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="regdNo">
                                    <Form.Label>Registration Number</Form.Label>
                                    <Form.Control type="text" name="regdNo" placeholder="Enter registration number" value={formData.regdNo} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="department">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Control type="text" name="department" placeholder="Enter department" value={formData.department} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="percentage">
                                    <Form.Label>Percentage</Form.Label>
                                    <Form.Control type="number" name="percentage" placeholder="Enter percentage" value={formData.percentage} onChange={handleChange} min={0} max={100} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="cgpa">
                                    <Form.Label>CGPA</Form.Label>
                                    <Form.Control type="number" step="0.01" name="cgpa" placeholder="Enter CGPA" value={formData.cgpa} onChange={handleChange} min={0} max={10} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="dob">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} max={todayStr} required />
                                </Form.Group>

                                {/* Shared Fields */}
                                <Form.Group className="mb-2" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
                                </Form.Group>

                                {error && <Alert variant="danger" className="mt-2 mb-1">{error}</Alert>}
                                {success && <Alert variant="success" className="mt-2 mb-1">{success}</Alert>}
                                <Button variant="primary" type="submit" className="w-100 mb-2">
                                    Register Account
                                </Button>
                                <div className="text-center">
                                    <Button variant="link" style={{ padding: 0, color: "#223c56" }} onClick={() => navigate("/login")}>
                                        Already have an account? Login
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <RestrictedMessage role={role === "faculty" ? "Faculty" : "Admin"} />
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}