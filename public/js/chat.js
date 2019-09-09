const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.getElementById("messages");

// Template
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;
console.log(document.getElementById("location-message-template"));

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", locationURL => {
  // const html = Mustache.render(locationMessageTemplate, { locationURL });
  const html = Mustache.render(locationMessageTemplate, {
    locationURL: locationURL.text,
    createdAt: moment(locationURL.createdAt).format("HH:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  // console.log(document.getElementsByTagName("input")[0].value);
  $messageFormButton.setAttribute("disabled", true);
  $messageFormInput.setAttribute("disabled", true);
  const messInput = document.querySelector("input[name=message]").value;
  socket.emit("sendMessage", messInput, messageState => {
    $messageFormInput.value = "";
    $messageFormInput.removeAttribute("disabled");
    $messageFormInput.focus();
    $messageFormButton.removeAttribute("disabled");
    if (messageState) {
      console.log("Cursed Words are not allowed");
    }
    console.log("Message delivered");
  });
});

$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute("disabled", true);
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
        $locationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room });
