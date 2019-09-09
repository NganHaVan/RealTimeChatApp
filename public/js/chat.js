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
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  const $latestMessage = $messages.lastElementChild;
  const latestMessageMargin = parseInt(
    getComputedStyle($latestMessage).marginBottom
  );
  const latestMessageHeight = $latestMessage.offsetHeight + latestMessageMargin;
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  // How far I scroll?
  const scrollOffset = $messages.scrollTop + visibleHeight;
  if (containerHeight - latestMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", message => {
  const messageElement = document.querySelector(".message");
  let className = "";
  if (/^HaVan/.test(message.username)) {
    className = "message center";
  } else {
    if (message.username === username) {
      className = "message right";
    } else {
      className = "message";
    }
  }
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm"),
    className
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", locationURL => {
  // const html = Mustache.render(locationMessageTemplate, { locationURL });
  let className = "";

  if (locationURL.username === username) {
    className = "message right";
  } else {
    className = "message";
  }
  const html = Mustache.render(locationMessageTemplate, {
    username: locationURL.username,
    locationURL: locationURL.text,
    createdAt: moment(locationURL.createdAt).format("HH:mm"),
    className
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ users, rrom }) => {
  const html = Mustache.render(sidebarTemplate, { users, room });
  document.getElementById("sidebar").innerHTML = html;
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

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
