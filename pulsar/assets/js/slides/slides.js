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
  ],
  hash: true
});

let socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();
let slidesChannel = socket.channel("slides:lobby", {});
let pulseChannel = socket.channel("audience:lobby", {});

slidesChannel
  .join()
  .receive("ok", resp => {
    console.log("Joined slides successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

pulseChannel
  .join()
  .receive("ok", resp => {
    console.log("Joined audience successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

slidesChannel.on("slides", ({ action }) => {
  Reveal[action]();
});

Reveal.addEventListener("slidechanged", function(event) {
  console.log(Reveal.getTotalSlides() - event.indexh - 1);
  pulseChannel.push("pulse", {
    type: "countdown",
    value: Reveal.getTotalSlides() - event.indexh - 1
  });
  // event.previousSlide, event.currentSlide, event.indexh, event.indexv
});
