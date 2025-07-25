const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "music-sync");

// File contents (the actual website)
const files = {
  "server.js": `const express = require("express");
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
server.listen(PORT, () => console.log(\`Server running at http://localhost:\${PORT}\`));`,

  "public/index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Music Sync Playlist</title>
  <style>
    body { font-family: Arial; text-align: center; background: #f5f5f5; padding: 20px; }
    #playlist { margin: 20px auto; max-width: 300px; }
    #playlist button { display: block; width: 100%; margin: 5px 0; padding: 10px; }
    #progressContainer { width: 80%; margin: 20px auto; background: #ddd; height: 10px; border-radius: 5px; }
    #progressBar { background: #4caf50; width: 0; height: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Music Sync Website</h1>
  <div id="playlist"></div>
  <audio id="player" controls></audio>
  <br>
  <button id="playBtn">Play</button>
  <button id="pauseBtn">Pause</button>
  <div id="progressContainer"><div id="progressBar"></div></div>
  <p id="timeDisplay">0:00 / 0:00</p>
  <script src="/socket.io/socket.io.js"></script>
  <script src="script.js"></script>
</body>
</html>`,

  "public/script.js": `const socket = io();
const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const playlistDiv = document.getElementById("playlist");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");

let songDuration = 0;

// Fetch playlist
fetch("/songs").then(res => res.json()).then(songs => {
  songs.forEach(song => {
    const btn = document.createElement("button");
    btn.textContent = song;
    btn.onclick = () => socket.emit("selectSong", song);
    playlistDiv.appendChild(btn);
  });
});

// Socket events
socket.on("loadSong", ({ song }) => {
  player.src = \`/music/\${song}\`;
  player.currentTime = 0;
  player.pause();
});

socket.on("sync", ({ isPlaying, currentTime, currentSong, songDuration: dur }) => {
  if (currentSong) {
    player.src = \`/music/\${currentSong}\`;
    player.currentTime = currentTime;
    songDuration = dur;
    if (isPlaying) player.play();
    else player.pause();
  }
});

socket.on("play", () => player.play());
socket.on("pause", () => player.pause());

player.addEventListener("loadedmetadata", () => {
  songDuration = player.duration;
  socket.emit("setDuration", songDuration);
});

// Progress bar updater
setInterval(() => {
  if (songDuration > 0) {
    const percent = (player.currentTime / songDuration) * 100;
    progressBar.style.width = \`\${percent}%\`;

    const formatTime = (t) => \`\${Math.floor(t/60)}:\${String(Math.floor(t%60)).padStart(2,"0")}\`;
    timeDisplay.textContent = \`\${formatTime(player.currentTime)} / \${formatTime(songDuration)}\`;
  }
}, 500);

playBtn.onclick = () => socket.emit("play");
pauseBtn.onclick = () => socket.emit("pause");
socket.emit("requestSync");`
};

// Create directories
if (!fs.existsSync(projectRoot)) fs.mkdirSync(projectRoot);
if (!fs.existsSync(path.join(projectRoot, "public"))) fs.mkdirSync(path.join(projectRoot, "public"));
if (!fs.existsSync(path.join(projectRoot, "music"))) fs.mkdirSync(path.join(projectRoot, "music"));

// Write files
for (const [filename, content] of Object.entries(files)) {
  const fullPath = path.join(projectRoot, filename);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

console.log("Music Sync Project structure created in 'music-sync'.");
console.log("Next steps:");
console.log("1. cd music-sync");
console.log("2. npm init -y");
console.log("3. npm install express socket.io");
console.log("4. Put your .mp3 files in the 'music' folder");
console.log("5. Run: node server.js");
