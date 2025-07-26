const socket = io();
const audio = document.getElementById("player");
const playlistDiv = document.getElementById("playlist");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");

// Load playlist dynamically
fetch("/songs")
  .then(res => res.json())
  .then(files => {
    if (!files.length) {
      playlistDiv.innerHTML = "<p>No songs found</p>";
      return;
    }

    files.forEach((file, index) => {
      const btn = document.createElement("button");
      btn.innerText = file.replace(/\.(mp3|amr)$/i, ""); // Show name without extension
      btn.addEventListener("click", () => {
        const safeURL = `songs/${encodeURIComponent(file)}`;
        audio.src = safeURL;
        audio.play();
        socket.emit("play", audio.currentTime);
      });
      playlistDiv.appendChild(btn);

      if (index === 0) {
        audio.src = `songs/${encodeURIComponent(file)}`;
      }
    });
  });

// Play/Pause buttons
playBtn.addEventListener("click", () => {
  audio.play();
  socket.emit("play", audio.currentTime);
});

pauseBtn.addEventListener("click", () => {
  audio.pause();
  socket.emit("pause", audio.currentTime);
});

// Progress bar
audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = progress + "%";

  const format = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
  timeDisplay.innerText = `${format(audio.currentTime)} / ${format(audio.duration || 0)}`;
});

// Sync events
socket.on("play", (time) => {
  audio.currentTime = time;
  audio.play();
});
socket.on("pause", (time) => {
  audio.currentTime = time;
  audio.pause();
});
socket.on("seek", (time) => {
  audio.currentTime = time;
});
