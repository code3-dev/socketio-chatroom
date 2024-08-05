const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");
const { uploadFile } = require("./upload.js");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const MAX_ROOM_ID_LENGTH = 20;
const ROOM_ID_REGEX = /^[A-Za-z0-9-_@#$]+$/;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route for room pages
app.get("/room/:id", (req, res) => {
  const roomId = req.params.id;
  if (roomId.length > MAX_ROOM_ID_LENGTH) {
    return res.status(400).send(`Room ID exceeds the maximum length of ${MAX_ROOM_ID_LENGTH} characters`);
  }
  if (!ROOM_ID_REGEX.test(roomId)) {
    return res.status(400).send("Invalid room ID format. Only alphanumeric characters (A-Z, a-z, 0-9) and special characters (-, _, @, #, $) are allowed");
  }
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// Store active usernames
const activeUsernames = new Set();

// Route to generate JWT token for a user
app.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  if (activeUsernames.has(username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedUsername = await bcrypt.hash(username, 10);
  const token = jwt.sign(
    { username, hashedUsername, crypto: randomBytes(64).toString("base64") },
    JWT_SECRET,
    { expiresIn: "3h" }
  );
  activeUsernames.add(username);
  res.json({ token });
});

// Middleware to verify JWT token for socket connections
async function verifyJWT(socket, next) {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) return next(new Error("Authentication error"));

      const { username, hashedUsername } = decoded;
      const validUser = await bcrypt.compare(username, hashedUsername);

      if (!validUser) {
        return next(new Error("Authentication error"));
      }

      socket.username = username;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
}

// Set up socket.io events with JWT authentication
io.use(verifyJWT).on("connection", (socket) => {
  console.log("a user connected");

  // Event handler for joining a room
  socket.on("joinRoom", (room) => {
    if (room.length > MAX_ROOM_ID_LENGTH) {
      socket.emit("errorMessage", `Room ID exceeds the maximum length of ${MAX_ROOM_ID_LENGTH} characters`);
      return;
    }
    if (!ROOM_ID_REGEX.test(room)) {
      socket.emit("errorMessage", "Invalid room ID format. Only alphanumeric characters (A-Z, a-z, 0-9) and special characters (-, _, @, #, $) are allowed");
      return;
    }
    socket.join(room);
    console.log(`User ${socket.username} joined room: ${room}`);
    socket.broadcast.to(room).emit("userJoined", { username: socket.username });
  });

  // Event handler for receiving chat messages
  socket.on("chatMessage", (msg) => {
    io.to(msg.room).emit("chatMessage", {
      username: socket.username,
      message: msg.message,
    });
  });

  // Event handler for file uploads
  socket.on("uploadFile", async (file) => {
    try {
      const { base64Data, fileName, contentType } = file;
      const url = await uploadFile(base64Data, fileName, contentType);
      io.to(file.room).emit("fileUploaded", {
        username: socket.username,
        file: { url, fileName },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      socket.emit("uploadError", "File upload failed. Please try again.");
    }
  });

  // Event handler for user disconnection
  socket.on("disconnect", () => {
    activeUsernames.delete(socket.username);
    console.log("user disconnected");
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});