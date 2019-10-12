// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../../css/audience-app.css";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html";

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket from "./socket";

import p5 from "p5";
console.log(p5);

new p5(p => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
  };

  p.draw = () => {
    p.background(0);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
});
