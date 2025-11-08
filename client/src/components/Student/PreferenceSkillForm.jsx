import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner, Table } from "react-bootstrap";
import axios from "axios";

const NUM_CHOICES = 4;

export default function LifeskillPreferenceForm() {
  const [lifeskills, setLifeskills] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [completedLifeskillCodes, setCompletedLifeskillCodes] = useState([]);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  const [showCompletedInput, setShowCompletedInput] = useState(false);
  const [completedInput, setCompletedInput] = useState("");

  const studentRegdNo = localStorage.getItem("regdNo");
  const token = localStorage.getItem("token");

  // ---------------- Fetch LifeSkills & Status ----------------
  useEffect(() => {
    if (!studentRegdNo) {
      setError("Student registration number not found. Please log in again.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all available lifeskills
        const lifeskillsRes = await axios.get("http://localhost:5000/lifeskills", { headers });
        const allLifeskills = Array.isArray(lifeskillsRes.data) ? lifeskillsRes.data : [];

        // Fetch student status
        const statusRes = await axios.get(
          "http://localhost:5000/api/lifeskillsStudent/allocation-details",
          { headers }
        );
        const studentStatus = statusRes.data;

        if (studentStatus.preferencesSubmitted) {
          setIsAlreadySubmitted(true);
          setSuccess("✅ Your life skill preferences have already been submitted.");

          // Load previously submitted preferences
          const existingSelections = {};
          if (Array.isArray(studentStatus.currentPreferences)) {
            studentStatus.currentPreferences.forEach(pref => {
              existingSelections[pref.rank] = pref.lifeSkillId || pref.lifeskillId || pref._id;
            });
          }
          setSelections(existingSelections);
        }

        // Handle completed life skills
        const completedIds = Array.isArray(studentStatus.completedLifeSkills)
          ? studentStatus.completedLifeSkills
          : [];

        setCompletedLifeskillCodes(completedIds);
        const availableLifeskills = allLifeskills.filter(
          e => !completedIds.includes(e.code)
        );
        setLifeskills(availableLifeskills);

        if (completedIds.length === 0) setShowCompletedInput(true);
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentRegdNo, token]);

  // ---------------- Handle completed life skills input ----------------
  const handleCompletedSubmit = async () => {
    const inputCodes = completedInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const lifeskillsRes = await axios.get("http://localhost:5000/lifeskills", { headers });
      const allLifeskills = Array.isArray(lifeskillsRes.data) ? lifeskillsRes.data : [];

      const validCodes = allLifeskills.map(e => e.code);
      const filteredCodes = inputCodes.filter(code => validCodes.includes(code));

      setCompletedLifeskillCodes(filteredCodes);
      const availableLifeskills = allLifeskills.filter(e => !filteredCodes.includes(e.code));
      setLifeskills(availableLifeskills);
      setShowCompletedInput(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to validate completed life skills. Try again.");
    }
  };

  // ---------------- Handle radio selection ----------------
  const handleRadioChange = (lifeSkillId, rank) => {
    const updatedSelections = { ...selections };
    for (let r = 1; r <= NUM_CHOICES; r++) {
      if (updatedSelections[r] === lifeSkillId) updatedSelections[r] = null;
    }
    updatedSelections[rank] = lifeSkillId;
    setSelections(updatedSelections);
    setError("");
    setSuccess("");
  };

  // ---------------- Handle Submit ----------------
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isAlreadySubmitted) return;
    if (!selections[1]) return setError("Choice 1 is mandatory.");

    const selectedIds = Object.values(selections).filter(Boolean);
    if (new Set(selectedIds).size !== selectedIds.length) {
      return setError("Cannot select the same life skill for multiple ranks.");
    }

    // ✅ Correct key name for backend (lifeSkillId)
    const rankedPreferences = Object.keys(selections)
      .filter(r => selections[r])
      .sort((a, b) => a - b)
      .map(rank => ({
        rank: parseInt(rank, 10),
        lifeSkillId: selections[rank],
      }));

    console.log("Submitting preferences:", rankedPreferences);

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        "http://localhost:5000/api/lifeskillsStudent/submit-preferences",
        { preferences: rankedPreferences, completedLifeSkills: completedLifeskillCodes },
        { headers }
      );
      console.log("Server response:", res.data);
      setSuccess("✅ Preferences submitted successfully!");
      setIsAlreadySubmitted(true);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(`❌ Failed to submit preferences. ${err.response?.data?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Render ----------------
  if (loading) return <Spinner animation="border" className="m-4" />;

  if (showCompletedInput) {
    return (
      <Card className="m-4 p-4 shadow-lg">
        <h3>Enter any life skills you have already completed</h3>
        <p>Separate multiple codes by commas (e.g., 21LS01, 21LS02)</p>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            value={completedInput}
            onChange={e => setCompletedInput(e.target.value)}
            placeholder="Enter completed life skill codes"
          />
        </Form.Group>
        <Button onClick={handleCompletedSubmit}>Submit Completed Life Skills</Button>
        {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
      </Card>
    );
  }

  return (
    <Card className="m-4 p-4 shadow-lg">
      <h2>Life Skill Preference Submission</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Life Skill Name</th>
              {Array.from({ length: NUM_CHOICES }, (_, i) => (
                <th key={i + 1}>Choice {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lifeskills.length > 0 ? (
              lifeskills.map(e => (
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
                  No available life skills to display.
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
