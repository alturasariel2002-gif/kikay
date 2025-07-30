import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AddEditRoomModal from "../components/addEditRoomModal";
import axios from "axios";

function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching rooms, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get("http://localhost:5000/rooms");
      const sortedRooms = response.data.sort((a, b) => a.room_id - b.room_id);
      setRooms(sortedRooms);

      Swal.close();
    } catch (error) {
      Swal.fire("Error", "Failed to fetch rooms.", "error");
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSave = async (roomData) => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while the room is being saved.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (editingRoom) {
        await axios.put(`http://localhost:5000/rooms/${editingRoom.room_id}`, {
          name: roomData.name,
          number: roomData.roomNumber,
          type: roomData.roomType,
          description: roomData.description,
          price: roomData.price,
          hourlyRate: roomData.hourlyRate,
          images: roomData.images,
        });
      } else {
        await axios.post("http://localhost:5000/rooms", {
          name: roomData.name,
          number: roomData.roomNumber,
          type: roomData.roomType,
          description: roomData.description,
          price: roomData.price,
          hourlyRate: roomData.hourlyRate,
          images: roomData.images,
        });
      }

      await fetchRooms();

      setModalOpen(false);
      setEditingRoom(null);

      Swal.fire("Success", "Room saved successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save the room.", "error");
      console.error("Error saving room:", error);
    }
  };

  const handleDelete = async (roomId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while the room is being deleted.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await axios.delete(`http://localhost:5000/rooms/${roomId}`);
          await fetchRooms();

          Swal.fire("Deleted!", "The room has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete the room.", "error");
          console.error("Error deleting room:", error);
        }
      }
    });
  };

  const handleEdit = (room) => {
    setEditingRoom({
      room_id: room.room_id,
      name: room.room_name,
      roomNumber: room.room_number,
      description: room.description,
      price: room.price,
      roomType: room.room_type,
      hourlyRate: room.hourly_rate,
      images: room.images,
    });
    setModalOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("PHP", "₱");
  };

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
          Manage Rooms
        </h2>
        <button
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#28a745",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => {
            setEditingRoom(null);
            setModalOpen(true);
          }}
        >
          Add Room
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2rem",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Room Number</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.room_id}>
              <td style={tdStyle}>{room.room_id}</td>
              <td style={tdStyle}>{room.room_name}</td>
              <td style={tdStyle}>{room.room_number}</td>
              <td style={tdStyle}>{room.description}</td>
              <td style={tdStyle}>
                {room.price
                  ? `${formatPrice(room.price)}${
                      room.hourly_rate ? ` / ${room.hourly_rate}` : ""
                    }`
                  : "Not Specified"}
              </td>
              <td style={tdStyle}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <button
                    style={{ ...actionButtonStyle("#007bff"), flex: 1 }}
                    onClick={() => handleEdit(room)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...actionButtonStyle("#dc3545"), flex: 1 }}
                    onClick={() => handleDelete(room.room_id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <AddEditRoomModal
          room={editingRoom}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
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
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  backgroundColor: backgroundColor,
});

const addRoomButtonStyle = {
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  fontWeight: "bold",
  color: "#fff",
  backgroundColor: "#007bff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default ManageRooms;
