require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// MYSQL CONNECTION POOL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// TEST CONNECTION
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to database.");
    connectionn.release();
  }
});

// PROMISE-BASED QUERIES
const dbPromise = db.promise();

// REGISTRATION
app.post("/register", async (req, res) => {
  const {
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
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !street ||
    !barangay ||
    !city ||
    !province ||
    !postalCode ||
    !phoneNumber ||
    !email ||
    !password
  ) {
    return res.status(400).json({
      message: "All fields are required except Middle Name.",
    });
  }

  if (!/^09\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({
      message:
        "Please enter a valid Philippine phone number (11 digits starting with 09).",
    });
  }

  if (!/^\d{4}$/.test(postalCode)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid postal code (4 digits)." });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  }

  let connection;
  try {
    connection = await dbPromise.getConnection();

    const [duplicates] = await connection.query(
      "SELECT * FROM users WHERE email = ? OR phone_number = ?",
      [email, phoneNumber]
    );

    if (duplicates.length > 0) {
      const duplicateField =
        duplicates[0].email === email ? "Email" : "Phone number";
      return res
        .status(409)
        .json({ message: `${duplicateField} is already in use.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `
      INSERT INTO users (first_name, middle_name, last_name, phone_number, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [firstName, middleName, lastName, phoneNumber, email, hashedPassword]
    );

    const userId = userResult.insertId;

    await connection.query(
      `
      INSERT INTO user_address (user_id, street, barangay, city, province, postal_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [userId, street, barangay, city, province, postalCode]
    );

    await connection.commit();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    if (connection) await connection.rollback(); 
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    if (connection) connection.release(); 
  }
});


// LOGIN ENDPOINT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Both email and password are required." });
  }

  try {
    const userQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res
          .status(500)
          .json({ message: "An error occurred while checking user data." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      res.status(200).json({
        message: "Login successful!",
        user: {
          userId: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          userType: user.user_type,
        },
      });
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

// GET ALL ROOMS
app.get("/rooms", (req, res) => {
  const query = `
    SELECT r.room_id, r.room_name, r.room_number, r.room_type, 
           r.description, r.price, r.hourly_rate, 
           ri.image AS image_blob
    FROM rooms r
    LEFT JOIN room_images ri ON r.room_id = ri.room_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).json({ message: "Failed to fetch rooms." });
    }

    const rooms = results.reduce((acc, room) => {
      const base64Image = room.image_blob
        ? `data:image/jpeg;base64,${Buffer.from(room.image_blob).toString(
            "base64"
          )}`
        : null;

      const existingRoom = acc.find((r) => r.room_id === room.room_id);

      if (existingRoom) {
        if (base64Image) {
          existingRoom.images.push(base64Image);
        }
      } else {
        acc.push({
          room_id: room.room_id,
          room_name: room.room_name,
          room_number: room.room_number,
          room_type: room.room_type,
          description: room.description,
          price: room.price,
          hourly_rate: room.hourly_rate,
          images: base64Image ? [base64Image] : [],
        });
      }

      return acc;
    }, []);

    res.status(200).json(rooms);
  });
});

// ADD NEW ROOM
app.post("/rooms", (req, res) => {
  const { name, number, type, description, price, hourlyRate, images } =
    req.body;

  if (!name || !number || !type || !description || !price || !hourlyRate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const roomQuery = `
    INSERT INTO rooms (room_name, room_number, room_type, description, price, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    roomQuery,
    [name, number, type, description, price, hourlyRate],
    (err, result) => {
      if (err) {
        console.error("Error adding room:", err);
        return res.status(500).json({ message: "Failed to add room." });
      }

      const roomId = result.insertId;
      if (images && images.length > 0) {
        const imageQuery = `
          INSERT INTO room_images (room_id, image)
          VALUES ?
        `;
        const imageValues = images.map((img) => {
          const base64Data = img.split(",")[1]; // Remove the data URI prefix
          return [roomId, Buffer.from(base64Data, "base64")];
        });
        db.query(imageQuery, [imageValues], (err) => {
          if (err) {
            console.error("Error adding room images:", err);
            return res
              .status(500)
              .json({ message: "Failed to add room images." });
          }
        });
      }

      res
        .status(201)
        .json({ message: "Room added successfully!", insertId: roomId });
    }
  );
});

// EDIT ROOM
app.put("/rooms/:id", (req, res) => {
  const roomId = req.params.id;
  const { name, number, type, description, price, hourlyRate, images } =
    req.body;

  if (!name || !number || !type || !description || !price || !hourlyRate) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const updateQuery = `
    UPDATE rooms 
    SET room_name = ?, room_number = ?, room_type = ?, description = ?, price = ?, hourly_rate = ?
    WHERE room_id = ?
  `;

  db.query(
    updateQuery,
    [name, number, type, description, price, hourlyRate, roomId],
    (err) => {
      if (err) {
        console.error("Error updating room:", err);
        return res.status(500).json({ message: "Failed to update room." });
      }

      const deleteImagesQuery = `DELETE FROM room_images WHERE room_id = ?`;
      db.query(deleteImagesQuery, [roomId], (err) => {
        if (err) {
          console.error("Error deleting room images:", err);
          return res
            .status(500)
            .json({ message: "Failed to update room images." });
        }

        if (images && images.length > 0) {
          const imageQuery = `
            INSERT INTO room_images (room_id, image)
            VALUES ?
          `;
          const imageValues = images.map((img) => {
            const base64Data = img.split(",")[1];
            return [roomId, Buffer.from(base64Data, "base64")];
          });
          db.query(imageQuery, [imageValues], (err) => {
            if (err) {
              console.error("Error updating room images:", err);
              return res
                .status(500)
                .json({ message: "Failed to update room images." });
            }
          });
        }

        res.status(200).json({ message: "Room updated successfully!" });
      });
    }
  );
});

// DELETE ROOM
app.delete("/rooms/:id", (req, res) => {
  const roomId = req.params.id;

  const deleteImagesQuery = `DELETE FROM room_images WHERE room_id = ?`;
  db.query(deleteImagesQuery, [roomId], (err) => {
    if (err) {
      console.error("Error deleting room images:", err);
      return res.status(500).json({ message: "Failed to delete room images." });
    }

    const deleteRoomQuery = `DELETE FROM rooms WHERE room_id = ?`;
    db.query(deleteRoomQuery, [roomId], (err) => {
      if (err) {
        console.error("Error deleting room:", err);
        return res.status(500).json({ message: "Failed to delete room." });
      }

      res.status(200).json({ message: "Room deleted successfully!" });
    });
  });
});

// GET ALL SERVICES
app.get("/services", (req, res) => {
  const query = `
    SELECT s.service_id, s.service_name, s.description, s.price, s.duration,
           si.image AS image_blob
    FROM services s
    LEFT JOIN service_images si ON s.service_id = si.service_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching services:", err);
      return res.status(500).json({ message: "Failed to fetch services." });
    }

    const services = results.reduce((acc, service) => {
      const base64Image = service.image_blob
        ? `data:image/jpeg;base64,${Buffer.from(service.image_blob).toString(
            "base64"
          )}`
        : null;

      const existingService = acc.find(
        (s) => s.service_id === service.service_id
      );

      if (existingService) {
        if (base64Image) {
          existingService.images.push(base64Image);
        }
      } else {
        acc.push({
          service_id: service.service_id,
          service_name: service.service_name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          images: base64Image ? [base64Image] : [],
        });
      }

      return acc;
    }, []);

    res.status(200).json(services);
  });
});

