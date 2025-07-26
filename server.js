const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS, Music)
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // When a user plays music
  socket.on("play", (time) => {
    socket.broadcast.emit("play", time); // Send to all other clients
  });

  // When a user pauses music
  socket.on("pause", (time) => {
    socket.broadcast.emit("pause", time);
  });

  // When a user seeks (changes time)
  socket.on("seek", (time) => {
    socket.broadcast.emit("seek", time);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
