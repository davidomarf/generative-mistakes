const WIDTH = 1100;
const HEIGHT = 1100;
const MARGIN = 50;

const tile = 20;

var landMasses = [];
let i = 0; 

function setup() {
  createCanvas(WIDTH, HEIGHT);
  for (let i = MARGIN; i < WIDTH - MARGIN; i += tile) {
    for (let j = MARGIN; j < HEIGHT - MARGIN; j += tile) {
      // if(random() > 0.5) continue;
      landMasses.push(new LandMass(getPoints({
        x: i + tile / 2,
        y: j + tile / 2
      }, tile / 20, 10)));
    }
  }
}

function draw() {
  background(200);
  for (let i = 0; i < landMasses.length; i++) {
      landMasses[i].update();
      landMasses[i].show();
  }
}