// ADD NEW SERVICE
app.post("/services", async (req, res) => {
  const { name, description, price, duration, images } = req.body;

  if (!name || !description || !price || !duration) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let connection;
  try {
    connection = await db.promise().getConnection(); // Use promise-based API
    await connection.beginTransaction();

    // Insert service details
    const [result] = await connection.query(
      `INSERT INTO services (service_name, description, price, duration) VALUES (?, ?, ?, ?)`,
      [name, description, price, duration]
    );
    const serviceId = result.insertId;

    // Insert service images if provided
    if (images && images.length > 0) {
      const imageValues = images.map((img) => {
        const base64Data = img.split(",")[1]; // Extract base64 content
        return [serviceId, Buffer.from(base64Data, "base64")];
      });

      await connection.query(
        `INSERT INTO service_images (service_id, image) VALUES ?`,
        [imageValues]
      );
    }

    await connection.commit(); // Commit the transaction
    res.status(201).json({ message: "Service added successfully!", insertId: serviceId });
  } catch (err) {
    if (connection) await connection.rollback(); // Rollback the transaction on error
    console.error("Error adding service:", err);
    res.status(500).json({ message: "Failed to add service." });
  } finally {
    if (connection) connection.release(); // Release the connection
  }
});


// EDIT SERVICE
app.put("/services/:id", (req, res) => {
  const serviceId = req.params.id;
  const { name, description, price, duration, images } = req.body;

  if (!name || !description || !price || !duration) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const updateQuery = `
    UPDATE services 
    SET service_name = ?, description = ?, price = ?, duration = ?
    WHERE service_id = ?
  `;

  db.query(
    updateQuery,
    [name, description, price, duration, serviceId],
    (err) => {
      if (err) {
        console.error("Error updating service:", err);
        return res.status(500).json({ message: "Failed to update service." });
      }

      const deleteImagesQuery = `DELETE FROM service_images WHERE service_id = ?`;
      db.query(deleteImagesQuery, [serviceId], (err) => {
        if (err) {
          console.error("Error deleting service images:", err);
          return res
            .status(500)
            .json({ message: "Failed to update service images." });
        }

        if (images && images.length > 0) {
          const imageQuery = `
          INSERT INTO service_images (service_id, image)
          VALUES ?
        `;
          const imageValues = images.map((img) => {
            const base64Data = img.split(",")[1];
            return [serviceId, Buffer.from(base64Data, "base64")];
          });
          db.query(imageQuery, [imageValues], (err) => {
            if (err) {
              console.error("Error updating service images:", err);
              return res
                .status(500)
                .json({ message: "Failed to update service images." });
            }
          });
        }

        res.status(200).json({ message: "Service updated successfully!" });
      });
    }
  );
});

