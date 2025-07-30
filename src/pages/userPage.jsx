import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaUserCircle,
  FaServicestack,
  FaDoorOpen,
  FaBed,
  FaConciergeBell,
} from "react-icons/fa";
import RoomReservationsView from "../userPages/roomReservationsView";
import ServiceReservationsView from "../userPages/serviceReservationsView";
import ExploreServices from "../userPages/exploreServices";
import ExploreRooms from "../userPages/exploreRooms";

function User({ user }) {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "yourRooms":
        return <RoomReservationsView user={user} />;
      case "yourServices":
        return <ServiceReservationsView user={user} />;
      case "exploreServices":
        return <ExploreServices user={user} />;
      case "exploreRooms":
        return <ExploreRooms user={user} />;
      default:
        return (
          <div>
            <h1>Welcome to Your Dashboard</h1>
            <p>
              Use the navigation on the left to view your bookings, manage your
              profile, or explore our services.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        height: "82vh",
        width: "100%",
      }}
    >
      {/* Sidebar Navigation */}
      <nav
        style={{
          width: "250px",
          backgroundColor: "#007bff",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem 1rem",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          style={getButtonStyle(activeView === "yourRooms")}
          onClick={() => setActiveView("yourRooms")}
        >
          <FaBed style={{ marginRight: "0.5rem" }} /> Room Reservations
        </button>

        <button
          style={getButtonStyle(activeView === "yourServices")}
          onClick={() => setActiveView("yourServices")}
        >
          <FaConciergeBell style={{ marginRight: "0.5rem" }} /> Service
          Reservations
        </button>

        <button
          style={getButtonStyle(activeView === "exploreServices")}
          onClick={() => setActiveView("exploreServices")}
        >
          <FaServicestack /> Explore Services
        </button>

        <button
          style={getButtonStyle(activeView === "exploreRooms")}
          onClick={() => setActiveView("exploreRooms")}
        >
          <FaDoorOpen /> Explore Rooms
        </button>
      </nav>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "2rem",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

const getButtonStyle = (isActive) => ({
  width: "100%",
  padding: "1rem",
  marginBottom: "1rem",
  backgroundColor: isActive ? "#0056b3" : "white",
  color: isActive ? "white" : "#007bff",
  border: "none",
  borderRadius: "5px",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  boxShadow: isActive ? "0 4px 6px rgba(0, 0, 0, 0.2)" : "none",
  textTransform: "capitalize",
});

export default User;
