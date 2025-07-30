import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Image1 from "/Image - 1.jpg";
import Image2 from "/Image - 2.jpg";
import Image3 from "/Image - 3.jpg";
import Login from "../pages/login";
import Register from "../pages/register";
import Admin from "./adminPage";
import User from "./userPage";
import ManageProfile from "../components/manageProfile";

function HomePage() {
  const [view, setView] = useState("main");
  const [user, setUser] = useState(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const backgroundImages = [Image1, Image2, Image3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % backgroundImages.length
        );
        setIsTransitioning(false);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userType, userData) => {
    if (!userData.userId) {
      console.error("Error: userId is missing from login response");
      return;
    }

    setUser(userData);
    if (userType === "Admin") {
      setView("admin");
    } else if (userType === "User") {
      setView("user");
    }
  };

  const fetchUpdatedUserData = async () => {
    if (!user || !user.userId) {
      console.error("Cannot fetch user data. User ID is undefined.");
      return;
    }
  
    try {
      const response = await axios.get(
        `http://localhost:5000/users/${user.userId}`
      );
  
      const updatedUser = {
        ...response.data,
        first_name: response.data.firstName,
        last_name: response.data.lastName,   
        userId: user.userId,                 
      };
  
      setUser(updatedUser);
    } catch (error) {
      console.error("Error fetching updated user data:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView("main");
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        position: "relative",
        minHeight: "98vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Background Image Container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {backgroundImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Background ${index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 1s ease-in-out",
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <header
        style={{
          backgroundColor: "rgba(0, 123, 255, 0.8)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 1rem",
          height: "70px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/Casa-Maria-Logo.jpg"
            alt="Casa Maria Logo"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              marginRight: "1rem",
            }}
          />
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Casa Maria
          </div>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <FaUserCircle
              size={30}
              style={{ cursor: "pointer" }}
              onClick={() => setProfileModalOpen(true)}
              title="Manage Profile"
            />
            <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
              {user.first_name || "Unknown"} {user.last_name || "User"}
            </span>
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "white",
                color: "#007bff",
                border: "1px solid red",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Section */}
      <main
        style={{
          flex: 1,
          padding: "2rem 1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {view === "login" ? (
          <Login
            onClose={() => setView("main")}
            onSwitchToRegister={() => setView("register")}
            onLoginSuccess={(userType, userData) =>
              handleLoginSuccess(userType, userData)
            }
          />
        ) : view === "register" ? (
          <Register
            onClose={() => setView("main")}
            onSwitchToLogin={() => setView("login")}
          />
        ) : view === "admin" ? (
          <Admin />
        ) : view === "user" ? (
          <User user={user} />
        ) : (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              marginTop: "10%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.8)",
              borderRadius: "10px",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              Casa Maria Online Booking
            </h2>
            <p
              style={{ fontSize: "1rem", marginBottom: "2rem", color: "#555" }}
            >
              Book your needed services and reservations effortlessly.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() =>
                  window.open(
                    "https://casamariaheavenfeels.wordpress.com/",
                    "_blank"
                  )
                }
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
              >
                About Us
              </button>

              <button
                style={{
                  backgroundColor: "transparent",
                  color: "#007bff",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  border: "2px solid #007bff",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setView("login")}
                onMouseEnter={(e) => (
                  (e.target.style.backgroundColor = "#007bff"),
                  (e.target.style.color = "white")
                )}
                onMouseLeave={(e) => (
                  (e.target.style.backgroundColor = "transparent"),
                  (e.target.style.color = "#007bff")
                )}
              >
                Log In
              </button>
            </div>
          </div>
        )}
      </main>

      {isProfileModalOpen && user && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              width: "95%",
              maxWidth: "1100px",
              padding: "1rem",
              maxHeight: "90vh",
              overflowY: "auto",
              zIndex: 2001,
            }}
          >
            <ManageProfile
              userId={user.userId}
              onClose={() => {
                setProfileModalOpen(false);
                fetchUpdatedUserData(); 
              }}
            />
            <button
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                setProfileModalOpen(false); 
                fetchUpdatedUserData(); 
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
