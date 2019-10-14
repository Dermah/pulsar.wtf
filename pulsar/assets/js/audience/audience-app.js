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

  let instrument;

  let pulseSize = 0;
  let energyData = [];
  let totalAmp;

  let fireflyPower;
  let fireflyDecay;

  let inputAllowed = false;

  const instrumentMap = [
    "bass/synth",
    "drums",
    "percussion",
    "horns",
    "melody"
  ];

  let instrumentDrawings = [[], [], [], [], []];
  channel.on(
    "pulse",
    ({
      type,
      size,
      energy,
      amplitude,
      decay,
      value,
      instrument: recievedInstrument,
      x,
      y,
      angle,
      color
    }) => {
      if (type === "waveform") {
        energyData = energy;
        totalAmp = amplitude;
      } else if (type === "firefly") {
        fireflyPower = size;
        fireflyDecay = decay;
      } else if (type === "inputAllowed") {
        inputAllowed = value;
      } else if (type === "instrument") {
        instrumentDrawings[recievedInstrument].push({
          x: x * p.width,
          y: y * p.height,
          angle,
          color,
          alive: 10
        });
      } else {
        pulseSize = widthPc(size * 100);
      }
    }
  );

  channel.on("clear", () => {
    energyData = [];
    totalAmp = 0;
    pulseSize = 0;
    fireflyPower = 0;
  });

  p.preload = () => {};

  p.setup = () => {
    p.frameRate(24);
    instrument =
      Number.parseInt(p.getURLParams()["instrument"], 10) ||
      Math.floor(Math.random() * 5);
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);

    canvas.touchStarted(function(e) {
      noSleep.enable();
      channel.push("pulse", {
        type: "instrument",
        instrument,
        x: p.mouseX / p.width,
        y: p.mouseY / p.height,
        angle: p.random(2 * p.PI),
        color: { r: p.random(255), g: p.random(255), b: p.random(255) }
      });
    });
  };

  function drawFirefly() {
    if (fireflyPower > 0.000001) {
      const boxWidth = p.width / 1;
      const boxHeight = p.height / 3;

      p.noStroke(0);
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          p.fill(
            255,
            p.random() * 170,
            p.random() * 170,
            p.random() * fireflyPower
          );
          p.rect(i * boxWidth, j * boxHeight, boxWidth, boxHeight);
        }
      }
      p.strokeWeight(1);
      fireflyPower = fireflyPower / fireflyDecay;
    }
  }

  function drawInstruments() {
    instrumentDrawings.map(drawings => {
      drawings.map(drawing => {
        p.push();
        p.translate(drawing.x, drawing.y);
        p.scale((widthPc(10) * (10 - drawing.alive)) / 10);
        p.rotate(drawing.angle);
        p.fill(
          drawing.color.r,
          drawing.color.g,
          drawing.color.b,
          255 * (drawing.alive / 10)
        );
        p.rect(0, 0, 20, 20);
        drawing.alive--;
        p.pop();
      });
      if (drawings[0] && drawings[0].alive <= 0) {
        drawings.shift();
      }
    });
  }

  p.draw = () => {
    p.background(0, 0, 0);
    // p.background(
    //   (instrument % 3 === 0 &&
    //     totalAmp * (energyData[0] && energyData[0][15])) ||
    //     0,
    //   (instrument % 3 === 1 &&
    //     totalAmp * (energyData[1] && energyData[1][15])) ||
    //     0,
    //   (instrument % 3 === 2 &&
    //     totalAmp * (energyData[2] && energyData[2][15])) ||
    //     0
    // );

    // Fireflys
    drawFirefly();
    drawInstruments();

    p.textAlign(p.CENTER);
    p.fill(255);
    inputAllowed &&
      p.text(`You are ${instrumentMap[instrument]}`, p.width / 2, 15);
    p.push();
    p.translate(p.width / 2, p.height / 2);

    if (pulseSize > 0) {
      p.circle(0, 0, pulseSize);
      pulseSize--;
    }

    p.push();
    p.rectMode(p.CENTER);
    p.translate(-p.width / 2, 0);

    // energyData.map((freqEnergy, i) => {
    const i = 0;
    const freqEnergy = energyData[instrument] || [];
    const channels = 1; //energyData.length
    p.fill(250);
    freqEnergy.map((amp, j) => {
      j / freqEnergy.length > 0.5 && p.fill(25) && p.stroke(255);
      p.rect(
        (j * widthPc(100)) / freqEnergy.length +
          (1 * widthPc(100)) / (2 * freqEnergy.length),
        (i * heightPc(100)) / channels + (1 * heightPc(100)) / (2 * channels),
        // 10,
        // 10
        widthPc(100) / freqEnergy.length,
        (heightPc(50 / channels) * amp) / 255
      );
    });
    // });

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
