const socket = io();
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
  player.src = `/music/${song}`;
  player.currentTime = 0;
  player.pause();
});

socket.on("sync", ({ isPlaying, currentTime, currentSong, songDuration: dur }) => {
  if (currentSong) {
    player.src = `/music/${currentSong}`;
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
    progressBar.style.width = `${percent}%`;

    const formatTime = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
    timeDisplay.textContent = `${formatTime(player.currentTime)} / ${formatTime(songDuration)}`;
  }
}, 500);

playBtn.onclick = () => socket.emit("play");
pauseBtn.onclick = () => socket.emit("pause");
socket.emit("requestSync");