// DELETE SERVICE
app.delete("/services/:id", (req, res) => {
  const serviceId = req.params.id;

  const deleteImagesQuery = `DELETE FROM service_images WHERE service_id = ?`;
  db.query(deleteImagesQuery, [serviceId], (err) => {
    if (err) {
      console.error("Error deleting service images:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete service images." });
    }

    const deleteServiceQuery = `DELETE FROM services WHERE service_id = ?`;
    db.query(deleteServiceQuery, [serviceId], (err) => {
      if (err) {
        console.error("Error deleting service:", err);
        return res.status(500).json({ message: "Failed to delete service." });
      }

      res.status(200).json({ message: "Service deleted successfully!" });
    });
  });
});

// GET USER DATA
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT u.first_name AS firstName, u.middle_name AS middleName, u.last_name AS lastName,
           u.email, u.phone_number AS phoneNumber,
           a.street, a.barangay, a.city, a.province, a.postal_code AS postalCode
    FROM users u
    JOIN user_address a ON u.user_id = a.user_id
    WHERE u.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ message: "Failed to fetch user data." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results[0]);
  });
});

// PERSONAL INFO UPDATE
app.put("/users/:id/personalInfo", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { firstName, middleName, lastName, email, phoneNumber } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  if (!firstName || !lastName || !email || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const duplicateCheckQuery = `
      SELECT user_id FROM users WHERE (email = ? OR phone_number = ?) AND user_id != ?
    `;
    const [duplicates] = await db
      .promise()
      .query(duplicateCheckQuery, [email, phoneNumber, userId]);

    if (duplicates.length > 0) {
      const duplicateField =
        duplicates[0].email === email ? "Email" : "Phone number";
      return res.status(409).json({
        message: `${duplicateField} is already in use by another user.`,
      });
    }

    const updateQuery = `
      UPDATE users
      SET first_name = ?, middle_name = ?, last_name = ?, email = ?, phone_number = ?
      WHERE user_id = ?
    `;
    const [result] = await db
      .promise()
      .query(updateQuery, [
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        userId,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Personal info updated successfully!" });
  } catch (err) {
    console.error("Error updating personal info:", err);
    res.status(500).json({ message: "Failed to update personal info." });
  }
});

// ADDRESS UPDATE
app.put("/users/:id/address", (req, res) => {
  const userId = req.params.id;
  const { street, barangay, city, province, postalCode } = req.body;

  const query = `
    UPDATE user_address
    SET street = ?, barangay = ?, city = ?, province = ?, postal_code = ?
    WHERE user_id = ?
  `;

  db.query(
    query,
    [street, barangay, city, province, postalCode, userId],
    (err) => {
      if (err) {
        console.error("Error updating address:", err);
        return res.status(500).json({ message: "Failed to update address." });
      }

      res.status(200).json({ message: "Address updated successfully!" });
    }
  );
});

// LOGIN CREDENTIALS UPDATE
app.put("/users/:id/loginCredentials", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { currentEmail, oldPassword, newPassword, confirmPassword } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  if (!currentEmail || !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
  }

  try {
    const query = `SELECT email, password FROM users WHERE user_id = ?`;
    const [user] = await db.promise().query(query, [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const dbEmail = user[0].email;
    const dbPassword = user[0].password;

    if (dbEmail !== currentEmail) {
      return res
        .status(400)
        .json({ message: "Current email does not match our records." });
    }

    const isMatch = await bcrypt.compare(oldPassword, dbPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Old password is incorrect. Please try again." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `UPDATE users SET email = ?, password = ? WHERE user_id = ?`;
    const [updateResult] = await db
      .promise()
      .query(updateQuery, [currentEmail, hashedPassword, userId]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Failed to update login credentials. User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login credentials updated successfully!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "An internal error occurred. Please try again later." });
  }
});

// ADD SERVICE RESERVATION
app.post("/service-reservations", async (req, res) => {
  const {
    userId,
    serviceId,
    fullName,
    email,
    phone,
    startDate,
    endDate,
    startTime,
    endTime,
    totalHours,
    additionalNotes,
  } = req.body;

  if (
    !userId ||
    !serviceId ||
    !fullName ||
    !email ||
    !phone ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime ||
    totalHours === null
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required except Additional Notes." });
  }

  const query = `
    INSERT INTO service_reservation 
    (user_id, service_id, full_name, email, phone, start_date, end_date, start_time, end_time, total_hours, status, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await dbPromise.query(query, [
      userId,
      serviceId,
      fullName,
      email,
      phone,
      startDate,
      endDate,
      startTime,
      endTime,
      totalHours,
      "Pending",
      additionalNotes || "No instructions added by the client.",
    ]);

    res
      .status(201)
      .json({ message: "Service reservation saved successfully!" });
  } catch (error) {
    console.error("Error saving service reservation:", error);
    res.status(500).json({ message: "Failed to save service reservation." });
  }
});

// ADD ROOM RESERVATION
app.post("/room-reservations", async (req, res) => {
  const {
    userId,
    roomId,
    fullName,
    email,
    phone,
    checkInDate,
    checkOutDate,
    checkInTime,
    checkOutTime,
    totalHours,
    additionalNotes,
  } = req.body;

  if (
    !userId ||
    !roomId ||
    !fullName ||
    !email ||
    !phone ||
    !checkInDate ||
    !checkOutDate ||
    !checkInTime ||
    !checkOutTime ||
    totalHours === null
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required except Additional Notes." });
  }

  const query = `
    INSERT INTO room_reservation 
    (user_id, room_id, full_name, email, phone, check_in_date, check_out_date, check_in_time, check_out_time, total_hours, status, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await dbPromise.query(query, [
      userId,
      roomId,
      fullName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      totalHours,
      "Pending",
      additionalNotes || "No instructions added by the client.",
    ]);

    res.status(201).json({ message: "Room reservation saved successfully!" });
  } catch (error) {
    console.error("Error saving room reservation:", error);
    res.status(500).json({ message: "Failed to save room reservation." });
  }
});

// GET USER RESERVATION ROOMS
app.get("/room-reservations", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const [rows] = await dbPromise.query(
      "SELECT * FROM room_reservation WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching room reservations:", error);
    res.status(500).json({ message: "Failed to fetch room reservations." });
  }
});

