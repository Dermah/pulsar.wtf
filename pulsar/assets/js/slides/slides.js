import css1 from "../../css/slides/slides.css";
import { Socket } from "phoenix";

import Reveal from "./reveal.js";
window.Reveal = Reveal;
global.Reveal = Reveal;

console.log(Reveal);

import("./plugin/markdown/marked.js");
import("./plugin/markdown/markdown.js");
import("./plugin/notes/notes.js");
// import("./plugin/highlight/highlight.js");

// More info about config & dependencies:
// - https://github.com/hakimel/reveal.js#configuration
// - https://github.com/hakimel/reveal.js#dependencies
Reveal.initialize({
  dependencies: [
    // { src: "/js/slides/plugin/markdown/marked.js" },
    // { src: "/js/slides/plugin/markdown/markdown.js" },
    // { src: "/js/slides/plugin/notes/notes.js", async: true },
    // { src: "/js/slides/plugin/highlight/highlight.js", async: true }
  ]
});

let socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();
let slidesChannel = socket.channel("slides:lobby", {});
slidesChannel
  .join()
  .receive("ok", resp => {
    console.log("Joined slides successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

slidesChannel.on("slides", ({ action }) => {
  console.log("eg");
  Reveal[action]();
});
