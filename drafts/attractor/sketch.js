const WIDTH = 2048;
const HEIGHT = 2048;

const ANGLE_VISUALIZATION = 0;
const PAN = { x: 1000, y: 1000 };

/**
 * Given a point with 3 coordinates, generates the 2D coordinates to
 * produce a 3D effect with a custom visualization angle in the display
 *
 * @param {number} x    X Coordinate
 * @param {number} y    Y Coordinate
 * @param {number} z    Z Coordinate
 * @param {number} [a = ANGLE_VISUALIZATION]    Angle in degrees
 * @param {number} [pan = VERTICAL_DISPLACEMENT]  Displacement in y axis after transformation
 * @return {Object} 2D Coordinates to display the 3D point
 */
function transform3DCoordinates(x, y, z, a, pan) {
  if (a === undefined) a = ANGLE_VISUALIZATION;
  if (pan === undefined) pan = PAN;
  a = radians(a);
  return { x: pan.x + x, y: pan.y + y * sin(a) - z * cos(a) };
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  noFill();
  strokeWeight(1);
  stroke("rgba(0,0,0, 1)");
  noLoop();
}

function draw() {
  let x = 0;
  let y = 0;
  // let a = random(-2, 2);
  // let b = random(-2, 2);
  // let c = random(-2, 2);
  // let d = random(-2, 2);

  let a = -1.6871952509365062,
    b = -1.1504409246616998,
    c = -1.5941251597680441,
    d = -1.2565441127942272;
  console.log(`a = ${a},\nb = ${b},\nc = ${c},\nd = ${d};\n`);
  let scale = max(abs(c), abs(d)) + 1;
  console.log(scale);
  beginShape();
  for (let i = 0; i < 5000000; i++) {
    let xt = sin(a * y) + c * cos(a * x);
    let yt = sin(b * x) + d * cos(b * y);
    // let zt = z + t * (x * y - c * z);
    x = xt;
    y = yt;
    // z = zt;
    // let coordinates3D = transform3DCoordinates(x, y, z);
    // circle(PAN.x + 400 * x, PAN.y + 400 * y, .1);
    circle(PAN.x + 100 * scale * x, PAN.y + 100 * scale * y, .1);
  }
  endShape();
  console.log("finished");
}
