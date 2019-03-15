var img;

function preload() {
  img = loadImage('ham.jpg');
  // img = loadImage('http://www.petwebsite.com/hamsters/hamsters_images/syrian-hamster_000008437184.jpg');
}

function setup() {
  createCanvas(400, 400);
  // img = createImage('http://www.petwebsite.com/hamsters/hamsters_images/syrian-hamster_000008437184.jpg');
  // img.hide();
  // background(100);
  // loadImage('hamster.jpg', imageLoaded);
  // image(img, 0, 0);  
  noLoop();

}

function draw() {
  image(img, 0, 0, 400, 400);
  // loadPixels();
}

// function imageLoaded(img) {
//   image(img, 0, 0);
// }