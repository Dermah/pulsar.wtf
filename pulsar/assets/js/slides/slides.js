import css1 from "../../css/slides/slides.css";

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