// GET USER SERVICE RESERVATIONS
app.get("/service-reservations", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = `
    SELECT sr.*, 
           s.service_name, s.description AS service_description, 
           s.price AS service_price, s.duration AS service_duration
    FROM service_reservation sr
    JOIN services s ON sr.service_id = s.service_id
    WHERE sr.user_id = ?
  `;

  try {
    const [rows] = await dbPromise.query(query, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching service reservations:", error);
    res.status(500).json({ message: "Failed to fetch service reservations." });
  }
});

// GET DETAILED VIEW OF ROOM RESERVATIONS
app.get("/room-reservations/:id", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  const query = `
    SELECT rr.*, r.room_name, r.room_number, r.room_type, r.description, r.price, r.hourly_rate
    FROM room_reservation rr
    JOIN rooms r ON rr.room_id = r.room_id
    WHERE rr.r_reservation_id = ?
  `;

  try {
    const [rows] = await dbPromise.query(query, [reservationId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    res.status(500).json({ message: "Failed to fetch reservation details." });
  }
});

// GET DETAILED ROOM INFORMATION
app.get("/rooms/:id", async (req, res) => {
  const roomId = req.params.id;

  if (!roomId) {
    return res.status(400).json({ message: "Room ID is required." });
  }

  const query = `
    SELECT room_id, room_name, room_number, room_type, 
           description, price, hourly_rate
    FROM rooms
    WHERE room_id = ?
  `;

  try {
    const [rows] = await dbPromise.query(query, [roomId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Room not found." });
    }

    const room = rows[0];
    res.status(200).json({
      room_id: room.room_id,
      name: room.room_name,
      roomNumber: room.room_number,
      roomType: room.room_type,
      description: room.description,
      price: room.price,
      hourlyRate: room.hourly_rate,
    });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ message: "Failed to fetch room details." });
  }
});

