const socket = io();
const audio = document.getElementById("player");
const playlistDiv = document.getElementById("playlist");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");

let currentSong = "";

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
      btn.innerText = file.replace(/\.(mp3|amr)$/i, "");
      btn.addEventListener("click", () => {
        playSong(file, 0);
        socket.emit("changeSong", { file, time: 0 });
      });
      playlistDiv.appendChild(btn);

      if (index === 0 && !currentSong) {
        currentSong = file;
        audio.src = `songs/${encodeURIComponent(file)}`;
      }
    });
  });

function playSong(file, time = 0) {
  currentSong = file;
  audio.src = `songs/${encodeURIComponent(file)}`;
  audio.currentTime = time;
  audio.play();
}

// Play/Pause
playBtn.addEventListener("click", () => {
  audio.play();
  socket.emit("play", { time: audio.currentTime, song: currentSong });
});

pauseBtn.addEventListener("click", () => {
  audio.pause();
  socket.emit("pause", { time: audio.currentTime, song: currentSong });
});

// Progress bar
audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = progress + "%";

  const format = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
  timeDisplay.innerText = `${format(audio.currentTime)} / ${format(audio.duration || 0)}`;
});

// Socket listeners for sync
socket.on("play", ({ time, song }) => {
  if (song && song !== currentSong) {
    playSong(song, time);
  } else {
    audio.currentTime = time;
    audio.play();
  }
});

socket.on("pause", ({ time, song }) => {
  if (song && song !== currentSong) {
    playSong(song, time);
    audio.pause();
  } else {
    audio.currentTime = time;
    audio.pause();
  }
});

socket.on("seek", (time) => {
  audio.currentTime = time;
});

socket.on("changeSong", ({ file, time }) => {
  playSong(file, time);
});
