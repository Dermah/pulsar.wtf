// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

// If you want to do socket auth, maybe look at the comment that used to be here
// https://github.com/Dermah/pulsar.wtf/blob/v1.0.0/pulsar/assets/js/clicker/socket.js#L13-L54

// Connect to the socket:
socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("audience:lobby", {});
let slideChannel = socket.channel("slides:lobby", {});
let broadcasting = true;

const clearButton = document.querySelector("#clear-button");
const leftButton = document.querySelector("#left-button");
const rightButton = document.querySelector("#right-button");
const fireflyButton = document.querySelector("#firefly-button");
const strobeButton = document.querySelector("#strobe-button");
const strobeLongButton = document.querySelector("#strobe-long-button");

const broadcastCheckbox = document.querySelector("#broadcasting");
const audienceCheckbox = document.querySelector("#allow-audience");
const autostrobeCheckbox = document.querySelector("#autostrobe");

broadcastCheckbox.onchange = function() {
  broadcasting = broadcastCheckbox.checked;
};

const audienceEnableBroadcast = () => {
  console.log("send", audienceCheckbox.checked);
  channel.push("pulse", {
    type: "inputAllowed",
    value: audienceCheckbox.checked
  });
};

const autostrobeEnableBroadcast = () => {
  console.log("send", autostrobeCheckbox.checked);
  channel.push("pulse", {
    type: "autostrobe",
    value: autostrobeCheckbox.checked
  });
};

audienceCheckbox.onchange = function() {
  audienceEnableBroadcast();
};

autostrobeCheckbox.onchange = function() {
  autostrobeEnableBroadcast();
};

setInterval(() => audienceEnableBroadcast(), 5000);
setInterval(() => autostrobeEnableBroadcast(), 5000);

clearButton.addEventListener("click", e => {
  channel.push("clear", {});
});

leftButton.addEventListener("click", e => {
  slideChannel.push("slides", { action: "left" });
});

rightButton.addEventListener("click", e => {
  slideChannel.push("slides", { action: "right" });
});

fireflyButton.addEventListener("click", e => {
  channel.push("pulse", { type: "firefly", size: 250, decay: 1.02 });
});

strobeButton.addEventListener("click", e => {
  channel.push("pulse", { type: "strobe", size: 10 });
});

strobeLongButton.addEventListener("click", e => {
  channel.push("pulse", { type: "strobe", size: 25 });
});

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      slideChannel.push("slides", { action: "left" });
      break;
    case 38:
      slideChannel.push("slides", { action: "up" });
      break;
    case 39:
      slideChannel.push("slides", { action: "right" });
      break;
    case 40:
      slideChannel.push("slides", { action: "down" });
      break;
  }
};

channel
  .join()
  .receive("ok", resp => {
    console.log("Joined audience successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

slideChannel
  .join()
  .receive("ok", resp => {
    console.log("Joined slides successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

const wrappedChannel = {
  ...channel,
  push: (name, data) => {
    broadcasting && channel.push(name, data);
  }
};

export default socket;
export { wrappedChannel as channel };
