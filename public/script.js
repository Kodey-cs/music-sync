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



// const socket = io();
// const audio = document.getElementById("player");

// // When the local user plays/pauses, notify the server
// audio.addEventListener("play", () => {
//   socket.emit("play", audio.currentTime);
// });
// audio.addEventListener("pause", () => {
//   socket.emit("pause", audio.currentTime);
// });
// audio.addEventListener("seeked", () => {
//   socket.emit("seek", audio.currentTime);
// });

// // When receiving events from other users
// socket.on("play", (time) => {
//   audio.currentTime = time;
//   audio.play();
// });
// socket.on("pause", (time) => {
//   audio.currentTime = time;
//   audio.pause();
// });
// socket.on("seek", (time) => {
//   audio.currentTime = time;
// });




// const socket = io();
// const audio = document.getElementById("player");

// // Broadcast when user plays, pauses, or seeks
// audio.addEventListener("play", () => {
//   socket.emit("play", audio.currentTime);
// });

// audio.addEventListener("pause", () => {
//   socket.emit("pause", audio.currentTime);
// });

// audio.addEventListener("seeked", () => {
//   socket.emit("seek", audio.currentTime);
// });

// // When other users trigger actions
// socket.on("play", (time) => {
//   audio.currentTime = time;
//   audio.play();
// });

// socket.on("pause", (time) => {
//   audio.currentTime = time;
//   audio.pause();
// });

// socket.on("seek", (time) => {
//   audio.currentTime = time;
// });




// const socket = io();
// const audio = document.getElementById("player");
// const playlistDiv = document.getElementById("playlist");
// const playBtn = document.getElementById("playBtn");
// const pauseBtn = document.getElementById("pauseBtn");
// const progressBar = document.getElementById("progressBar");
// const timeDisplay = document.getElementById("timeDisplay");

// // Fetch song list from the server dynamically
// fetch("/songs")
//   .then(res => res.json())
//   .then(files => {
//     if (!files.length) {
//       playlistDiv.innerHTML = "<p>No songs found in /public/songs</p>";
//       return;
//     }

//     files.forEach((file, index) => {
//       const btn = document.createElement("button");
//       btn.innerText = file.replace(".mp3", "");
//       btn.addEventListener("click", () => {
//         audio.src = `songs/${file}`;
//         audio.play();
//         socket.emit("play", audio.currentTime); // Sync play for others
//       });
//       playlistDiv.appendChild(btn);

//       // Auto-play first song by default
//       if (index === 0) {
//         audio.src = `songs/${file}`;
//       }
//     });
//   });

// // Sync play/pause across devices
// playBtn.addEventListener("click", () => {
//   audio.play();
//   socket.emit("play", audio.currentTime);
// });

// pauseBtn.addEventListener("click", () => {
//   audio.pause();
//   socket.emit("pause", audio.currentTime);
// });

// // Progress bar and time display
// audio.addEventListener("timeupdate", () => {
//   const progress = (audio.currentTime / audio.duration) * 100;
//   progressBar.style.width = progress + "%";

//   const format = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
//   timeDisplay.innerText = `${format(audio.currentTime)} / ${format(audio.duration || 0)}`;
// });

// // Respond to events from other devices
// socket.on("play", (time) => {
//   audio.currentTime = time;
//   audio.play();
// });

// socket.on("pause", (time) => {
//   audio.currentTime = time;
//   audio.pause();
// });

// socket.on("seek", (time) => {
//   audio.currentTime = time;
// });




// const socket = io();
// const audio = document.getElementById("player");
// const playlistDiv = document.getElementById("playlist");
// const playBtn = document.getElementById("playBtn");
// const pauseBtn = document.getElementById("pauseBtn");
// const progressBar = document.getElementById("progressBar");
// const timeDisplay = document.getElementById("timeDisplay");

// // Fetch songs dynamically
// fetch("/songs")
//   .then(res => res.json())
//   .then(files => {
//     if (!files.length) {
//       playlistDiv.innerHTML = "<p>No songs found</p>";
//       return;
//     }

//     files.forEach((file, index) => {
//       const btn = document.createElement("button");
//       btn.innerText = file.replace(/\.(mp3|amr)$/i, ""); // Display without extension
//       btn.addEventListener("click", () => {
//         const safeURL = `songs/${encodeURIComponent(file)}`; // Encode special characters
//         audio.src = safeURL;
//         audio.play();
//         socket.emit("play", audio.currentTime);
//       });
//       playlistDiv.appendChild(btn);

//       // Load first song automatically
//       if (index === 0) {
//         audio.src = `songs/${encodeURIComponent(file)}`;
//       }
//     });
//   });

// // Play/pause events
// playBtn.addEventListener("click", () => {
//   audio.play();
//   socket.emit("play", audio.currentTime);
// });

// pauseBtn.addEventListener("click", () => {
//   audio.pause();
//   socket.emit("pause", audio.currentTime);
// });

// // Progress bar + time display
// audio.addEventListener("timeupdate", () => {
//   const progress = (audio.currentTime / audio.duration) * 100;
//   progressBar.style.width = progress + "%";

//   const format = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`;
//   timeDisplay.innerText = `${format(audio.currentTime)} / ${format(audio.duration || 0)}`;
// });

// // Sync across devices
// socket.on("play", (time) => {
//   audio.currentTime = time;
//   audio.play();
// });
// socket.on("pause", (time) => {
//   audio.currentTime = time;
//   audio.pause();
// });
// socket.on("seek", (time) => {
//   audio.currentTime = time;
// });
