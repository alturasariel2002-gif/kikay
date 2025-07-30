import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CancelServiceReservationModal from "./cancelServiceReservationModal";

function ViewServiceReservationModal({ reservation, onClose, onStatusUpdate }) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!reservation) return null;

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const formattedHour = (hour % 12 || 12).toString().padStart(2, "0");
    const period = hour >= 12 ? "PM" : "AM";
    return `${formattedHour}:${minute} ${period}`;
  };

  const handleConfirm = async () => {
    try {
      Swal.fire({
        title: "Confirming Reservation...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.put(
        `http://localhost:5000/admin/service-reservations/${reservation.id}/confirm`,
        { status: "Confirmed" }
      );

      Swal.fire({
        icon: "success",
        title: "Reservation Confirmed!",
        text: "The reservation status has been updated.",
      });

      onStatusUpdate(reservation.id, "Confirmed");
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Confirm",
        text: "An error occurred while confirming the reservation.",
      });
      console.error("Error confirming reservation:", error);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      Swal.fire({
        title: "Marking as Completed...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.put(
        `http://localhost:5000/admin/service-reservations/${reservation.id}/complete`,
        { status: "Completed" }
      );

      Swal.fire({
        icon: "success",
        title: "Reservation Completed!",
        text: "The reservation status has been updated.",
      });

      onStatusUpdate(reservation.id, "Completed");
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Update",
        text: "An error occurred while updating the reservation status.",
      });
      console.error("Error marking reservation as completed:", error);
    }
  };

  const handleCancelReservation = async (finalReason) => {
    try {
      Swal.fire({
        title: "Cancelling Reservation...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.put(
        `http://localhost:5000/admin/service-reservations/${reservation.id}/cancel`,
        { reason: finalReason }
      );

      Swal.fire({
        icon: "success",
        title: "Reservation Cancelled!",
        text: "The reservation has been cancelled.",
      });

      onStatusUpdate(reservation.id, "Cancelled");
      setShowCancelModal(false);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Cancel",
        text: "An error occurred while cancelling the reservation.",
      });
      console.error("Error cancelling reservation:", error);
    }
  };

  return (
    <>
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
            width: "850px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#555",
            }}
          >
            &times;
          </button>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            {/* Left Section: Reservation Information */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#007bff",
                  marginBottom: "1rem",
                }}
              >
                Reservation Information
              </h3>
              <p>
                <strong>Reservation ID:</strong> {reservation.id}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "5px",
                    color:
                      reservation.status === "Confirmed"
                        ? "#28a745"
                        : reservation.status === "Pending"
                        ? "#ffc107"
                        : "#fff",
                    backgroundColor:
                      reservation.status === "Confirmed"
                        ? "#e6f4ea"
                        : reservation.status === "Pending"
                        ? "#fff8e6"
                        : "#f8d7da",
                  }}
                >
                  {reservation.status}
                </span>
              </p>
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(reservation.start_date).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(reservation.end_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Start Time:</strong>{" "}
                {formatTime(reservation.start_time)}
              </p>
              <p>
                <strong>End Time:</strong> {formatTime(reservation.end_time)}
              </p>
              <p>
                <strong>Total Hours:</strong> {reservation.total_hours} hours
              </p>
            </div>

            {/* Vertical Line */}
            <div
              style={{
                width: "1px",
                backgroundColor: "#ddd",
                height: "auto",
              }}
            ></div>

            {/* Right Section: Service and User Information */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#007bff",
                  marginBottom: "1rem",
                }}
              >
                Service Information
              </h3>
              <p>
                <strong>Service Name:</strong> {reservation.service_name}
              </p>
              <p>
                <strong>Description:</strong> {reservation.service_description}
              </p>
              <p>
                <strong>Price:</strong> ₱
                {parseFloat(reservation.service_price).toLocaleString("en-PH")}
              </p>
              <p>
                <strong>Duration:</strong> {reservation.service_duration} hours
              </p>

              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#007bff",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                User Information
              </h3>
              <p>
                <strong>User Name:</strong> {reservation.user_full_name}
              </p>
              <p>
                <strong>Email:</strong> {reservation.user_email}
              </p>
              <p>
                <strong>Phone:</strong> {reservation.user_phone_number}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
              gap: "1rem",
            }}
          >
            {reservation.status === "Pending" && (
              <>
                <button
                  onClick={handleConfirm}
                  style={{
                    padding: "0.7rem 1.5rem",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Confirm Reservation
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    padding: "0.7rem 1.5rem",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel Reservation
                </button>
              </>
            )}
            {reservation.status === "Confirmed" && (
              <button
                onClick={handleMarkCompleted}
                style={{
                  padding: "0.7rem 1.5rem",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Service Reservation Modal */}
      {showCancelModal && (
        <CancelServiceReservationModal
          reservation={reservation}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelReservation}
        />
      )}
    </>
  );
}

export default ViewServiceReservationModal;
