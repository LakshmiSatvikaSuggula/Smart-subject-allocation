import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner, Table } from "react-bootstrap";
import axios from "axios";

const NUM_CHOICES = 4;

export default function PreferenceForm() {
  const [electives, setElectives] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [completedElectiveCodes, setCompletedElectiveCodes] = useState([]);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  const [showCompletedInput, setShowCompletedInput] = useState(false); // Ask completed electives
  const [completedInput, setCompletedInput] = useState(""); // comma-separated codes

  const studentRegdNo = localStorage.getItem("regdNo");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!studentRegdNo) {
      setError("Student registration number not found. Please log in again.");
      return;
    }

    const fetchElectivesAndStatus = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all electives
        const electivesRes = await axios.get("http://localhost:5000/electives", { headers });
        const allElectives = Array.isArray(electivesRes.data) ? electivesRes.data : [];

        // Fetch student's status
        const statusRes = await axios.get(
          `http://localhost:5000/api/student/allocation-details`,
          { headers }
        );
        const studentStatus = statusRes.data;

        if (studentStatus.preferencesSubmitted) {
          setIsAlreadySubmitted(true);
          setSuccess("✅ Your preferences have already been submitted.");
          const existingSelections = {};
          if (Array.isArray(studentStatus.currentPreferences)) {
            studentStatus.currentPreferences.forEach(pref => {
              existingSelections[pref.rank] = pref.electiveId;
            });
          }
          setSelections(existingSelections);

          const completedIds = Array.isArray(studentStatus.completedElectives)
            ? studentStatus.completedElectives
            : [];
          setCompletedElectiveCodes(completedIds);
          const availableElectives = allElectives.filter(e => !completedIds.includes(e.code));
          setElectives(availableElectives);
        } else {
          // If no completed electives stored, ask input
          if (!studentStatus.completedElectives || studentStatus.completedElectives.length === 0) {
            setShowCompletedInput(true);
          } else {
            const completedIds = studentStatus.completedElectives;
            setCompletedElectiveCodes(completedIds);
            const availableElectives = allElectives.filter(e => !completedIds.includes(e.code));
            setElectives(availableElectives);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchElectivesAndStatus();
  }, [studentRegdNo, token]);

  const handleCompletedSubmit = async () => {
    const inputCodes = completedInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean); // remove empty strings

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const electivesRes = await axios.get("http://localhost:5000/electives", { headers });
      const allElectives = Array.isArray(electivesRes.data) ? electivesRes.data : [];

      const validCodes = allElectives.map(e => e.code);
      const filteredCodes = inputCodes.filter(code => validCodes.includes(code));

      // Accept empty input as valid
      setCompletedElectiveCodes(filteredCodes);

      const availableElectives = allElectives.filter(e => !filteredCodes.includes(e.code));
      setElectives(availableElectives);

      setShowCompletedInput(false); // Move to main form
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to validate completed electives. Try again.");
    }
  };

  const handleRadioChange = (electiveId, rank) => {
    const updatedSelections = { ...selections };
    for (let r = 1; r <= NUM_CHOICES; r++) {
      if (updatedSelections[r] === electiveId) updatedSelections[r] = null;
    }
    updatedSelections[rank] = electiveId;
    setSelections(updatedSelections);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isAlreadySubmitted) return;
    if (!selections[1]) return setError("Choice 1 is mandatory.");

    const selectedElectiveIds = Object.values(selections).filter(Boolean);
    if (new Set(selectedElectiveIds).size !== selectedElectiveIds.length) {
      return setError("Cannot select same elective for multiple ranks.");
    }

    const rankedPreferences = Object.keys(selections)
      .filter(r => selections[r])
      .sort((a, b) => a - b)
      .map(rank => ({ rank: parseInt(rank, 10), electiveId: selections[rank] }));

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `http://localhost:5000/api/student/submit-preferences`,
        { preferences: rankedPreferences, completedElectives: completedElectiveCodes },
        { headers }
      );
      setSuccess("Preferences submitted successfully!");
      setIsAlreadySubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit preferences.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="m-4" />;

  if (showCompletedInput) {
    return (
      <Card className="m-4 p-4 shadow-lg">
        <h3>Enter any electives you have already completed</h3>
        <p>Separate multiple electives by commas (optional). e.g., 22CS101, 22CS102</p>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            value={completedInput}
            onChange={e => setCompletedInput(e.target.value)}
            placeholder="Enter completed electives codes"
          />
        </Form.Group>
        <Button onClick={handleCompletedSubmit}>Submit Completed Electives</Button>
        {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
      </Card>
    );
  }

  return (
    <Card className="m-4 p-4 shadow-lg">
      <h2>Elective Preference Submission</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Subject Name</th>
              {Array.from({ length: NUM_CHOICES }, (_, i) => (
                <th key={i + 1}>Choice {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {electives.length > 0 ? (
              electives.map(e => (
                <tr key={e._id}>
                  <td>{e.name} ({e.code})</td>
                  {Array.from({ length: NUM_CHOICES }, (_, i) => {
                    const rank = i + 1;
                    return (
                      <td key={rank} className="text-center">
                        <Form.Check
                          type="radio"
                          name={`rank-${rank}`}
                          value={e._id}
                          checked={selections[rank] === e._id}
                          onChange={() => handleRadioChange(e._id, rank)}
                          disabled={isAlreadySubmitted}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={NUM_CHOICES + 1} className="text-center text-muted">
                  No available electives to display.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {!isAlreadySubmitted && (
          <Button type="submit">Submit Preferences</Button>
        )}
      </Form>
    </Card>
  );
}
