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
  const INSTRUMENT =
    p.getURLParams()["instrument"] || Math.floor(Math.random() * 5);

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
    instrumentDrawings = [[], [], [], [], []];
  });

  p.preload = () => {};

  p.setup = () => {
    p.frameRate(24);
    instrument = Number.parseInt(INSTRUMENT, 10);
    console.log("INSTRUMENT", instrument);
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);

    var supportsTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;
    function firePress() {
      noSleep.enable();
      inputAllowed &&
        channel.push("pulse", {
          type: "instrument",
          instrument,
          x: p.mouseX / p.width,
          y: p.mouseY / p.height,
          angle: p.random(2 * p.PI),
          color: { r: p.random(255), g: p.random(255), b: p.random(255) }
        });
    }

    if (!supportsTouch) {
      canvas.mousePressed(firePress);
    } else {
      canvas.touchStarted(firePress);
    }
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
    p.blendMode(p.DIFFERENCE);
    instrumentDrawings[0].map(drawing => {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.fill(drawing.color.r, drawing.color.g, drawing.color.b);
      p.circle(0, 0, widthPc(drawing.alive * 10));
      drawing.alive -= 0.25;
      p.pop();
    });
    if (instrumentDrawings[0][0] && instrumentDrawings[0][0].alive <= 0) {
      instrumentDrawings[0].shift();
    }
    p.blendMode(p.BLEND);

    instrumentDrawings[1].map(drawing => {
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
    if (instrumentDrawings[1][0] && instrumentDrawings[1][0].alive <= 0) {
      instrumentDrawings[1].shift();
    }

    instrumentDrawings[2].map(drawing => {
      p.push();
      p.stroke(
        drawing.color.r,
        drawing.color.g,
        drawing.color.b,
        255 * (drawing.alive / 10)
      );
      p.strokeWeight((widthPc(10) * drawing.alive) / 10);
      p.noFill();
      for (let c = 0; c < 10; c++) {
        p.curve(
          drawing.x + p.random(widthPc(70)) - widthPc(35),
          drawing.y + p.random(widthPc(70)) - widthPc(35),
          drawing.x,
          drawing.y,
          drawing.x + p.random(widthPc(70)) - widthPc(35),
          drawing.y + p.random(widthPc(70)) - widthPc(35),
          drawing.x + p.random(widthPc(70)) - widthPc(35),
          drawing.y + p.random(widthPc(70)) - widthPc(35)
        );
      }
      drawing.alive -= 0.5;
      p.pop();
    });
    if (instrumentDrawings[2][0] && instrumentDrawings[2][0].alive <= 0) {
      instrumentDrawings[2].shift();
    }
    p.strokeWeight(1);

    instrumentDrawings[4].map(drawing => {
      p.push();
      p.translate(drawing.x, drawing.y);
      // p.scale((widthPc(10) * (10 - drawing.alive)) / 10);
      p.fill(255, 255, 255);
      p.strokeWeight(0);
      for (let c = 0; c < 10; c++) {
        p.rotate(drawing.angle * c);
        p.circle(c * p.random(10), c * p.random(), 20 * drawing.alive);
      }
      drawing.alive--;
      p.pop();
    });
    if (instrumentDrawings[4][0] && instrumentDrawings[4][0].alive <= 0) {
      instrumentDrawings[4].shift();
    }
  }

  const rainbow = {
    0: p.color(148, 0, 211),
    1: p.color(75, 0, 130),
    2: p.color(0, 0, 255),
    3: p.color(0, 255, 0),
    4: p.color(255, 255, 0),
    5: p.color(255, 127, 0),
    6: p.color(255, 0, 0),
    7: p.color(255, 0, 0)
  };
  function drawBeams() {
    p.blendMode(p.DIFFERENCE);
    instrumentDrawings[3].map(drawing => {
      p.push();
      const pick = Math.floor(drawing.color.r / 35);
      const color = rainbow[pick];
      p.fill(color);
      p.strokeWeight(0);
      p.translate(widthPc(50), p.height);
      p.rotate((drawing.x / widthPc(100)) * (p.PI / 2) - p.PI / 4);
      p.rect(0, p.height, 20 * drawing.alive, (10 - drawing.alive) * p.height);
      drawing.alive--;
      p.pop();
    });
    if (instrumentDrawings[3][0] && instrumentDrawings[3][0].alive <= 0) {
      instrumentDrawings[3].shift();
    }
    p.blendMode(p.BLEND);
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

    drawBeams();

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
