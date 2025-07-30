import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const RoomDetailsModal = ({ room, user, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    checkInTime: "",
    checkOutTime: "",
    notes: "",
  });
  const [totalHours, setTotalHours] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchUserData(user.userId);
    }
  }, [user]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      const { firstName, middleName, lastName, email, phoneNumber } =
        response.data;

      const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`;
      setFormData((prev) => ({
        ...prev,
        fullName,
        email,
        phone: phoneNumber,
      }));
    } catch (error) {
      Swal.fire("Error", "Failed to load user data. Please try again later.", "error");
    }
  };

  useEffect(() => {
    calculateTotalHours();
  }, [
    formData.checkInDate,
    formData.checkOutDate,
    formData.checkInTime,
    formData.checkOutTime,
  ]);

  const calculateTotalHours = () => {
    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      formData.checkInTime &&
      formData.checkOutTime
    ) {
      const checkIn = new Date(
        `${formData.checkInDate}T${formData.checkInTime}`
      );
      const checkOut = new Date(
        `${formData.checkOutDate}T${formData.checkOutTime}`
      );
      if (checkOut > checkIn) {
        const diffInMilliseconds = checkOut - checkIn;
        const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        setTotalHours(hours);
      } else {
        setTotalHours(null);
      }
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checkIn = new Date(`${formData.checkInDate}T${formData.checkInTime}`);
    const checkOut = new Date(
      `${formData.checkOutDate}T${formData.checkOutTime}`
    );

    if (checkOut <= checkIn) {
      Swal.fire(
        "Error",
        "Check-Out Date and Time must be later than Check-In Date and Time.",
        "error"
      );
      return;
    }

    const totalHoursCalculated = Math.floor(
      (checkOut - checkIn) / (1000 * 60 * 60)
    );

    const reservationData = {
      userId: user.userId,
      roomId: room.room_id,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      totalHours: totalHoursCalculated,
      additionalNotes: formData.notes || "No instructions added by the client.",
    };

    try {
      Swal.fire({
        title: "Processing...",
        text: "Saving your reservation. Please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        "http://localhost:5000/room-reservations",
        reservationData
      );

      Swal.fire("Success", response.data.message || "Reservation saved successfully!", "success");
      onClose();
    } catch (error) {
      Swal.fire("Error", "Failed to save room reservation. Please try again later.", "error");
    }
  };

  const images = room.images || [room.image];

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
          width: "1200px",
          padding: "2rem",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
          position: "relative",
          display: "flex",
          gap: "2rem",
        }}
      >
        {/* Close Button */}
        <button
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
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

        {/* Left Section - Room Details */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "500px",
              marginBottom: "1.5rem",
            }}
          >
            <img
              src={images[currentImageIndex]}
              alt={`${room.room_name} - ${currentImageIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    padding: "1rem",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  &#10094;
                </button>

                <button
                  onClick={handleNextImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    padding: "1rem",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  &#10095;
                </button>
              </>
            )}
          </div>

          <h3
            style={{
              color: "#1e88e5",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            {room.room_name}
          </h3>
          <p style={{ color: "#757575", marginBottom: "1rem" }}>
            {room.description}
          </p>
          <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            Price: ₱{room.price}
          </p>
          <p>
            Room Type: <strong>{room.room_type}</strong>
          </p>
          <p>
            Hourly Rate: <strong>{room.hourly_rate}</strong>
          </p>
        </div>

        {/* Right Section - Booking Form */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              color: "#1e88e5",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Book Your Room
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Input Fields */}
            <div style={{ marginBottom: "1rem" }}>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                disabled
                style={{
                  width: "96%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{
                  width: "96%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                disabled
                style={{
                  width: "96%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label>Check-In Date</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  required
                  style={{
                    width: "92%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Check-Out Date</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  required
                  style={{
                    width: "92%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label>Check-In Time</label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: "92%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Check-Out Time</label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: "92%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>
            {totalHours !== null && (
              <p
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#333",
                }}
              >
                Total Hours Checked In: {totalHours} hours
              </p>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="8"
                placeholder="Any special requests or instructions"
                style={{
                  width: "96%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  resize: "none",
                }}
              ></textarea>
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                type="submit"
                style={{
                  padding: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "50%",
                }}
              >
                Reserve Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
