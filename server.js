const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const path = require("path");

const { uploadFile } = require("./config.js");

// Create an Express.js server and Socket.io server
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Set up static files directory
app.use(express.static(path.join(__dirname, "public")));

// Set up main page route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Set up room routes
app.get("/room/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// Set up socket.io events
io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle user joining the room event
  socket.on("joinRoom", (room, username) => {
    socket.join(room);
    console.log(`User ${username} joined room: ${room}`);

    socket.broadcast.to(room).emit("userJoined", { username });
  });

  // Handle chat messages event
  socket.on("chatMessage", (msg) => {
    io.to(msg.room).emit("chatMessage", msg);
  });

  // Handle file upload event
  socket.on("uploadFile", async (file) => {
    try {
      const { base64Data, fileName, contentType, username } = file;
      const url = await uploadFile(base64Data, fileName, contentType);

      io.to(file.room).emit("fileUploaded", {
        username: username,
        file: { url, fileName },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      socket.emit("uploadError", "File upload failed. Please try again.");
    }
  });

  // Handle user leaving the room
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
