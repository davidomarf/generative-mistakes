var landMasses = [];

function setup() {
  createCanvas(600, 600);
  landMasses.push(new LandMass(getPoints({x: 300, y: 300}, 30, 30)));

}

function draw() {
  background(200);
  landMasses[0].update();
  landMasses[0].show();
}