import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ServiceReservationDetail from "../components/serviceReservationModal";

function ServiceReservationsView({ user }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchServiceReservations = async () => {
    if (!user?.userId) {
      console.error("No user ID provided");
      return;
    }

    Swal.fire({
      title: "Loading Reservations...",
      text: "Please wait while we fetch your reservations.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.get(
        `http://localhost:5000/service-reservations?userId=${user.userId}`
      );
      setBookings(response.data);
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load reservations. Please try again later.",
      });
      console.error("Error fetching service reservations:", error);
    }
  };

  useEffect(() => {
    fetchServiceReservations();
  }, [user]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel this reservation?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      });

      if (confirmed.isConfirmed) {
        Swal.fire({
          title: "Cancelling Reservation...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.put(
          `http://localhost:5000/service-reservations/${reservationId}/cancel`
        );

        Swal.fire({
          icon: "success",
          title: "Cancelled",
          text: "The reservation has been cancelled.",
        });

        fetchServiceReservations();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to cancel the reservation. Please try again later.",
      });
      console.error("Error cancelling reservation:", error);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the reservation.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it",
      });

      if (confirmed.isConfirmed) {
        Swal.fire({
          title: "Deleting Reservation...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.delete(
          `http://localhost:5000/service-reservations/${reservationId}`
        );

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "The reservation has been deleted.",
        });

        fetchServiceReservations();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the reservation. Please try again later.",
      });
      console.error("Error deleting reservation:", error);
    }
  };

  const closeModal = () => {
    setSelectedBooking(null);
    fetchServiceReservations();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      {bookings.map((booking, index) => (
        <div
          key={booking.s_reservation_id}
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            minHeight: "300px",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              height: "10px",
              width: "100%",
              backgroundColor: "#2c3e50",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          ></div>

          <div
            style={{
              padding: "1rem",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              borderBottom: "2px solid #e0e0e0",
              marginTop: "10px",
            }}
          >
            <h3
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#1e88e5",
              }}
            >
              {`Service Reservation #${index + 1}`}
            </h3>
            <p style={{ margin: "0.5rem 0", color: "#757575" }}>
              Start Date: {formatDate(booking.start_date)} -{" "}
              {formatTime(booking.start_time)}
            </p>
            <p style={{ margin: "0.5rem 0", color: "#757575" }}>
              End Date: {formatDate(booking.end_date)} -{" "}
              {formatTime(booking.end_time)}
            </p>
            <p style={{ margin: "0.5rem 0", color: "#757575" }}>
              Status:{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    booking.status === "Confirmed"
                      ? "#4caf50"
                      : booking.status === "Pending"
                      ? "#ff9800"
                      : booking.status === "Completed"
                      ? "#1e88e5"
                      : booking.status === "Cancelled"
                      ? "#e53935"
                      : booking.status === "Rated"
                      ? "#9c27b0"
                      : "#757575",
                }}
              >
                {booking.status}
              </span>
            </p>
          </div>

          <div
            style={{
              padding: "0.5rem",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <button
              style={{
                flex: 1,
                padding: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "#fff",
                backgroundColor: "#1e88e5",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => handleViewDetails(booking)}
            >
              View
            </button>
            {(booking.status === "Completed" || booking.status === "Rated" || booking.status === "Cancelled") ? null : (
              <button
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#e53935",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onClick={() =>
                  handleCancelReservation(booking.s_reservation_id)
                }
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}

      {selectedBooking && (
        <ServiceReservationDetail
          booking={selectedBooking}
          onClose={closeModal}
          onReservationCancelled={() =>
            handleCancelReservation(selectedBooking.s_reservation_id)
          }
        />
      )}
    </div>
  );
}

export default ServiceReservationsView;
