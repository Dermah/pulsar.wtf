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

new p5(p => {
  const widthPc = widthPercent => (p.width * widthPercent) / 100;
  const heightPc = heightPercent => (p.height * heightPercent) / 100;

  let pulseSize = 0;
  let energyData = [];
  let totalAmp;

  channel.on("pulse", ({ type, size, energy, amplitude }) => {
    if (type === "waveform") {
      energyData = energy;
      totalAmp = amplitude;
    }
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

    p.push();
    p.rectMode(p.CENTER);
    p.translate(-p.width / 2, -p.height / 2);
    energyData.map((freqEnergy, i) => {
      p.fill(250);
      freqEnergy.map((amp, j) => {
        j / freqEnergy.length > 0.5 && p.fill(25);
        p.stroke(totalAmp * 255);
        p.rect(
          (j * widthPc(100)) / freqEnergy.length +
            (1 * widthPc(100)) / (2 * freqEnergy.length),
          (i * heightPc(100)) / energyData.length +
            (1 * heightPc(100)) / (2 * energyData.length),
          // 10,
          // 10
          widthPc(100) / freqEnergy.length,
          (heightPc(100 / energyData.length) * amp) / 255
        );
      });
    });

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
