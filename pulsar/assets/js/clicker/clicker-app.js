// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../../css/clicker-app.css";

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
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";

new p5(function(p) {
  const SONG = `/sounds/${p.getURLParams()["song"] || "jp-intro"}.mp3`;
  const SMOOTHING = p.getURLParams()["smoothing"] || 0.8;

  let previewTune;
  let tune;
  let canvas;
  let amp;
  let fft;

  // let energy;
  let energy = [[], [], [], [], []];
  // let energy = { bass: [], lowMid: [], mid: [], highMid: [], treble: [] };

  p.preload = function() {
    p.soundFormats("mp3");
    previewTune = p.loadSound(SONG);
    tune = p.loadSound(SONG);
  };

  p.setup = function() {
    canvas = p.createCanvas(p.windowWidth, 300);
    p.frameRate(15);

    var myDiv = p
      .createDiv("click to start")
      .id("play-button")
      .center();
    myDiv.position(0, 0);

    var mySynth = new p5.MonoSynth();

    // This won't play until the context has started
    mySynth.play("A6");

    // Start the audio context on a click/touch event
    p.userStartAudio().then(function() {
      myDiv.remove();
    });

    canvas.mouseClicked(function() {
      if (previewTune.isPlaying()) {
        previewTune.stop();
        tune.stop();
      } else {
        previewTune.play();
      }
    });

    fft = new p5.FFT(SMOOTHING);
    amp = new p5.Amplitude();
    fft.setInput(previewTune);
    // amp.setInput(previewTune);
    previewTune.disconnect();

    // tune.onended(() => {
    //   console.log(JSON.stringify(energy));
    // });
  };

  p.draw = function() {
    if (!tune.isPlaying() && previewTune.currentTime() > 1) {
      tune.play();
    }

    p.push();
    p.translate(p.width / 2, p.height / 2);

    p.background(100);

    p.circle(0, 0, amp ? amp.getLevel() * p.width : 0);

    const spectrum = fft.analyze();

    energy[0].push(fft.getEnergy(1, 40));
    energy[0].length > 30 && energy[0].splice(0, 1);

    energy[1].push(fft.getEnergy(40, 200));
    energy[1].length > 30 && energy[1].splice(0, 1);

    energy[2].push(fft.getEnergy(200, 1000));
    energy[2].length > 30 && energy[2].splice(0, 1);

    energy[3].push(fft.getEnergy(1000, 3000));
    energy[3].length > 30 && energy[3].splice(0, 1);

    energy[4].push(fft.getEnergy(3000, 14000));
    energy[4].length > 30 && energy[4].splice(0, 1);

    previewTune.isPlaying() &&
      channel.push("pulse", {
        type: "waveform",
        amplitude: amp.getLevel(),
        energy: energy
      });

    p.push();
    p.translate(-p.width / 2, -p.height / 2);

    // Spectrum
    p.noStroke();
    p.fill(0, 255, 0); // spectrum is green
    for (var i = 0; i < spectrum.length; i++) {
      var x = p.map(i, 0, spectrum.length, 0, p.width);
      var h = -p.height + p.map(spectrum[i], 0, 255, p.height, 0);
      p.rect(x, p.height, p.width / spectrum.length, h);
    }

    // Energy Dials
    p.fill(0, 0, 255);
    p.rect(
      (p.width / 5) * 0,
      0,
      ((fft.getEnergy("bass") / 255) * p.width) / 5,
      10
    );
    p.rect(
      (p.width / 5) * 1,
      0,
      ((fft.getEnergy("lowMid") / 255) * p.width) / 5,
      10
    );
    p.rect(
      (p.width / 5) * 2,
      0,
      ((fft.getEnergy("mid") / 255) * p.width) / 5,
      10
    );
    p.rect(
      (p.width / 5) * 3,
      0,
      ((fft.getEnergy("highMid") / 255) * p.width) / 5,
      10
    );
    p.rect(
      (p.width / 5) * 4,
      0,
      ((fft.getEnergy("treble") / 255) * p.width) / 5,
      10
    );

    // Waveform
    var waveform = fft.waveform();
    p.noFill();
    p.beginShape();
    p.stroke(255, 0, 0); // waveform is red
    p.strokeWeight(1);
    for (var i = 0; i < waveform.length; i++) {
      var x = p.map(i, 0, waveform.length, 0, p.width);
      var y = p.map(waveform[i], -1, 1, 0, p.height);
      p.vertex(x, y);
    }
    p.endShape();
    p.pop();
    // amp && channel.push("click", { size: amp.getLevel() });
    p.pop();
  };
});
