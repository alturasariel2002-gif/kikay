import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function ClientFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterRating, setFilterRating] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      Swal.fire({
        title: "Loading Feedbacks...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const [roomResponse, serviceResponse] = await Promise.all([
          axios.get("http://localhost:5000/room-user-ratings"),
          axios.get("http://localhost:5000/service-user-ratings"),
        ]);

        const combinedFeedbacks = [
          ...roomResponse.data.map((feedback) => ({
            type: "Room", // Indicate it's a Room feedback
            clientName: feedback.user_name, // Use proper name field
            feedback: feedback.user_comment,
            rating: feedback.star_count,
            date: feedback.created_at.split("T")[0],
          })),
          ...serviceResponse.data.map((feedback) => ({
            type: "Service", // Indicate it's a Service feedback
            clientName: feedback.user_name, // Use proper name field
            feedback: feedback.user_comment,
            rating: feedback.star_count,
            date: feedback.created_at.split("T")[0],
          })),
        ];

        setFeedbacks(combinedFeedbacks);
        Swal.close(); // Close loading indicator
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to Load Feedbacks",
          text: "An error occurred while fetching feedback data.",
        });
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      (!filterRating || feedback.rating === parseInt(filterRating)) &&
      (!filterDate || feedback.date === filterDate)
  );

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Client Feedbacks</h2>

      {/* Filters */}
      <div style={filterContainerStyle}>
        <div>
          <label htmlFor="filterDate" style={labelStyle}>
            Filter by Date:
          </label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Feedback List */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Client Name</th>
            <th style={thStyle}>Feedback</th>
            <th style={thStyle}>Rating</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback, index) => (
              <tr key={index}>
                <td style={tdStyle}>{feedback.type}</td>
                <td style={tdStyle}>{feedback.clientName}</td>
                <td style={tdStyle}>{feedback.feedback}</td>
                <td style={tdStyle}>
                  <span style={starStyle}>
                    {Array.from({ length: 5 }, (_, index) =>
                      index < feedback.rating ? "★" : "☆"
                    ).join("")}
                  </span>
                </td>
                <td style={tdStyle}>{feedback.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={noDataStyle}>
                No feedbacks found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const containerStyle = {
  width: "100%",
  padding: "2rem",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
};

const headerStyle = {
  fontSize: "1.8rem",
  fontWeight: "bold",
  color: "#007bff",
  marginBottom: "1.5rem",
};

const filterContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "1.5rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "1rem",
  textAlign: "left",
  backgroundColor: "#007bff",
  color: "#fff",
  fontWeight: "bold",
  border: "1px solid #ddd",
  fontSize: "1rem",
};

const tdStyle = {
  padding: "1rem",
  textAlign: "left",
  border: "1px solid #ddd",
  fontSize: "0.95rem",
  color: "#333",
};

const starStyle = {
  color: "#FFD700",
  fontSize: "1.3rem",
  fontWeight: "bold",
};

const noDataStyle = {
  textAlign: "center",
  padding: "1rem",
  fontSize: "1rem",
  color: "#888",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "bold",
  color: "#333",
};

const inputStyle = {
  width: "200px",
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ddd",
  fontSize: "0.95rem",
};

const selectStyle = {
  width: "200px",
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ddd",
  fontSize: "0.95rem",
};

export default ClientFeedbacks;
