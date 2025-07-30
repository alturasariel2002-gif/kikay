import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CancelRoomReservationModal from "../components/cancelRoomReservationModal";
import ViewRoomReservationModal from "../components/viewRoomReservationModal";

function AdminRoomReservationList() {
  const [reservations, setReservations] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchName, setSearchName] = useState(""); // New state for search
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        Swal.fire({
          title: "Loading Reservations...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await axios.get(
          "http://localhost:5000/admin/room-reservations"
        );
        setReservations(response.data);

        Swal.close();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to Load Reservations",
          text: "An error occurred while fetching reservations.",
        });
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    const updatedReservations = reservations.map((reservation) =>
      reservation.id === id
        ? { ...reservation, status: newStatus }
        : reservation
    );
    setReservations(updatedReservations);
  };

  const handleCancel = (id, reason) => {
    const updatedReservations = reservations.map((reservation) =>
      reservation.id === id
        ? { ...reservation, status: "Cancelled", reason }
        : reservation
    );
    setReservations(updatedReservations);
    setReservationToCancel(null);
    Swal.fire("Reservation Cancelled", `Reason: ${reason}`, "success");
  };

  const filteredReservations = reservations.filter(
    (reservation) =>
      (filterDate
        ? reservation.created_at.split("T")[0] === filterDate
        : true) &&
      (searchName
        ? reservation.user_full_name
            .toLowerCase()
            .includes(searchName.toLowerCase())
        : true)
  );

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#007bff",
          }}
        >
          Room Reservations
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={{ marginRight: "1.5rem" }}>
            <label
              htmlFor="searchName"
              style={{
                marginRight: "0.5rem",
                fontWeight: "bold",
                color: "#333",
                fontSize: "1rem",
              }}
            >
              Search by Name:
            </label>
            <input
              type="text"
              id="searchName"
              placeholder="Enter client name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{
                padding: "0.7rem",
                borderRadius: "5px",
                border: "1px solid #ddd",
                fontSize: "1rem",
                width: "400px", 
              }}
            />
          </div>
          <div>
            <label
              htmlFor="filterDate"
              style={{
                marginRight: "0.5rem",
                fontWeight: "bold",
                color: "#333",
                fontSize: "1rem",
              }}
            >
              Filter by Date:
            </label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: "0.7rem",
                borderRadius: "5px",
                border: "1px solid #ddd",
                fontSize: "1rem",
                width: "200px",
              }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                style={{
                  marginLeft: "1rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Room Type</th>
            <th style={thStyle}>Reservation Date</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <tr key={reservation.id}>
                <td style={tdStyle}>{reservation.id}</td>
                <td style={tdStyle}>{reservation.user_full_name}</td>
                <td style={tdStyle}>{reservation.room_type}</td>
                <td style={tdStyle}>
                  {new Date(reservation.created_at).toLocaleDateString()}
                </td>
                <td style={tdStyle}>
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
                          : reservation.status === "Cancelled"
                          ? "#dc3545"
                          : reservation.status === "Completed"
                          ? "#ffffff"
                          : "#fff",
                      backgroundColor:
                        reservation.status === "Confirmed"
                          ? "#e6f4ea"
                          : reservation.status === "Pending"
                          ? "#fff8e6"
                          : reservation.status === "Cancelled"
                          ? "#f8d7da"
                          : reservation.status === "Completed"
                          ? "#28a745"
                          : "#ddd",
                    }}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={{
                      ...actionButtonStyle("#007bff"),
                      flex: 1,
                      width: "100%",
                    }}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  fontSize: "1rem",
                  color: "#888",
                }}
              >
                No reservations found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <CancelRoomReservationModal
        reservation={reservationToCancel}
        onClose={() => setReservationToCancel(null)}
        onCancel={handleCancel}
      />
      <ViewRoomReservationModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

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

const actionButtonStyle = (backgroundColor) => ({
  padding: "0.5rem",
  fontSize: "0.85rem",
  fontWeight: "bold",
  color: "#fff",
  backgroundColor,
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
});

export default AdminRoomReservationList;
