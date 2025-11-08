// src/components/LifeSkillsConfirmationSlip.jsx
import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

export default function LifeSkillsConfirmationSlip() {
  const [downloadError, setDownloadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [allocationConfirmed, setAllocationConfirmed] = useState(false);

  // Check if life skill allocation is confirmed
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lifeskillsStudent/allocation-details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllocationConfirmed(res.data.isConfirmed);
      } catch (err) {
        console.error("LifeSkills confirmation fetch error:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleDownload = async () => {
    setDownloadError("");
    setIsDownloading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/lifeskillsStudent/download-slip", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for PDF
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "LifeSkills_Allocation_Slip.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("LifeSkills slip download error:", err);
      setDownloadError(
        err.response?.data?.error ||
          "Failed to download slip. Allocation may not be confirmed."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="m-4 p-4 shadow-lg" style={{ borderRadius: "10px" }}>
      <h2 className="mb-4" style={{ color: "#00695C", fontFamily: "Georgia, serif" }}>
        🎓 Download Life Skills Confirmation Slip
      </h2>

      {downloadError && <Alert variant="danger">{downloadError}</Alert>}

      <p>
        Click the button below to download your official Life Skills allocation confirmation
        slip (PDF). Only available after allocation is confirmed.
      </p>

      <Button
        onClick={handleDownload}
        disabled={isDownloading || !allocationConfirmed}
        style={{
          backgroundColor: "#009688",
          borderColor: "#009688",
          fontWeight: "bold",
          letterSpacing: "0.5px",
        }}
      >
        {isDownloading ? (
          <Spinner animation="border" size="sm" className="me-2" />
        ) : (
          "Download Slip"
        )}
      </Button>

      {!allocationConfirmed && (
        <p className="mt-2 text-warning">
          Allocation not confirmed yet. Cannot download slip.
        </p>
      )}
    </Card>
  );
}
