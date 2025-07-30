import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ServiceDetailsModal from "../components/servicesModal";

function ExploreServices({ user }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {

    const fetchServices = async () => {
      Swal.fire({
        title: "Loading Services...",
        text: "Please wait while we fetch the data.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.get("http://localhost:5000/services");
        setServices(response.data);
        Swal.close();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load services. Please try again later.",
        });
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [user]);

  const handleViewDetails = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
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
      {services.map((service) => (
        <div
          key={service.service_id}
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
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
            src={service.images?.[0] || service.image}
            alt={service.service_name}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <div style={{ padding: "1rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#1e88e5",
              }}
            >
              {service.service_name}
            </h3>
            <p style={{ margin: "0.5rem 0", color: "#757575" }}>
              {service.description}
            </p>
            <p
              style={{ margin: "0.5rem 0", color: "#333", fontWeight: "bold" }}
            >
              Price: ₱{service.price}
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
              onClick={() => handleViewDetails(service)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}

      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          user={user}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default ExploreServices;
