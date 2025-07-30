import React, { useState } from "react";

const renderStars = (count, onClick) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          fontSize: "2rem",
          color: i <= count ? "#FFD700" : "#E0E0E0",
          cursor: "pointer",
        }}
        onClick={() => onClick(i)}
      >
        ★
      </span>
    );
  }
  return stars;
};

const RateRoomModal = ({ booking, onClose, onSubmit }) => {
  const [starCount, setStarCount] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (starCount === 0) {
      alert("Please select a star rating.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/room-reservations/${booking.r_reservation_id}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: booking.room_id,
            userId: booking.user_id,
            userComment: comment,
            starCount: starCount,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "Rating submitted successfully!");
        onSubmit();
      } else {
        alert(data.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("An error occurred while submitting your rating.");
    } finally {
      setLoading(false);
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
          width: "500px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "2rem",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#1e88e5" }}>
          Rate Your Stay
        </h2>

        {/* Star Rating */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          {renderStars(starCount, setStarCount)}
        </div>

        {/* Comment Section */}
        <textarea
          placeholder="Leave a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            borderRadius: "5px",
            padding: "0.5rem",
            border: "1px solid #ccc",
            marginBottom: "1.5rem",
            resize: "none",
          }}
        />

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.7rem 1.2rem",
              backgroundColor: "#e0e0e0",
              color: "#333",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.7rem 1.2rem",
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateRoomModal;
