const WIDTH = 1100;
const HEIGHT = 1100;
const MARGIN = 50;

const tile = 1000;

var landMasses = [];
let i = 0;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(200);
  landMasses.push(new LandMass(getPoints({
    x: 550,
    y: 1200
  }, 2, 100)));
  landMasses.push(new LandMass(getPoints({
    x: 550,
    y: -100
  }, 2, 100)));
  landMasses.push(new LandMass(getPoints({
    x: 300,
    y: 550
  }, 20, 100)));

  landMasses.push(new LandMass(getPoints({
    x: 800,
    y: 550
  }, 20, 100)));

  // noLoop()
}

function draw() {
  background(200);
  for (let i = 0; i < landMasses.length; i++) {
    landMasses[i].update();
    if (landMasses.length > 1) {
      let newPolygon = LandMass.checkForCollisions(landMasses)
      if (newPolygon) {
        console.log(landMasses)
        landMasses.push(newPolygon);
      };
    }
    landMasses[i].show();
  }
}

function mouseClicked() {
  background(200);

  for (let i = 0; i < landMasses.length; i++) {
    landMasses[i].update();
    if (landMasses.length > 1) {
      let newPolygon = LandMass.checkForCollisions(landMasses)
      if (newPolygon) {
        console.log(landMasses)
        landMasses.push(newPolygon);
      };
    }
    landMasses[i].show();
  }
}