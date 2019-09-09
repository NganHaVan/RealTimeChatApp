const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");

const port = process.env.PORT || 3000;
// WARNING: app.listen(80) will NOT work here!
server.listen(port, () => {
  console.log("Server is running on port " + port);
});

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));

// server (emit) => client (receive): "message"->welcome new user

io.on("connection", function(socket) {
  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", generateMessage("Welcome to Chat App"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined`));
  });

  // Client(emit) => Server(receive): "sendMessage": send message to all connected clients
  // NOTE: emiter(a cb as third param) -> receiver(value, cb: the cb must be invoked so that the emiter can receive the message) -- acknowledgement --> emiter
  // Cb with params ? Not allow cursed words : Display message
  socket.on("sendMessage", (message, cb) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return cb("Profanity is not allowed");
    }
    io.emit("message", generateMessage(message));
    cb();
  });

  // Client(emit) => Server(receive): "sendLocation"
  // NOTE: emiter(a cb as third param) -> receiver(value, cb: the cb must be invoked so that the emiter can receive the message) -- acknowledgement --> emiter
  socket.on("sendLocation", (location, cb) => {
    io.emit(
      "locationMessage",
      generateMessage(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
});
