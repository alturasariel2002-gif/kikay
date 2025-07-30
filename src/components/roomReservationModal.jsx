import React, { useState } from "react";
import Swal from "sweetalert2";
import RateRoomModal from "./rateRoomModal";

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

const RoomReservationDetail = ({
  booking,
  roomInfo,
  onClose,
  onReservationCancelled,
}) => {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  if (!booking || !roomInfo) return null;

  const handleCancelReservation = async () => {
    if (booking.status === "Cancelled") return;

    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this reservation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (!confirmed.isConfirmed) return;

    Swal.fire({
      title: "Cancelling Reservation...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(
        `http://localhost:5000/room-reservations/${booking.r_reservation_id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Cancelled",
          text: "Reservation has been successfully cancelled.",
        });
        onReservationCancelled();
        onClose(); // Automatically close the modal
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to cancel reservation.",
        });
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
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
        {/* Left Section: Room Information */}
        <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid #e0e0e0" }}>
          <h2 style={{ color: "#1e88e5", fontSize: "1.8rem" }}>{roomInfo.name}</h2>
          <div>
            <p style={{ fontWeight: "bold" }}>Room Number</p>
            <p>{roomInfo.roomNumber}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Room Type</p>
            <p>{roomInfo.roomType}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Description</p>
            <p>{roomInfo.description}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Price</p>
            <p>{formatToPeso(roomInfo.price)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Hourly Rate</p>
            <p>{roomInfo.hourlyRate}</p>
          </div>
          {booking.status === "Pending" && (
            <p
              style={{
                color: "#ff9800",
                fontWeight: "bold",
                marginTop: "3rem",
              }}
            >
              Please go to Casa Maria Molave for Half or Full Payment to confirm reservation.
            </p>
          )}
        </div>

        {/* Right Section: Reservation Details */}
        <div style={{ flex: 1, padding: "1rem" }}>
          <h3 style={{ color: "#333", fontSize: "1.5rem" }}>Reservation Details</h3>
          <div>
            <p style={{ fontWeight: "bold" }}>Check-in Date</p>
            <p>{formatDate(booking.check_in_date)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Check-out Date</p>
            <p>{formatDate(booking.check_out_date)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Check-in Time</p>
            <p>{formatTime(booking.check_in_time)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Check-out Time</p>
            <p>{formatTime(booking.check_out_time)}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Total Hours</p>
            <p>{booking.total_hours}</p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Status</p>
            <p style={{ color: getStatusColor(booking.status), fontWeight: "bold" }}>
              {booking.status}
            </p>
          </div>
          <div>
            <p style={{ fontWeight: "bold" }}>Additional Notes</p>
            <p>{booking.additional_notes || "No instructions added by the client."}</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
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
            {booking.status === "Rated" ? null : booking.status !== "Completed" && (
              <button
                style={{
                  marginLeft: "1rem",
                  padding: "0.7rem 1.2rem",
                  backgroundColor: booking.status === "Cancelled" ? "#e0e0e0" : "#e53935",
                  color: booking.status === "Cancelled" ? "#9e9e9e" : "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: booking.status === "Cancelled" ? "not-allowed" : "pointer",
                  transition: "background 0.3s ease",
                }}
                onClick={booking.status !== "Cancelled" ? handleCancelReservation : undefined}
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
        <RateRoomModal
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

export default RoomReservationDetail;
