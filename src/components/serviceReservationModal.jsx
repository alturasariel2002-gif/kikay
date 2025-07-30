import React, { useState } from "react";
import Swal from "sweetalert2";
import RateServiceModal from "./rateServiceModal";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatToPeso = (amount) =>
  `₱${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "#4caf50";
    case "pending":
      return "#ff9800";
    case "cancelled":
      return "#e53935";
    case "completed":
      return "#1e88e5";
    case "rated":
      return "#9c27b0";
    default:
      return "#757575";
  }
};

const ServiceReservationDetail = ({
  booking,
  onClose,
  onReservationCancelled,
}) => {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  if (!booking) return null;

  const handleCancelReservation = async () => {
    if (booking.status === "Cancelled") return;

    try {
      await onReservationCancelled();
      Swal.fire({
        icon: "success",
        title: "Cancelled",
        text: "Reservation has been cancelled successfully!",
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while cancelling the reservation.",
      });
    }
  };

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
          width: "800px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "1.5rem",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          display: "flex",
          gap: "1.5rem",
          position: "relative",
        }}
      >
        {/* Left Section: Service Information */}
        <div
          style={{
            flex: 1,
            padding: "1rem",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          <h2 style={{ color: "#1e88e5", fontSize: "1.8rem" }}>
            Service Information
          </h2>
          <div>
            <p style={{ fontWeight: "bold" }}>Service Name</p>
            <p>{booking.service_name}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Service Description</p>
            <p>{booking.service_description}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Price</p>
            <p>{formatToPeso(booking.service_price)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Duration</p>
            <p>{booking.service_duration}</p>
          </div>
          {booking.status === "Pending" && (
            <p
              style={{
                color: "#ff9800",
                fontWeight: "bold",
                marginTop: "3rem",
              }}
            >
              Please go to Casa Maria Molave for Half or Full Payment to confirm
              reservation.
            </p>
          )}
        </div>

        {/* Right Section: Reservation Details */}
        <div style={{ flex: 1, padding: "1rem" }}>
          <h3 style={{ color: "#333", fontSize: "1.5rem" }}>
            Reservation Details
          </h3>
          <div>
            <p style={{ fontWeight: "bold" }}>Start Date</p>
            <p>{formatDate(booking.start_date)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>End Date</p>
            <p>{formatDate(booking.end_date)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Start Time</p>
            <p>{formatTime(booking.start_time)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>End Time</p>
            <p>{formatTime(booking.end_time)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Total Hours</p>
            <p>{booking.total_hours}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Status</p>
            <p
              style={{
                color: getStatusColor(booking.status),
                fontWeight: "bold",
              }}
            >
              {booking.status}
            </p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Additional Notes</p>
            <p>{booking.additional_notes || "No additional notes provided."}</p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            {booking.status === "Completed" && (
              <button
                style={{
                  padding: "0.7rem 1.2rem",
                  backgroundColor: "#1e88e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
                onClick={() => setRatingModalOpen(true)}
              >
                Rate Reservation
              </button>
            )}
            {booking.status !== "Completed" && booking.status !== "Rated" && (
              <button
                style={{
                  marginLeft: "1rem",
                  padding: "0.7rem 1.2rem",
                  backgroundColor:
                    booking.status === "Cancelled" ? "#e0e0e0" : "#e53935",
                  color: booking.status === "Cancelled" ? "#9e9e9e" : "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor:
                    booking.status === "Cancelled" ? "not-allowed" : "pointer",
                  transition: "background 0.3s ease",
                }}
                onClick={
                  booking.status !== "Cancelled"
                    ? handleCancelReservation
                    : undefined
                }
                disabled={booking.status === "Cancelled"}
              >
                Cancel Reservation
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            color: "#e53935",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Rating Modal */}
      {ratingModalOpen && (
        <RateServiceModal
          booking={booking}
          onClose={() => setRatingModalOpen(false)}
          onSubmit={() => {
            setRatingModalOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default ServiceReservationDetail;
