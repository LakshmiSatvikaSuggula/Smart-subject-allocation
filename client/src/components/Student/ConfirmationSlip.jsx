// src/components/ConfirmationSlip.jsx - REVISED with Inline Styles
import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios'; // Ensure axios is installed

export default function ConfirmationSlip() {
    const [downloadError, setDownloadError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloadError('');
        setIsDownloading(true);
        // 🚨 Placeholder: Replace with your actual backend URL
        const API_URL = 'http://localhost:5000/api/student/download-slip';

        try {
            const token = localStorage.getItem('token');

            // This is the actual API call logic
            /*
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Critical for handling file downloads
            });

            // Logic to trigger browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Elective_Allotment_Slip.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            */

            // --- MOCK SUCCESS RESPONSE ---
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert("Mock Download initiated! Check your downloads folder (functionality requires backend).");

        } catch (err) {
            // setDownloadError(err.response?.data?.message || 'Failed to download slip. Allocation may not be final.');
            setDownloadError('Failed to download slip. (API Placeholder Error)');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="m-4 p-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <h2 className="mb-4" style={{ color: '#4A148C', fontFamily: 'Georgia, serif' }}>📄 Download Confirmation Slip</h2> {/* Heading color and font */}

            {downloadError && (
                <Alert variant="danger" style={{ backgroundColor: '#FFEBEE', color: '#B71C1C', borderColor: '#EF9A9A' }}> {/* Error Alert colors */}
                    {downloadError}
                </Alert>
            )}

            <p className="lead" style={{ color: '#4A4A4A' }}> {/* Text color */}
                Click the button below to download your official elective subject allotment confirmation slip (PDF).
                **Note:** The slip is only available after your allocation is confirmed.
            </p>

            <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-50 mx-auto mt-3"
                style={{
                    backgroundColor: '#AF8B65', // Muted gold/tan for the button
                    borderColor: '#AF8B65',
                    color: 'white',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                }}
                // Note: Hover styles cannot be applied directly via inline style attribute.
                // For hover, you'd typically need a CSS file or a library that supports dynamic styling.
            >
                {isDownloading ? <Spinner animation="border" size="sm" className="me-2" style={{ color: 'white' }} /> : 'Download Allotment Slip'} {/* Spinner color */}
            </Button>
        </Card>
    );
}