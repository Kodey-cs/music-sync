// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// const PORT = process.env.PORT || 3000;

// // Serve static files (HTML, CSS, JS, Music)
// app.use(express.static(path.join(__dirname, "public")));

// // Handle Socket.IO connections
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // When a user plays music
//   socket.on("play", (time) => {
//     socket.broadcast.emit("play", time); // Send to all other clients
//   });

//   // When a user pauses music
//   socket.on("pause", (time) => {
//     socket.broadcast.emit("pause", time);
//   });

//   // When a user seeks (changes time)
//   socket.on("seek", (time) => {
//     socket.broadcast.emit("seek", time);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS, Songs)
app.use(express.static(path.join(__dirname, "public")));

// Route to get all songs dynamically
app.get("/songs", (req, res) => {
  const songsDir = path.join(__dirname, "public", "songs");
  fs.readdir(songsDir, (err, files) => {
    if (err) {
      res.status(500).send("Error reading songs folder");
      return;
    }
    const mp3Files = files.filter(file => file.endsWith(".mp3"));
    res.json(mp3Files);
  });
});

// Handle socket connections for syncing
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("play", (time) => {
    socket.broadcast.emit("play", time);
  });

  socket.on("pause", (time) => {
    socket.broadcast.emit("pause", time);
  });

  socket.on("seek", (time) => {
    socket.broadcast.emit("seek", time);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
