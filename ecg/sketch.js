const MARGIN = 20;

let foreColor;
let backColor;
let draw_i = 0;
let lineMaxPoints = 250;
let timeBetweenBeats = 60;
let totalBeats = 0;
let avgHeartRate = 0;
let nextBeatIn = 60;
let osc, fft;
let nextBeatCount;
let start = new Date();

let upperLine = {
  start_y: 100,
  values: [
    {
      x: MARGIN,
      y: 0
    }
  ]
};

function drawGrid(p1, p2, size) {
  push();
  noFill();
  for (let i = p1.x; i < p2.x; i += size) {
    for (let j = p1.y; j < p2.y; j += size) {
      stroke(10);
      rect(i, j, size, size);
    }
  }
  pop();
}

function setup() {
  backColor = "rgba(0, 0, 0, 1)";
  foreColor = "rgba(121,239,150, 1)";
  createCanvas(window.innerWidth - 5, window.innerHeight - 5);
  background(backColor);
  colorMode(RGB, 255, 255, 255, 1);
  angleMode(DEGREES); // Change the mode to DEGREES

  osc = new p5.Oscillator();
  osc.setType("sine");
  osc.freq(445);
  osc.amp(0);
  osc.start();
}

/**
 * Returns a value in function of the time elapsed since
 * the beginning of the heart pulse.
 *
 * This interval represents the depolarization of the atria
 *
 * @param {Number} time Elapsed time from heart beat beginning
 * @param {Number} lastValue Previous
 *
 * @return {Object} Points of the
 */

function createPRInterval(time, x) {
  let pq_duration = 12;
  let y = randomGaussian(8, 2) * sin(time * (360 / pq_duration));
  y = y > 0 ? -y : 0.2 * (1 - y);
  return {
    x: x,
    y: y + noise(time) * 5
  };
}

function createQRSComplex(time, x) {
  let qrs_duration = 9;
  time -= 12;
  let y;
  let newValue;
  if (time <= qrs_duration / 3) {
    y = (randomGaussian(10, 2) * (qrs_duration - time)) / 6;
  } else if (time < (2 * qrs_duration) / 3) {
    osc.amp(0.5, 0.01);
    y = (randomGaussian(60, 2) * abs(1.5 - (qrs_duration - time))) / 3;
    y = -y;
  } else {
    y = (randomGaussian(20, 2) * (qrs_duration - time)) / 3;
    osc.amp(0, 0.25);
  }

  return {
    x: x,
    y: y + noise(time) * 10
  };
}

function createSTInterval(time, x) {
  let st_duration = 8;
  let y = randomGaussian(10, 2) * sin(time * (360 / st_duration));
  y = y > 0 ? -y : 0.2 * (1 - y);
  return {
    x: x,
    y: y + noise(time) * 5
  };
}

function heart(x, y, size, left, count) {
  push();
  fill(121, 239, 150, 1- abs(0.6 - left / count));
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
  pop();
}

function draw() {
  draw_i++;
  nextBeatIn--;
  push();
  fill(0);
  rect(0, 0, 300 * 2, 200);
  pop();
  push();
  textFont("Helvetica", 26);
  fill(121, 239, 150);
  noStroke();
  let str = String(round(avgHeartRate)) + " bpm"
  text(str, 40, 180);
  push();
  fill(0);
  rect(10, 160, 25, 25);
  heart(20, 165, 15, nextBeatIn, nextBeatCount);
  pop();
  pop();
  let lastValue = upperLine.values[upperLine.values.length - 1];

  // Remove oldest value once the max number of points is reached
  if (upperLine.values.length >= lineMaxPoints) {
    upperLine.values.splice(0, 1);
  }

  if (nextBeatIn === 0) {
    nextBeatCount = round(randomGaussian(60, 10));
    nextBeatIn = nextBeatCount;
    totalBeats++;
    avgHeartRate = draw_i / totalBeats;
  }

  let timeFromHeartBeat = draw_i % timeBetweenBeats;
  let pq_duration = 12;
  let qrs_duration = pq_duration + 9;
  let st_duration = qrs_duration + 8;
  if (timeFromHeartBeat <= pq_duration) {
    upperLine.values.push(
      createPRInterval(timeFromHeartBeat, (lastValue.x + 2) % width)
    );
  } else if (timeFromHeartBeat <= qrs_duration) {
    upperLine.values.push(
      createQRSComplex(timeFromHeartBeat, (lastValue.x + 2) % width)
    );
  } else if (timeFromHeartBeat <= st_duration) {
    osc.amp(0);

    upperLine.values.push(
      createSTInterval(
        timeFromHeartBeat,
        (lastValue.x + 2) % (lineMaxPoints * 2)
      )
    );
  } else {
    upperLine.values.push({
      x: (lastValue.x + 2) % (lineMaxPoints * 2),
      y: 0 + noise(draw_i * 0.5) * 5
    });
  }

  for (let i = 1; i < upperLine.values.length; i++) {
    if (upperLine.values[i - 1].x > upperLine.values[i].x) continue;
    push();
    let alpha = i / lineMaxPoints - 1 / 50;
    stroke(121, 239, 150, alpha);
    fill(121, 239, 150, alpha);
    line(
      upperLine.values[i - 1].x,
      upperLine.start_y + upperLine.values[i - 1].y,
      upperLine.values[i].x,
      upperLine.start_y + upperLine.values[i].y
    );
    if (i + 5 > upperLine.values.length) {
      circle(
        upperLine.values[i].x,
        upperLine.start_y + upperLine.values[i].y,
        upperLine.values.length / i
      );
    }
    pop();
  }
}

function touchStarted() {
  getAudioContext().resume();
}
