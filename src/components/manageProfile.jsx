import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageProfile({ userId }) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: "",
    currentEmail: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState({
    initialLoad: true,
    personalInfo: false,
    address: false,
    loginCredentials: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [initialUserInfo, setInitialUserInfo] = useState({});

  // Fetch user data
  const fetchUserData = async () => {
    setIsLoading((prev) => ({ ...prev, initialLoad: true }));
    try {
      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      setUserInfo((prev) => ({
        ...prev,
        ...response.data,
        currentEmail: response.data.email,
      }));
      setInitialUserInfo(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Failed to load user data. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, initialLoad: false }));
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [id]: value }));
  };

  const isUnchanged = (key) => userInfo[key] === initialUserInfo[key];

  const setSuccessMessageWithTimeout = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Update personal information
  const handleUpdatePersonalInfo = async () => {
    setIsLoading((prev) => ({ ...prev, personalInfo: true }));
    setErrorMessage("");
    try {
      if (
        isUnchanged("firstName") &&
        isUnchanged("middleName") &&
        isUnchanged("lastName") &&
        isUnchanged("email") &&
        isUnchanged("phoneNumber")
      ) {
        setErrorMessage("No changes have been made.");
        return;
      }

      const payload = {
        firstName: userInfo.firstName,
        middleName: userInfo.middleName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      };

      const response = await axios.put(
        `http://localhost:5000/users/${userId}/personalInfo`,
        payload
      );

      setSuccessMessageWithTimeout(
        response.data.message || "Personal information updated successfully!"
      );
      await fetchUserData();
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Failed to update personal information. Please try again."
        );
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, personalInfo: false }));
    }
  };

  // Update address
  const handleUpdateAddress = async () => {
    setIsLoading((prev) => ({ ...prev, address: true }));
    setErrorMessage("");
    try {
      if (
        isUnchanged("street") &&
        isUnchanged("barangay") &&
        isUnchanged("city") &&
        isUnchanged("province") &&
        isUnchanged("postalCode")
      ) {
        setErrorMessage("No changes have been made.");
        return;
      }

      const payload = {
        street: userInfo.street,
        barangay: userInfo.barangay,
        city: userInfo.city,
        province: userInfo.province,
        postalCode: userInfo.postalCode,
      };

      const response = await axios.put(
        `http://localhost:5000/users/${userId}/address`,
        payload
      );

      setSuccessMessageWithTimeout(
        response.data.message || "Address updated successfully!"
      );
      await fetchUserData();
    } catch (error) {
      setErrorMessage("Failed to update address. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, address: false }));
    }
  };

  // Update login credentials
const handleUpdateLoginCredentials = async () => {
  setIsLoading((prev) => ({ ...prev, loginCredentials: true }));
  setErrorMessage("");
  try {
    const payload = {
      currentEmail: userInfo.currentEmail,
      oldPassword: userInfo.oldPassword,
      newPassword: userInfo.newPassword,
      confirmPassword: userInfo.confirmPassword,
    };

    const response = await axios.put(
      `http://localhost:5000/users/${userId}/loginCredentials`,
      payload
    );

    setSuccessMessageWithTimeout(
      response.data.message || "Login credentials updated successfully!"
    );

    clearLoginFields();
    await fetchUserData();
  } catch (error) {
    console.error(
      "Error in handleUpdateLoginCredentials:",
      error.response?.data || error.message
    );
    setErrorMessage(
      error.response?.data?.message || "Failed to update login credentials."
    );
  } finally {
    setIsLoading((prev) => ({ ...prev, loginCredentials: false }));
  }
};

const clearLoginFields = () => {
  setUserInfo((prev) => ({
    ...prev,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  }));
};

  const renderSpinner = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100px",
      }}
    >
      <div className="spinner" />
    </div>
  );

  const closeMessage = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  if (isLoading.initialLoad) {
    return renderSpinner();
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        boxSizing: "border-box",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {(successMessage || errorMessage) && (
        <div
          style={{
            backgroundColor: successMessage ? "#d4edda" : "#f8d7da",
            color: successMessage ? "#155724" : "#721c24",
            padding: "1rem",
            borderRadius: "5px",
            width: "100%",
            textAlign: "center",
            position: "relative",
          }}
        >
          {successMessage || errorMessage}
          <button
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "30px",
              height: "30px",
              backgroundColor: "maroon",
              border: "none",
              borderRadius: "50%",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#800000")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "maroon")}
            onClick={closeMessage}
          >
            &times;
          </button>
        </div>
      )}

      {/* Personal Information */}
      <div style={containerStyle}>
        <div style={headerStyle}>Personal Information</div>
        {isLoading.personalInfo ? (
          renderSpinner()
        ) : (
          <>
            {renderInput(
              "First Name",
              "firstName",
              userInfo.firstName,
              handleInputChange
            )}
            {renderInput(
              "Middle Name",
              "middleName",
              userInfo.middleName,
              handleInputChange
            )}
            {renderInput(
              "Last Name",
              "lastName",
              userInfo.lastName,
              handleInputChange
            )}
            {renderInput("Email", "email", userInfo.email, handleInputChange)}
            {renderInput(
              "Phone Number",
              "phoneNumber",
              userInfo.phoneNumber,
              handleInputChange
            )}
            {renderSaveButton(handleUpdatePersonalInfo, isLoading.personalInfo)}
          </>
        )}
      </div>

      {/* Address */}
      <div style={containerStyle}>
        <div style={headerStyle}>Address</div>
        {isLoading.address ? (
          renderSpinner()
        ) : (
          <>
            {renderInput(
              "Street",
              "street",
              userInfo.street,
              handleInputChange
            )}
            {renderInput(
              "Barangay",
              "barangay",
              userInfo.barangay,
              handleInputChange
            )}
            {renderInput("City", "city", userInfo.city, handleInputChange)}
            {renderInput(
              "Province",
              "province",
              userInfo.province,
              handleInputChange
            )}
            {renderInput(
              "Postal Code",
              "postalCode",
              userInfo.postalCode,
              handleInputChange
            )}
            {renderSaveButton(handleUpdateAddress, isLoading.address)}
          </>
        )}
      </div>

      {/* Login Credentials */}
      <div style={containerStyle}>
        <div style={headerStyle}>Login Credentials</div>
        {isLoading.loginCredentials ? (
          renderSpinner()
        ) : (
          <>
            {renderInput(
              "Current Email",
              "currentEmail",
              userInfo.currentEmail,
              handleInputChange,
              "text",
              true
            )}
            {renderInput(
              "Old Password",
              "oldPassword",
              userInfo.oldPassword,
              handleInputChange,
              "password"
            )}
            {renderInput(
              "New Password",
              "newPassword",
              userInfo.newPassword,
              handleInputChange,
              "password"
            )}
            {renderInput(
              "Confirm New Password",
              "confirmPassword",
              userInfo.confirmPassword,
              handleInputChange,
              "password"
            )}
            {renderSaveButton(
              handleUpdateLoginCredentials,
              isLoading.loginCredentials
            )}
          </>
        )}
      </div>
    </div>
  );
}

