import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RoomDetailsModal from "../components/roomsModal";

function ExploreRooms({ user }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      Swal.fire({
        title: "Loading Rooms...",
        text: "Please wait while we fetch the data.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.get("http://localhost:5000/rooms"); 
        setRooms(response.data);
        Swal.close(); 
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load rooms. Please try again later.",
        });
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, [user]);

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem",
        boxSizing: "border-box",
        backgroundColor: "#f8f9fa",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem",
        justifyContent: "center",
      }}
    >
      {rooms.map((room) => (
        <div
          key={room.room_id}
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "350px",
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
          <img
            src={room.images?.[0] || "https://via.placeholder.com/150"} 
            alt={room.room_name}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <div style={{ padding: "1rem", flexGrow: 1 }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#1e88e5",
                marginBottom: "0.5rem",
              }}
            >
              {room.room_name}
            </h3>
            <p
              style={{
                margin: "0.5rem 0",
                color: "#757575",
                flexGrow: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3, 
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {room.description}
            </p>
            <p
              style={{
                margin: "0.5rem 0",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Price: ₱{room.price}
            </p>
          </div>
          <div
            style={{
              padding: "0.5rem",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "#fff",
                backgroundColor: "#1e88e5",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#1565c0")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#1e88e5")
              }
              onClick={() => handleViewDetails(room)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}

      {selectedRoom && (
        <RoomDetailsModal room={selectedRoom} user={user} onClose={closeModal} />
      )}
    </div>
  );
}

export default ExploreRooms;
