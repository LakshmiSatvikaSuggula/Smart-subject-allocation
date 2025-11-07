// src/components/Student/PreferenceForm.jsx

import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Table } from 'react-bootstrap';
import axios from 'axios'; 
// NOTE: This component relies on styles defined in StudentDashboard.css 
// (or global styles) to color the radio buttons correctly.

// Mock data for electives (Replace with actual API fetch)
const MOCK_ELECTIVES = [
    { id: 1, name: 'AI & Machine Learning' },
    { id: 2, name: 'Cloud Computing' },
    { id: 3, name: 'Cyber Security' },
    { id: 4, name: 'Data Visualization' },
    { id: 5, name: 'Mobile App Development' },
];

const NUM_CHOICES = 4; // Student can make up to 4 ranked choices

export default function PreferenceForm() {
    // State stores the selected subject ID for each rank. 
    // Key is the rank (1-4), Value is the elective ID (e.g., { 1: 3, 2: 1, 3: 0, 4: 0 })
    const [selections, setSelections] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create an array [1, 2, 3, 4] for iteration over ranks/choices
    const rankIndices = Array.from({ length: NUM_CHOICES }, (_, i) => i + 1);

    const handleRadioChange = (electiveId, newRank) => {
        const newId = parseInt(electiveId);
        const newRankInt = parseInt(newRank);

        let updatedSelections = { ...selections };

        // 1. Clear the old rank of the subject being selected (if it was already chosen for another rank)
        const oldRank = Object.keys(updatedSelections).find(
            key => updatedSelections[key] === newId
        );
        if (oldRank && parseInt(oldRank) !== newRankInt) { 
            updatedSelections[oldRank] = 0; 
        }

        // 2. Set the new rank
        updatedSelections[newRankInt] = newId;

        setSelections(updatedSelections);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const rankedPrefs = Object.keys(selections)
            .filter(rank => selections[rank] > 0) // Only include actual selections
            .map(rank => ({
                electiveId: selections[rank],
                rank: parseInt(rank)
            }));

        // Frontend Validation: Ensure Choice 1 is selected
        if (!selections[1] || selections[1] === 0) {
            return setError("Choice 1 is mandatory. Please select your first preference.");
        }

        setLoading(true);
        // 🚨 Placeholder: Replace with your actual backend URL
        const API_URL = 'http://localhost:5000/api/student/submit-preferences';

        try {
            // --- ACTUAL API CALL LOGIC ---
            /*
            const token = localStorage.getItem('token');
            await axios.post(API_URL, 
                { preferences: rankedPrefs },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            */
            
            // --- MOCK SUCCESS RESPONSE (Remove in production) ---
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess('Preferences submitted successfully! Please check the status page later.');

        } catch (err) {
            // setError(err.response?.data?.message || 'Failed to submit preferences.');
            setError('Failed to submit preferences (API Placeholder Error).');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="m-4 p-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <h2 className="mb-4" style={{ color: '#4A148C', fontFamily: 'Georgia, serif' }}>📚 Elective Preference Submission</h2>
            <Alert style={{ backgroundColor: '#F3E5F5', color: '#6A1B9A', borderColor: '#E1BEE7' }}>
                Select your preference rank (Choice 1 is highest priority) for up to {NUM_CHOICES} subjects.
                Each subject can only be assigned one rank.
            </Alert>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Table bordered hover responsive className="mt-3" style={{
                    '--bs-table-bg': 'rgba(255, 255, 255, 0.7)',
                    '--bs-table-striped-bg': 'rgba(245, 245, 245, 0.7)',
                    '--bs-table-hover-bg': 'rgba(230, 230, 230, 0.8)',
                    borderColor: '#D7CCC8',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    <thead>
                        <tr>
                            <th style={{ width: '40%', backgroundColor: '#795548', color: 'white', borderColor: '#6D4C41' }}>Subject Name</th>
                            {rankIndices.map(rank => (
                                <th key={rank} className="text-center" style={{ backgroundColor: '#795548', color: 'white', borderColor: '#6D4C41' }}>Choice {rank}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_ELECTIVES.map(elective => {
                            // Find the rank (1-4) this elective currently holds
                            const currentRank = rankIndices.find(
                                rank => selections[rank] === elective.id
                            );

                            return (
                                <tr key={elective.id}>
                                    <td style={{ color: '#4A4A4A', borderColor: '#D7CCC8' }}>{elective.name}</td>
                                    {rankIndices.map(rank => (
                                        <td key={rank} className="text-center" style={{ borderColor: '#D7CCC8' }}>
                                            <Form.Check
                                                type="radio"
                                                name={`rank-selection-${rank}`} // Unique name for each column group
                                                value={elective.id}
                                                checked={currentRank === rank}
                                                onChange={() => handleRadioChange(elective.id, rank)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                <Button
                    type="submit"
                    disabled={loading}
                    className="mt-4"
                    style={{
                        backgroundColor: '#4A148C',
                        borderColor: '#4A148C',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}
                >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Submit Preferences'}
                </Button>
            </Form>
        </Card>
    );
}