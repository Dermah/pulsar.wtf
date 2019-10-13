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

console.log(p5);

new p5(function(p) {
  let tune;
  let pulseSize;
  let canvas;
  let amp;
  let fft;
  let peakDetect;

  p.preload = function() {
    p.soundFormats("mp3");
    tune = p.loadSound("/music.mp3");
  };

  p.setup = function() {
    canvas = p.createCanvas(p.windowWidth, 300);
    p.frameRate(60);

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
      if (tune.isPlaying()) {
        tune.stop();
        amp = undefined;
      } else {
        tune.play();
        amp = new p5.Amplitude();
      }
    });

    fft = new p5.FFT();
    peakDetect = new p5.PeakDetect();
  };

  p.draw = function() {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    p.background(100);

    p.circle(0, 0, amp ? amp.getLevel() * p.width : 0);

    // peakDetect accepts an fft post-analysis
    const spectrum = fft.analyze();
    peakDetect.update(fft);

    peakDetect.isDetected && channel.push("click", { size: amp.getLevel() });

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
