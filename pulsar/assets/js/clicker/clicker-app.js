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

  p.preload = function() {
    p.soundFormats("mp3");
    tune = p.loadSound("/music.mp3");
  };

  p.setup = function() {
    canvas = p.createCanvas(300, 300);

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
      if (!amp) amp = new p5.Amplitude();
      if (tune.isPlaying()) {
        tune.stop();
      } else {
        tune.play();
      }
    });
  };

  p.draw = function() {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    p.background(100);

    p.circle(0, 0, amp ? amp.getLevel() * p.width : 0);

    amp && channel.push("click", { size: amp.getLevel() });
    p.pop();
  };
});
