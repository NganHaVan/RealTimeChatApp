const socket = io();

socket.on("message", message => console.log(message));
document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const messInput = document.querySelector("input").value;
  // console.log(document.getElementsByTagName("input")[0].value);
  socket.emit("sendMessage", messInput);
});
