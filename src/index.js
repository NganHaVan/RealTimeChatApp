const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");

const port = process.env.PORT || 3000;
// WARNING: app.listen(80) will NOT work here!
server.listen(port, () => {
  console.log("Server is running on port " + port);
});

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));

// server (emit) => client (receive): "message"->welcome new user

io.on("connection", function(socket) {
  socket.emit("message", "Welcome to Chat App");
  socket.broadcast.emit("message", "A new user has joined");
  // Client(emit) => Server(receive): "sendMessage": send message to all connected clients
  socket.on("sendMessage", message => {
    io.emit("message", message);
  });

  // Client(emit) => Server(receive): "sendLocation"
  socket.on("sendLocation", location => {
    io.emit(
      "message",
      `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    );
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});