// CANCEL ROOM RESERVATION
app.put("/room-reservations/:id/cancel", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const updateQuery = `
      UPDATE room_reservation 
      SET status = 'Cancelled' 
      WHERE r_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.status(200).json({ message: "Reservation cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      message: "Failed to cancel reservation. Please try again later.",
    });
  }
});

// CANCEL SERVICE RESERVATION
app.put("/service-reservations/:id/cancel", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const updateQuery = `
      UPDATE service_reservation
      SET status = 'Cancelled'
      WHERE s_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Service reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Service reservation cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling service reservation:", error);
    res.status(500).json({
      message: "Failed to cancel service reservation. Please try again later.",
    });
  }
});

// DELETE ROOM RESERVATION
app.delete("/room-reservations/:id", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const deleteQuery = `
      DELETE FROM room_reservation
      WHERE r_reservation_id = ?
    `;

    const [result] = await dbPromise.query(deleteQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room reservation not found." });
    }

    res.status(200).json({ message: "Room reservation deleted successfully!" });
  } catch (error) {
    console.error("Error deleting room reservation:", error);
    res.status(500).json({
      message: "Failed to delete room reservation. Please try again later.",
    });
  }
});

// DELETE SERVICE RESERVATION
app.delete("/service-reservations/:id", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const deleteQuery = `
      DELETE FROM service_reservation
      WHERE s_reservation_id = ?
    `;

    const [result] = await dbPromise.query(deleteQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Service reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Service reservation deleted successfully!" });
  } catch (error) {
    console.error("Error deleting service reservation:", error);
    res.status(500).json({
      message: "Failed to delete service reservation. Please try again later.",
    });
  }
});

