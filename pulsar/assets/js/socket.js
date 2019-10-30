// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

// Connect to the socket:
socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("audience:lobby", {});
channel
  .join()
  .receive("ok", resp => {
    console.log("Joined successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

export default socket;
