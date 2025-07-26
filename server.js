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
