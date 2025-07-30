import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaServicestack,
  FaDoorOpen,
  FaComments,
} from "react-icons/fa";
import AdminRoomReservationList from "../adminPages/roomReservationList";
import AdminServiceReservationList from "../adminPages/serviceReservationList";
import ManageServices from "../adminPages/manageServices";
import ManageRooms from "../adminPages/manageRooms";
import ClientFeedbacks from "../adminPages/clientFeedbacks";
import DashboardAnalytics from "../adminPages/dashboardAnalytics";

function Admin() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardAnalytics />;
      case "roomReservations":
        return <AdminRoomReservationList />;
      case "serviceReservations":
        return <AdminServiceReservationList />;
      case "services":
        return <ManageServices />;
      case "rooms":
        return <ManageRooms />;
      case "feedbacks":
        return <ClientFeedbacks />;
      default:
        return (
          <div>
            <h2>404 - View Not Found</h2>
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
        overflow: "hidden",
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
          style={getButtonStyle(activeView === "dashboard")}
          onClick={() => setActiveView("dashboard")}
        >
          <FaTachometerAlt /> Dashboard Analytics
        </button>

        <button
          style={getButtonStyle(activeView === "roomReservations")}
          onClick={() => setActiveView("roomReservations")}
        >
          <FaCalendarAlt /> Room Reservation List
        </button>

        <button
          style={getButtonStyle(activeView === "serviceReservations")}
          onClick={() => setActiveView("serviceReservations")}
        >
          <FaCalendarAlt /> Service Reservation List
        </button>

        <button
          style={getButtonStyle(activeView === "services")}
          onClick={() => setActiveView("services")}
        >
          <FaServicestack /> Manage Services
        </button>

        <button
          style={getButtonStyle(activeView === "rooms")}
          onClick={() => setActiveView("rooms")}
        >
          <FaDoorOpen /> Manage Rooms
        </button>

        <button
          style={getButtonStyle(activeView === "feedbacks")}
          onClick={() => setActiveView("feedbacks")}
        >
          <FaComments /> Client Feedbacks
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

export default Admin;