// RATE ROOM RESERVATION
app.post("/room-reservations/:id/rate", async (req, res) => {
  const reservationId = req.params.id;
  const { roomId, userId, userComment, starCount } = req.body;

  if (!reservationId || !roomId || !userId || !starCount) {
    return res.status(400).json({
      message: "Reservation ID, Room ID, User ID, and star count are required.",
    });
  }

  if (starCount < 1 || starCount > 5) {
    return res
      .status(400)
      .json({ message: "Star count must be between 1 and 5." });
  }

  let connection;
  try {
    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const insertRatingQuery = `
      INSERT INTO room_user_ratings (r_reservation_id, room_id, user_id, user_comment, star_count)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(insertRatingQuery, [
      reservationId,
      roomId,
      userId,
      userComment,
      starCount,
    ]);

    const updateReservationQuery = `
      UPDATE room_reservation
      SET status = 'Rated'
      WHERE r_reservation_id = ?
    `;
    const [updateResult] = await connection.query(updateReservationQuery, [
      reservationId,
    ]);

    if (updateResult.affectedRows === 0) {
      throw new Error("Reservation not found.");
    }

    await connection.commit();
    res.status(200).json({ message: "Room rated successfully!" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error rating room reservation:", error);
    res.status(500).json({
      message: "Failed to rate room reservation. Please try again later.",
    });
  } finally {
    if (connection) connection.release();
  }
});

// RATE SERVICE RESERVATION
app.post("/service-reservations/:id/rate", async (req, res) => {
  const reservationId = req.params.id;
  const { serviceId, userId, userComment, starCount } = req.body;

  if (!reservationId || !serviceId || !userId || !starCount) {
    return res.status(400).json({
      message:
        "Reservation ID, Service ID, User ID, and star count are required.",
    });
  }

  if (starCount < 1 || starCount > 5) {
    return res
      .status(400)
      .json({ message: "Star count must be between 1 and 5." });
  }

  let connection;
  try {
    connection = await dbPromise.getConnection();
    await connection.beginTransaction();

    const insertRatingQuery = `
      INSERT INTO service_user_ratings (s_reservation_id, service_id, user_id, user_comment, star_count)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(insertRatingQuery, [
      reservationId,
      serviceId,
      userId,
      userComment,
      starCount,
    ]);

    const updateReservationQuery = `
      UPDATE service_reservation
      SET status = 'Rated'
      WHERE s_reservation_id = ?
    `;
    const [updateResult] = await connection.query(updateReservationQuery, [
      reservationId,
    ]);

    if (updateResult.affectedRows === 0) {
      throw new Error("Reservation not found.");
    }

    await connection.commit();
    res.status(200).json({ message: "Service rated successfully!" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error rating service reservation:", error);
    res.status(500).json({
      message: "Failed to rate service reservation. Please try again later.",
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET ALL ROOM RESERVATIONS
app.get("/admin/room-reservations", async (req, res) => {
  try {
    const query = `
      SELECT rr.r_reservation_id AS id, 
             CONCAT(u.first_name, ' ', u.middle_name, ' ', u.last_name) AS user_full_name,
             u.email AS user_email,
             u.phone_number AS user_phone_number,
             rr.full_name AS reservation_full_name,
             rr.email AS reservation_email,
             rr.phone AS reservation_phone,
             rr.check_in_date,
             rr.check_out_date,
             rr.check_in_time,
             rr.check_out_time,
             rr.total_hours,
             rr.status,
             rr.additional_notes,
             rr.created_at,
             r.room_name,
             r.room_number,
             r.room_type,
             r.description AS room_description,
             r.price AS room_price,
             r.hourly_rate AS room_hourly_rate
      FROM room_reservation rr
      JOIN users u ON rr.user_id = u.user_id
      JOIN rooms r ON rr.room_id = r.room_id
      ORDER BY rr.created_at DESC;
    `;

    const [reservations] = await dbPromise.query(query);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching room reservations:", error);
    res.status(500).json({ message: "Failed to fetch room reservations." });
  }
});

// ROOM RESERVATION CONFIRMATION
app.put("/admin/room-reservations/:id/confirm", async (req, res) => {
  const reservationId = req.params.id;

  try {
    const updateQuery = `
      UPDATE room_reservation 
      SET status = 'Confirmed' 
      WHERE r_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Room reservation confirmed successfully!" });
  } catch (error) {
    console.error("Error confirming room reservation:", error);
    res.status(500).json({
      message: "Failed to confirm room reservation. Please try again later.",
    });
  }
});

// CANCEL ROOM RESERVATION ON ADMIN
app.put("/admin/room-reservations/:id/cancel", async (req, res) => {
  const reservationId = req.params.id;
  const { reason } = req.body;

  if (!reservationId || !reason) {
    return res
      .status(400)
      .json({ message: "Reservation ID and reason are required." });
  }

  try {
    const updateQuery = `
    UPDATE room_reservation 
    SET status = 'Cancelled', cancellation_reason = ?
    WHERE r_reservation_id = ?
`;
    const [result] = await dbPromise.query(updateQuery, [
      reason,
      reservationId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.status(200).json({ message: "Reservation cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      message: "Failed to cancel reservation. Please try again later.",
    });
  }
});

// MARK ROOM RESERVATION AS COMPLETED
app.put("/admin/room-reservations/:id/complete", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const updateQuery = `
      UPDATE room_reservation
      SET status = 'Completed'
      WHERE r_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Room reservation marked as completed successfully!" });
  } catch (error) {
    console.error("Error marking room reservation as completed:", error);
    res.status(500).json({
      message:
        "Failed to mark room reservation as completed. Please try again later.",
    });
  }
});

// GET ALL SERVICE RESERVATIONS
app.get("/admin/service-reservations", async (req, res) => {
  try {
    const query = `
      SELECT sr.s_reservation_id AS id,
             CONCAT(u.first_name, ' ', u.middle_name, ' ', u.last_name) AS user_full_name,
             u.email AS user_email,
             u.phone_number AS user_phone_number,
             sr.full_name AS reservation_full_name,
             sr.email AS reservation_email,
             sr.phone AS reservation_phone,
             sr.start_date,
             sr.end_date,
             sr.start_time,
             sr.end_time,
             sr.total_hours,
             sr.status,
             sr.additional_notes,
             sr.created_at,
             s.service_name,
             s.description AS service_description,
             s.price AS service_price,
             s.duration AS service_duration
      FROM service_reservation sr
      JOIN users u ON sr.user_id = u.user_id
      JOIN services s ON sr.service_id = s.service_id
      ORDER BY sr.created_at DESC;
    `;

    const [reservations] = await dbPromise.query(query);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching service reservations:", error);
    res.status(500).json({ message: "Failed to fetch service reservations." });
  }
});

// SERVICE RESERVATION CONFIRMATION
app.put("/admin/service-reservations/:id/confirm", async (req, res) => {
  const reservationId = req.params.id;

  try {
    const updateQuery = `
      UPDATE service_reservation 
      SET status = 'Confirmed' 
      WHERE s_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Service reservation confirmed successfully!" });
  } catch (error) {
    console.error("Error confirming service reservation:", error);
    res.status(500).json({
      message: "Failed to confirm service reservation. Please try again later.",
    });
  }
});

// CANCEL SERVICE RESERVATION ON ADMIN
app.put("/admin/service-reservations/:id/cancel", async (req, res) => {
  const reservationId = req.params.id;
  const { reason } = req.body;

  if (!reservationId || !reason) {
    return res
      .status(400)
      .json({ message: "Reservation ID and reason are required." });
  }

  try {
    const updateQuery = `
      UPDATE service_reservation
      SET status = 'Cancelled', cancellation_reason = ?
      WHERE s_reservation_id = ?
    `;
    const [result] = await dbPromise.query(updateQuery, [
      reason,
      reservationId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res
      .status(200)
      .json({ message: "Service reservation cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling service reservation:", error);
    res.status(500).json({
      message: "Failed to cancel service reservation. Please try again later.",
    });
  }
});

// MARK SERVICE RESERVATION AS COMPLETED
app.put("/admin/service-reservations/:id/complete", async (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required." });
  }

  try {
    const updateQuery = `
      UPDATE service_reservation
      SET status = 'Completed'
      WHERE s_reservation_id = ?
    `;

    const [result] = await dbPromise.query(updateQuery, [reservationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.status(200).json({
      message: "Service reservation marked as completed successfully!",
    });
  } catch (error) {
    console.error("Error marking service reservation as completed:", error);
    res.status(500).json({
      message:
        "Failed to mark service reservation as completed. Please try again later.",
    });
  }
});

// GET ALL ROOM RATINGS
app.get("/room-user-ratings", async (req, res) => {
  const query = `
    SELECT 
      rur.r_rating_id AS rating_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      rur.user_comment,
      rur.star_count,
      rur.created_at
    FROM room_user_ratings AS rur
    JOIN users AS u ON rur.user_id = u.user_id
  `;
  try {
    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching room ratings:", error);
    res.status(500).json({ message: "Error fetching room ratings" });
  }
});

// GET ALL SERVICE RATINGS
app.get("/service-user-ratings", async (req, res) => {
  const query = `
    SELECT 
      sur.s_rating_id AS rating_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      sur.user_comment,
      sur.star_count,
      sur.created_at
    FROM service_user_ratings AS sur
    JOIN users AS u ON sur.user_id = u.user_id
  `;
  try {
    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching service ratings:", error);
    res.status(500).json({ message: "Error fetching service ratings" });
  }
});

// GET MONTHLY ROOMS CHECK-INS
app.get("/analytics/room-checkins", async (req, res) => {
  try {
    const query = `
      SELECT 
        MONTHNAME(check_in_date) AS month, 
        YEAR(check_in_date) AS year,
        room_type,
        COUNT(*) AS checkins 
      FROM room_reservation 
      INNER JOIN rooms ON room_reservation.room_id = rooms.room_id
      WHERE status IN ('Confirmed', 'Completed', 'Rated') 
        AND check_in_date IS NOT NULL
      GROUP BY year, month, room_type
      ORDER BY year, MONTH(check_in_date);
    `;

    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching room check-ins:", error);
    res.status(500).json({ message: "Failed to fetch room check-ins." });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
