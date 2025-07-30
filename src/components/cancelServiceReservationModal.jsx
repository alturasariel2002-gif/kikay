import React, { useState } from "react";

function CancelServiceReservationModal({ reservation, onClose, onCancel }) {
  const [reason, setReason] = useState(""); 
  const [customReason, setCustomReason] = useState(""); 

  const handleCancel = () => {
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason) {
      alert("Please select or enter a reason for cancellation.");
      return;
    }
    onCancel(finalReason);
  };

  if (!reservation) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "400px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#dc3545",
            marginBottom: "1rem",
          }}
        >
          Cancel Service Reservation
        </h3>
        <p style={{ marginBottom: "1rem" }}>
          <strong>Reservation ID:</strong> {reservation.id}
        </p>
        <label
          htmlFor="reason"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Select Reason:
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ddd",
            marginBottom: reason === "Other" ? "1rem" : "1.5rem",
          }}
        >
          <option value="">-- Select Reason --</option>
          <option value="Fully Booked">Fully Booked</option>
          <option value="User Request">User Request</option>
          <option value="Service No Longer Needed">Service No Longer Needed</option>
          <option value="Other">Other</option>
        </select>
        {reason === "Other" && (
          <div>
            <label
              htmlFor="customReason"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Please Enter Reason:
            </label>
            <textarea
              id="customReason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows="4"
              style={{
                width: "96%",
                padding: "0.5rem",
                borderRadius: "5px",
                border: "1px solid #ddd",
                resize: "none",
                marginBottom: "1.5rem",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "48%",
            }}
          >
            Confirm Cancellation
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "48%",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelServiceReservationModal;