const clearLoginFields = () => {
  setUserInfo((prev) => ({
    ...prev,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  }));
};

const renderInput = (
  label,
  id,
  value,
  onChange,
  type = "text",
  disabled = false
) => (
  <div style={{ marginBottom: "1rem" }}>
    <label
      htmlFor={id}
      style={{
        display: "block",
        fontSize: "0.9rem",
        marginBottom: "0.5rem",
        fontWeight: "bold",
        color: "#333",
      }}
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "0.75rem",
        borderRadius: "5px",
        border: "1px solid #ddd",
        fontSize: "0.9rem",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
        backgroundColor: disabled ? "#f5f5f5" : "white",
        cursor: disabled ? "not-allowed" : "text",
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = disabled ? "#ddd" : "#007bff")
      }
      onBlur={(e) => (e.target.style.borderColor = "#ddd")}
    />
  </div>
);

const renderSaveButton = (onClick, isLoading) => (
  <div
    style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}
  >
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.5rem 1.5rem",
        fontSize: "0.9rem",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#28a745",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        opacity: isLoading ? 0.7 : 1,
        pointerEvents: isLoading ? "none" : "auto",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#218838")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#28a745")}
    >
      {isLoading ? "Saving..." : "Save Changes"}
    </button>
  </div>
);

const containerStyle = {
  flex: "1 1 calc(30% - 2rem)",
  minWidth: "300px",
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "8px",
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e0e0e0",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const headerStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  color: "#333",
  textAlign: "center",
};

const spinnerStyle = `
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = spinnerStyle;
  document.head.appendChild(styleTag);
}

export default ManageProfile;
