import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';

export default function LifeSkillsAllocationStatus() {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationStatus, setConfirmationStatus] = useState(false);

    useEffect(() => {
        fetchAllocationStatus();
    }, []);

    const fetchAllocationStatus = async () => {
        setLoading(true);
        setError('');
        const API_URL = 'http://localhost:5000/api/lifeskillsStudent/allocation-details';

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.ok) {
                setAllocation(data.allocation || null);
                setConfirmationStatus(data.isConfirmed || false);
            } else {
                setError('Failed to fetch Life Skills allocation status.');
            }
        } catch (err) {
            console.error('LifeSkills Allocation fetch error:', err.response || err);
            setError(err.response?.data?.error || 'Failed to fetch Life Skills allocation status.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!allocation || confirmationStatus) return;
        setError('');

        const API_URL = 'http://localhost:5000/api/lifeskillsStudent/confirm-allocation';

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(API_URL, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.ok) {
                setConfirmationStatus(true);
                setAllocation(prev => prev ? { ...prev, isConfirmed: true } : prev);
                alert('✅ Life Skills allocation confirmed successfully!');
            } else {
                setError(data.error || 'Failed to confirm Life Skills allocation.');
            }
        } catch (err) {
            console.error('LifeSkills confirm error:', err.response || err);
            setError(err.response?.data?.error || 'Failed to confirm Life Skills allocation.');
        }
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="m-4">{error}</Alert>;
    }

    if (!allocation) {
        return (
            <Alert className="m-4" variant="warning">
                Life Skills allocation is currently <strong>Pending</strong>. Please check back later!
            </Alert>
        );
    }

    return (
        <Card className="m-4 p-4 shadow-lg">
            <h2 className="mb-4">🧠 Your Life Skills Allocation</h2>
            <p><strong>Allocated Course:</strong> {allocation.subjectName || 'N/A'}</p>
            <p><strong>Date Allocated:</strong> {allocation.allocatedAt ? new Date(allocation.allocatedAt).toLocaleString() : 'N/A'}</p>

            <hr />

            <h3>Confirmation Status:</h3>
            <Alert variant={confirmationStatus ? "success" : "warning"}>
                {confirmationStatus
                    ? 'Status: Confirmed and Finalized.'
                    : 'Status: Allocated. Click the button below to confirm.'}
            </Alert>

            {!confirmationStatus && (
                <Button onClick={handleConfirm} variant="primary">
                    Confirm Life Skills Allocation
                </Button>
            )}
        </Card>
    );
}
