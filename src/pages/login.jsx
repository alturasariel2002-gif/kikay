import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(loadingToast, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        onLoginSuccess(data.user.userType, {
          userId: data.user.userId,
          first_name: data.user.firstName,
          last_name: data.user.lastName,
        });

      } else {
        setError(data.message);
        toast.update(loadingToast, {
          render: data.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
      toast.update(loadingToast, {
        render: "An error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
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
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.8)",
          borderRadius: "10px",
          padding: "2rem",
          textAlign: "center",
        }}
        onSubmit={handleSubmit}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "1rem",
            fontWeight: "bold",
            color: "#007bff",
          }}
        >
          Login
        </h2>
        {error && (
          <p
            style={{
              color: "red",
              fontSize: "0.9rem",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "93%",
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "93%",
              padding: "0.75rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Log In
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
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
          >
            Cancel
          </button>
        </div>
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.9rem" }}>
            Don’t have an account?{" "}
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
              onClick={onSwitchToRegister}
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
