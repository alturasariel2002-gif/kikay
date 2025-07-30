import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AddEditServiceModal from "../components/addEditServiceModal";
import axios from "axios";

function ManageServices() {
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching services, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get("http://localhost:5000/services");
      const sortedServices = response.data.sort(
        (a, b) => a.service_id - b.service_id
      );
      setServices(sortedServices);

      Swal.close();
    } catch (error) {
      Swal.fire("Error", "Failed to fetch services.", "error");
      console.error("Error fetching services:", error);
    }
  };

  const handleSave = async (serviceData) => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while the service is being saved.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (editingService) {
        await axios.put(
          `http://localhost:5000/services/${editingService.service_id}`,
          {
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            duration: serviceData.duration,
            images: serviceData.images,
          }
        );

        setServices((prevServices) =>
          prevServices.map((service) =>
            service.service_id === editingService.service_id
              ? {
                  ...service,
                  service_name: serviceData.name,
                  description: serviceData.description,
                  price: serviceData.price,
                  duration: serviceData.duration,
                  images: [...serviceData.images], 
                }
              : service
          )
        );
      } else {
        const response = await axios.post("http://localhost:5000/services", {
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          images: serviceData.images,
        });

        const newService = {
          service_id: response.data.insertId,
          service_name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          images: [...serviceData.images],
        };

        setServices((prevServices) => [...prevServices, newService]);
      }

      setModalOpen(false);
      setEditingService(null);

      Swal.fire("Success", "Service saved successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save the service.", "error");
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (serviceId) => {
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
            text: "Please wait while the service is being deleted.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await axios.delete(`http://localhost:5000/services/${serviceId}`);
          setServices((prevServices) =>
            prevServices.filter((service) => service.service_id !== serviceId)
          );

          Swal.fire("Deleted!", "The service has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete the service.", "error");
          console.error("Error deleting service:", error);
        }
      }
    });
  };

  const handleEdit = (service) => {
    setEditingService({
      service_id: service.service_id,
      name: service.service_name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      images: [...service.images],
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
          Manage Services
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
            setEditingService(null);
            setModalOpen(true);
          }}
        >
          Add Service
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
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.service_id}>
              <td style={tdStyle}>{service.service_id}</td>
              <td style={tdStyle}>{service.service_name}</td>
              <td style={tdStyle}>{service.description}</td>
              <td style={tdStyle}>
                {service.price
                  ? `${formatPrice(service.price)}${
                      service.duration ? ` / ${service.duration}` : ""
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
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...actionButtonStyle("#dc3545"), flex: 1 }}
                    onClick={() => handleDelete(service.service_id)}
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
        <AddEditServiceModal
          service={editingService}
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

export default ManageServices;
