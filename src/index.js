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

// server (emit) => client (receive): countUpdated
// client (emit) => server (receive): increment

let count = 0;
io.on("connection", function(socket) {
  socket.emit("countUpdated", count);
  socket.on("increment", () => {
    count++;
    // socket.emit("countUpdated", count); => Emit the event to a particular connection. Which means that only the sender receive this event
    io.emit("countUpdated", count); // => All the socketes are updated. The event is transmitted to all connections
  });
});
