const socket = io();

socket.on("message", message => console.log(message));
document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const messInput = document.querySelector("input").value;
  // console.log(document.getElementsByTagName("input")[0].value);
  socket.emit("sendMessage", messInput, messageState => {
    if (messageState) {
      console.log("Cursed Words are not allowed");
    }
    console.log("Message delivered");
  });
});

document.getElementById("send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log("Location shared");
      }
    );
  });
});
