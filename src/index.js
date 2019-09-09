const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser
} = require("./utils/users");

const port = process.env.PORT || 3000;
// WARNING: app.listen(80) will NOT work here!
server.listen(port, () => {
  console.log("Server is running on port " + port);
});

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));

// server (emit) => client (receive): "message"->welcome new user

io.on("connection", function(socket) {
  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage(`Welcome to ${user.room} room`, "HaVan Greeting")
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined`, "HaVan announcement")
      );

    io.to(user.room).emit("roomData", {
      users: getUsersInRoom(user.room),
      room: user.room
    });

    cb();
  });

  // Client(emit) => Server(receive): "sendMessage": send message to all connected clients
  // NOTE: emiter(a cb as third param) -> receiver(value, cb: the cb must be invoked so that the emiter can receive the message) -- acknowledgement --> emiter
  // Cb with params ? Not allow cursed words : Display message
  socket.on("sendMessage", (message, cb) => {
    const username = getUser(socket.id).username;
    const roomName = getUser(socket.id).room;
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return cb("Profanity is not allowed");
    }
    io.to(roomName).emit("message", generateMessage(message, username));
    cb();
  });

  // Client(emit) => Server(receive): "sendLocation"
  // NOTE: emiter(a cb as third param) -> receiver(value, cb: the cb must be invoked so that the emiter can receive the message) -- acknowledgement --> emiter
  socket.on("sendLocation", (location, cb) => {
    const roomName = getUser(socket.id).room;
    const username = getUser(socket.id).username;
    io.to(roomName).emit(
      "locationMessage",
      generateMessage(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        username
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.emit(
        "message",
        generateMessage(`${user.username} has left`, "HaVan announcement")
      );
      io.to(user.room).emit("roomData", {
        users: getUsersInRoom(user.room),
        room: user.room
      });
    }
  });
});
