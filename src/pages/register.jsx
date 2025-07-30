import { useState } from "react";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

function Register({ onClose }) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("09");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !street.trim() ||
      !barangay.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim() ||
      !phoneNumber.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      toast.error("All fields are required except Middle Name.");
      return;
    }

    if (!/^\d{4}$/.test(postalCode)) {
      toast.error("Please enter a valid postal code (4 digits).");
      return;
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      toast.error(
        "Please enter a valid Philippine phone number (11 digits starting with 09)."
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const loadingToast = toast.loading("Registering user...");

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          street,
          barangay,
          city,
          province,
          postalCode,
          phoneNumber,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(loadingToast, {
          render: "Registration successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onClose();
      } else {
        toast.update(loadingToast, {
          render: data.message || "Registration failed.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error registering user:", err);
      toast.update(loadingToast, {
        render: "Failed to register. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    if (input.startsWith("09")) {
      setPhoneNumber(input);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: "80vh",
        minHeight: "60vh",
        padding: "2rem",
      }}
    >
      <form
        style={{
          maxWidth: "800px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.8)",
          borderRadius: "10px",
          padding: "2rem",
          paddingTop: "1rem",
          textAlign: "center",
        }}
        onSubmit={handleSubmit}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "3rem",
            fontWeight: "bold",
            color: "#007bff",
          }}
        >
          Register
        </h2>

        {/* Name Fields */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Middle Name (Optional)"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Address Fields */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Contact and Password Fields */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Phone Number (09XXXXXXXXX)"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "5rem" }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            Register
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
