// src/pages/StudentDashboard.js

import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ELECTIVES = [
  "AI", "ML", "IoT", "Data Science", "Cybersecurity", "Cloud", "Blockchain"
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(['', '', '']); // Three preferences as example
  const [submitMessage, setSubmitMessage] = useState('');
  const [allocation, setAllocation] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    // Optionally fetch allocation status from backend here
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePrefChange = (idx, value) => {
    const t = [...prefs];
    t[idx] = value;
    setPrefs(t);
  };

  const handleElectiveSubmit = (e) => {
    e.preventDefault();
    // Example: Check that all preferences are unique and selected
    if (!prefs.every(v => v) || new Set(prefs).size !== prefs.length) {
      setSubmitMessage("Please select different subjects for all preferences.");
      return;
    }

    // TODO: Call backend API to save preferences here
    setSubmitMessage("Preferences submitted successfully!");
    // Optionally set allocation here (simulate backend response)
    setAllocation({
      subject: prefs[0],
      status: "Allocated"
    });
  };

  const handleDownloadSlip = () => {
    // TODO: Implement PDF/download logic
    alert("Download slip feature coming soon!");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>Student Dashboard</h3>
        </Card.Header>
        <Card.Body>
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <hr />
          <h5>Submit Elective Subject Preferences (Ranked Order)</h5>
          <Form onSubmit={handleElectiveSubmit}>
            <Row>
              {[0,1,2].map(idx => (
                <Col md={4} key={idx}>
                  <Form.Group className="mb-3" controlId={`pref${idx+1}`}>
                    <Form.Label>Preference {idx+1}</Form.Label>
                    <Form.Select
                      value={prefs[idx]}
                      onChange={e => handlePrefChange(idx, e.target.value)}
                      required
                    >
                      <option value="">-- Select Elective --</option>
                      {ELECTIVES.map(sub =>
                        prefs.includes(sub) && prefs[idx] !== sub
                          ? null
                          : <option key={sub}>{sub}</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <Button type="submit" variant="primary" className="mb-2">Submit Preferences</Button>
          </Form>
          {submitMessage && <Alert variant="info">{submitMessage}</Alert>}

          <hr />
          <h5>Allocated Subject and Status</h5>
          {allocation
            ? (
              <div>
                <p><strong>Subject:</strong> {allocation.subject}</p>
                <p><strong>Status:</strong> {allocation.status}</p>
                <Button variant="success" onClick={handleDownloadSlip}>Download Confirmation Slip</Button>
              </div>
            )
            : <p>You have not been allocated a subject yet.</p>
          }
          <div className="mt-4">
            <Button variant="danger" onClick={handleLogout}>Log Out</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
