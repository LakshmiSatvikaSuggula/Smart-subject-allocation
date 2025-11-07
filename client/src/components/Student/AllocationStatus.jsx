import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';

// Removed MOCK_ALLOCATION data as we are using the live API

export default function AllocationStatus() {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationStatus, setConfirmationStatus] = useState(false);

    useEffect(() => {
        fetchAllocationStatus();
    }, []);

    const fetchAllocationStatus = async () => {
        setLoading(true);
        // Corrected URL: GET /api/student/status
        const API_URL = 'http://localhost:5000/api/student/status'; 

        try {
            const token = localStorage.getItem('token');

            // --- ACTUAL API CALL LOGIC ---
            const { data } = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Assumes backend returns { ok: true, allocation: { subjectName, allocatedAt, isConfirmed }, isConfirmed: bool }

            setAllocation(data.allocation || null);
            setConfirmationStatus(data.isConfirmed || false);
            // --- END ACTUAL API CALL LOGIC ---

        } catch (err) {
            // Use specific error message from the server if available
            setError(err.response?.data?.error || 'Failed to fetch allocation status.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!allocation || confirmationStatus) return;
        setError(''); // Clear previous error

        // Corrected URL: POST /api/student/confirm-allocation
        const API_URL = 'http://localhost:5000/api/student/confirm-allocation'; 

        try {
            const token = localStorage.getItem('token');

            // --- ACTUAL API CALL LOGIC ---
            await axios.post(API_URL, {}, { // Sending empty body 
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setConfirmationStatus(true);
            
            // Update the local allocation state to reflect confirmed status
            setAllocation(prev => ({ ...prev, isConfirmed: true }));
            
            alert('Allocation confirmed successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to confirm allocation.');
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" style={{ color: '#4A148C' }} /></div>; 
    if (error) return <Alert variant="danger" className="m-4" style={{ backgroundColor: '#FFEBEE', color: '#B71C1C', borderColor: '#EF9A9A' }}>Error: {error}</Alert>; 

    // Check if allocation data is truly missing
    if (!allocation || !allocation.subjectName) {
        return (
            <Alert style={{ backgroundColor: '#F3E5F5', color: '#6A1B9A', borderColor: '#E1BEE7' }} className="m-4">
                Allocation status is currently **Pending**. Please check back later!
            </Alert>
        );
    }

    return (
        <Card className="m-4 p-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <h2 className="mb-4" style={{ color: '#4A148C', fontFamily: 'Georgia, serif' }}>✅ Your Subject Allocation</h2>

            <p className="lead" style={{ color: '#4A4A4A' }}><strong>Allocated Subject:</strong> {allocation.subjectName}</p>
            <p style={{ color: '#4A4A4A' }}><strong>Date Allocated:</strong> {new Date(allocation.allocatedAt).toLocaleDateString()}</p>

            <hr style={{ borderColor: '#D7CCC8' }} />

            <h3 style={{ color: '#4A148C', fontFamily: 'Georgia, serif' }}>Confirmation Status:</h3>
            <Alert style={confirmationStatus
                ? { backgroundColor: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7' } // Confirmed (Success Green)
                : { backgroundColor: '#FFFDE7', color: '#FBC02D', borderColor: '#FFF59D' } // Allocated (Warning Yellow)
            }>
                {confirmationStatus
                    ? `Status: Confirmed and Finalized.`
                    : `Status: Allocated. You must click the button below to confirm.`}
            </Alert>

            {!confirmationStatus && (
                <Button
                    onClick={handleConfirm}
                    className="mt-3"
                    style={{
                        backgroundColor: '#4A148C', 
                        borderColor: '#4A148C',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}
                >
                    Click to CONFIRM Allocation
                </Button>
            )}
        </Card>
    );
}