import React, { useState } from "react";

function AddEditServiceModal({ service, onClose, onSave }) {
  const [serviceData, setServiceData] = useState(() => ({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || "",
    duration: service?.duration || "",
    images: service?.images || [],
  }));

  const durations = ["4 hours", "8 hours", "12 hours", "18 hours"];

  const handleAddImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setServiceData((prev) => ({
        ...prev,
        images: [...prev.images, base64String],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = serviceData.images.filter((_, i) => i !== index);
    setServiceData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleSubmit = () => {
    if (
      !serviceData.name ||
      !serviceData.description ||
      !serviceData.price ||
      !serviceData.duration
    ) {
      alert("All fields are required.");
      return;
    }
  
    if (serviceData.images.length === 0) {
      alert("You must upload at least one image.");
      return;
    }
  
    onSave(serviceData);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalContainerStyle}>
        <div style={formContainerStyle}>
          <h3 style={headerStyle}>
            {service ? "Edit Service" : "Add New Service"}
          </h3>
          <div style={formFieldsContainerStyle}>
            <div>
              <label style={labelStyle}>Name:</label>
              <input
                type="text"
                value={serviceData.name}
                onChange={(e) =>
                  setServiceData((prev) => ({ ...prev, name: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Description:</label>
              <textarea
                value={serviceData.description}
                onChange={(e) =>
                  setServiceData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{ ...inputStyle, height: "100px", resize: "none" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Price:</label>
              <input
                type="text"
                value={serviceData.price}
                onChange={(e) =>
                  setServiceData((prev) => ({
                    ...prev,
                    price: e.target.value.replace(/[^0-9.]/g, ""), 
                  }))
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Duration:</label>
              <select
                value={serviceData.duration}
                onChange={(e) =>
                  setServiceData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                style={selectionInputStyle}
              >
                <option value="">Select Duration</option>
                {durations.map((duration, index) => (
                  <option key={index} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={actionButtonsContainerStyle}>
            <button onClick={handleSubmit} style={actionButtonStyle("#007bff")}>
              Save
            </button>
            <button onClick={onClose} style={actionButtonStyle("#6c757d")}>
              Cancel
            </button>
          </div>
        </div>
        <div style={verticalSeparator}></div>
        <div style={imageContainerStyle}>
          <label style={labelStyle}>Images:</label>
          <div style={imageListStyle}>
            {serviceData.images.map((image, index) => (
              <div key={index} style={imagePreviewStyle(image)}>
                <button
                  onClick={() => handleRemoveImage(index)}
                  style={removeButtonStyle}
                >
                  ×
                </button>
              </div>
            ))}
            <label style={addImageButtonStyle}>
              +
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAddImage(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContainerStyle = {
  width: "800px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "2rem",
  display: "flex",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const formContainerStyle = {
  flex: 2,
  paddingRight: "1rem",
};

const headerStyle = {
  marginBottom: "1rem",
  fontSize: "1.5rem",
  color: "#007bff",
};

const formFieldsContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "bold",
  color: "#333",
};

const inputStyle = {
  width: "96%",
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ddd",
  fontSize: "0.95rem",
};

const selectionInputStyle = {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
  };

const actionButtonsContainerStyle = {
  marginTop: "1rem",
  display: "flex",
  justifyContent: "space-between",
};

const actionButtonStyle = (backgroundColor) => ({
  padding: "0.5rem 1rem",
  fontSize: "0.85rem",
  fontWeight: "bold",
  color: "#fff",
  backgroundColor,
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
});

const verticalSeparator = {
  width: "1px",
  backgroundColor: "#ddd",
  margin: "0 1rem",
};

const imageContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const imageListStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
};

const imagePreviewStyle = (image) => ({
  width: "100px",
  height: "100px",
  backgroundImage: `url(${image})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
});

const removeButtonStyle = {
  position: "absolute",
  top: "-5px",
  right: "-5px",
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  width: "20px",
  height: "20px",
  fontSize: "12px",
};

const addImageButtonStyle = {
  width: "100px",
  height: "100px",
  backgroundColor: "#f8d7da",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  color: "#dc3545",
  fontWeight: "bold",
  fontSize: "12px",
};

export default AddEditServiceModal;
