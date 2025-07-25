const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// State
let isPlaying = false;
let startTime = 0;
let currentSong = null;
let songDuration = 0;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/music", express.static(path.join(__dirname, "music")));

// List songs dynamically
app.get("/songs", (req, res) => {
  const files = fs.readdirSync("./music").filter(f => f.endsWith(".mp3"));
  res.json(files);
});

io.on("connection", (socket) => {
  console.log("User connected");

  const currentTime = isPlaying && currentSong ? (Date.now() - startTime) / 1000 : 0;
  socket.emit("sync", { isPlaying, currentTime, currentSong, songDuration });

  socket.on("selectSong", (song) => {
    currentSong = song;
    isPlaying = false;
    startTime = 0;
    songDuration = 0;
    io.emit("loadSong", { song });
  });

  socket.on("play", () => {
    if (currentSong && !isPlaying) {
      isPlaying = true;
      startTime = Date.now() - currentTime * 1000;
      io.emit("play");
    }
  });

  socket.on("pause", () => {
    if (isPlaying) {
      isPlaying = false;
      startTime = Date.now() - currentTime * 1000;
      io.emit("pause");
    }
  });

  socket.on("requestSync", () => {
    const currentTime = isPlaying ? (Date.now() - startTime) / 1000 : 0;
    socket.emit("sync", {
      isPlaying,
      currentTime,
      currentSong,
      songDuration,
    });
  });

  socket.on("setDuration", (duration) => {
    songDuration = duration;
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));