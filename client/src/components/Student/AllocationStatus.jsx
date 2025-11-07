import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';

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
        const API_URL = 'http://localhost:5000/api/student/allocation-details';

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.ok) {
                setAllocation(data.allocation || null);
                setConfirmationStatus(data.isConfirmed || false);
            } else {
                setError('Failed to fetch allocation status.');
            }
        } catch (err) {
            console.error('Allocation fetch error:', err.response || err);
            setError(err.response?.data?.error || 'Failed to fetch allocation status.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!allocation || confirmationStatus) return;
        setError('');

        const API_URL = 'http://localhost:5000/api/student/confirm-allocation';

        try {
            const token = localStorage.getItem('token');
            await axios.post(API_URL, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfirmationStatus(true);
            setAllocation(prev => prev ? { ...prev, isConfirmed: true } : prev);
            alert('Allocation confirmed successfully!');
        } catch (err) {
            console.error('Confirm allocation error:', err.response || err);
            setError(err.response?.data?.error || 'Failed to confirm allocation.');
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
                Allocation status is currently <strong>Pending</strong>. Please check back later!
            </Alert>
        );
    }

    return (
        <Card className="m-4 p-4 shadow-lg">
            <h2 className="mb-4">✅ Your Subject Allocation</h2>
            <p><strong>Allocated Subject:</strong> {allocation.subjectName || 'N/A'}</p>
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
                    Confirm Allocation
                </Button>
            )}
        </Card>
    );
}
