const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);  // <--- THIS was missing

// Serve static files (HTML, JS, CSS, songs)
app.use(express.static(path.join(__dirname, "public")));

// API to list songs dynamically (supports mp3 + amr)
app.get("/songs", (req, res) => {
  const songsDir = path.join(__dirname, "public", "songs");
  fs.readdir(songsDir, (err, files) => {
    if (err) {
      res.status(500).send("Error reading songs folder");
      return;
    }
    const audioFiles = files.filter(f => f.endsWith(".mp3") || f.endsWith(".amr"));
    res.json(audioFiles);
  });
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("play", (data) => {
    socket.broadcast.emit("play", data);
  });

  socket.on("pause", (data) => {
    socket.broadcast.emit("pause", data);
  });

  socket.on("seek", (time) => {
    socket.broadcast.emit("seek", time);
  });

  socket.on("changeSong", (data) => {
    socket.broadcast.emit("changeSong", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
