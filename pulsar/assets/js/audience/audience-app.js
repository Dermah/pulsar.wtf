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
import { channel } from "./socket";

import p5 from "p5";
import NoSleep from "nosleep.js";

const noSleep = new NoSleep();

console.log(p5);

new p5(p => {
  const widthPc = widthPercent => (p.width * widthPercent) / 100;

  let tune;
  let pulseSize = 0;

  channel.on("pulse", ({ size }) => {
    pulseSize = widthPc(size * 100);
  });

  p.preload = () => {};

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);

    canvas.mouseClicked(function() {
      noSleep.enable();
    });
  };

  p.draw = () => {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    p.background(0);

    if (pulseSize > 0) {
      p.circle(0, 0, pulseSize);
      pulseSize--;
    }

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
