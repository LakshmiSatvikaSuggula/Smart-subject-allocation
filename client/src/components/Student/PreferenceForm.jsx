// src/components/Student/PreferenceForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner, Table } from "react-bootstrap";
import axios from "axios";

const NUM_CHOICES = 4; // Number of ranked choices allowed

export default function PreferenceForm() {
  const [electives, setElectives] = useState([]);
  const [selections, setSelections] = useState({}); // {1: electiveId, 2: electiveId, ...}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const studentRegdNo = localStorage.getItem("regdNo"); // Ensure this is stored on login

  // Fetch electives from backend
  useEffect(() => {
    const fetchElectives = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/electives", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure we always have an array
        setElectives(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load electives. Please try again later.");
      }
    };

    fetchElectives();
  }, []);

  // Handle radio button selection
  const handleRadioChange = (electiveId, rank) => {
    const updatedSelections = { ...selections };

    // Remove this elective from any previous rank
    for (let r = 1; r <= NUM_CHOICES; r++) {
      if (updatedSelections[r] === electiveId) updatedSelections[r] = null;
    }

    // Assign elective to current rank
    updatedSelections[rank] = electiveId;

    setSelections(updatedSelections);
    setError("");
    setSuccess("");
  };

  // Handle form submission
  // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selections[1]) {
      return setError("Choice 1 is mandatory. Please select your first preference.");
    }

    // *** FIX APPLIED HERE ***
    // The server expects: { rank: number, electiveId: string } objects in the array.
    const rankedPreferences = Object.keys(selections)
      .filter((rank) => selections[rank]) // Filter out unselected ranks
      .sort((a, b) => a - b) // Ensure submission order follows rank (1, 2, 3...)
      .map((rank) => ({ // Map to the required { rank: N, electiveId: ID } structure
        rank: parseInt(rank, 10), // Convert rank key (string) to number
        electiveId: selections[rank], // Get the selected elective ID
      }));
    // *** END FIX ***

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/student/submit-preferences`,
        { preferences: rankedPreferences }, // Sending the correctly structured array
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Preferences submitted successfully!");
    } catch (err) {
      console.error(err);
      // IMPORTANT: Log the detailed response data for better error messages
      if (err.response && err.response.data) {
          setError(err.response.data.message || "Failed to submit preferences due to server validation error.");
      } else {
          setError("Failed to submit preferences. Please try again.");
      }
    } finally {
      setLoading(false);
    }
};

  return (
    <Card className="m-4 p-4 shadow-lg" style={{ borderRadius: "10px" }}>
      <h2 className="mb-4" style={{ color: "#4A148C" }}>
        📚 Elective Preference Submission
      </h2>
      <Alert variant="info">
        Select your preference rank (Choice 1 is highest priority) for up to {NUM_CHOICES} subjects.
        Each subject can only be assigned to one rank.
      </Alert>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Subject Name</th>
              {Array.from({ length: NUM_CHOICES }, (_, i) => (
                <th key={i + 1} className="text-center">
                  Choice {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(electives) &&
              electives.map((elective) => (
                <tr key={elective._id}>
                  <td>{elective.name}</td>
                  {Array.from({ length: NUM_CHOICES }, (_, i) => {
                    const rank = i + 1;
                    return (
                      <td key={rank} className="text-center">
                        <Form.Check
                          type="radio"
                          name={`rank-${rank}`} // one group per rank
                          value={elective._id}
                          checked={selections[rank] === elective._id}
                          onChange={() => handleRadioChange(elective._id, rank)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </Table>

        <Button type="submit" disabled={loading} className="mt-3" style={{ backgroundColor: "#4A148C", borderColor: "#4A148C" }}>
          {loading ? <Spinner animation="border" size="sm" /> : "Submit Preferences"}
        </Button>
      </Form>
    </Card>
  );
}
