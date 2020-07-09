let w = 1920,
  h = 1080,
  backgroundColor = [60, 100, 0, 1],
  thickness = 6,
  startingRadius = 15,
  recursionDepth = 35,
  separationMAX = 1.6,
  angleRange = 0,
  mainColorStroke = 0,
  mainColorFill = 300 ,
  colorVarianceStroke = 40,
  colorVarianceFill = 40;

function setup() {
  createCanvas(w, h);
  angleMode(DEGREES);
  noLoop();
}

function draw() {
  translate(width / 2, height / 2);
  colorMode(HSB)
  background(color(backgroundColor));
  strokeWeight(thickness);
  stroke(mainColorStroke + randomGaussian() * colorVarianceStroke, 10, 95, .005)
  fill(mainColorFill + randomGaussian() * colorVarianceFill, 80, 95, .005)
  // noStroke();
  // noFill();
  let origin = Triangle.firstTriangle(new Vector2D(-500, -300), startingRadius);
  startBranching(origin, 0, 0);
  startBranching(origin, 1, 0);
  startBranching(origin, 2, 0);

  origin = Triangle.firstTriangle(new Vector2D(300, 100), startingRadius);
  startBranching(origin, 0, 0);
  startBranching(origin, 1, 0);
  startBranching(origin, 2, 0);
  
  origin = Triangle.firstTriangle(new Vector2D(-100, 400), startingRadius);
  startBranching(origin, 0, 0);
  startBranching(origin, 1, 0);
  startBranching(origin, 2, 0);
}

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  addHypotenuse(angle, length) {
    return new Vector2D(
      this.x + length * cos(angle),
      this.y + length * sin(angle)
    )
  }

  static angleBetween(a, b) {
    return atan2(a.y - b.y, a.x - b.x);
  }
  static areEqual(a, b) {
    return a.x == b.x && a.y == b.y
  }

  static dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  static substract(a, b) {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }

  static addition(a, b) {
    return new Vector2D(a.x + b.x, a.y + b.y);
  }

  middleWith(a) {
    return new Vector2D((this.x + a.x) / 2, (this.y + a.y) / 2);
  }
}

function getMiddle(arr) {
  let sumx = 0, sumy = 0;
  for (let i = 0; i < arr.length; i++) {
    sumx += arr[i].x;
    sumy += arr[i].y;
  }
  return new Vector2D(sumx / arr.length, sumy / arr.length);
}

function randomTriangleFromSide(side, origin) {
  let mid = getMiddle(side);
  let angle = Vector2D.angleBetween(mid, origin);
  let dist = Vector2D.dist(side[0], side[1]);
  dist *= separationMAX * random();
  if (random() > .5) {
    angle += random() * angleRange;
  } else {
    angle -= random() * angleRange;
  }
  let point = mid.addHypotenuse(angle, dist);
  return new Triangle(side[0], side[1], point);
}

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a, b, c];
    this.sides = [[b, c], [a, c], [a, b]];
    this.midPoint = getMiddle(this.vertices);
  }

  static firstTriangle(center, radius) {
    this.midPoint = center;
    let angles = [330, 90, 210];
    let vertices = [
      center.addHypotenuse(angles[0], radius),
      center.addHypotenuse(angles[1], radius),
      center.addHypotenuse(angles[2], radius)]
    return new Triangle(vertices[0], vertices[1], vertices[2]);
  }

  static randomTriangle(center, radius) {
    this.midPoint = center;
    let angles = [random() * 360, random() * 360, random() * 360];
    let vertices = [
      center.addHypotenuse(angles[0], radius),
      center.addHypotenuse(angles[1], radius),
      center.addHypotenuse(angles[2], radius)]
    return new Triangle(vertices[0], vertices[1], vertices[2]);
  }
  draw() {
    triangle(this.vertices[0].x, this.vertices[0].y,
      this.vertices[1].x, this.vertices[1].y,
      this.vertices[2].x, this.vertices[2].y);
  }
}

function startBranching(triangle, side, recursion) {
  if (recursion > recursionDepth) {
    return;
  }
  stroke(mainColorStroke + randomGaussian() * colorVarianceStroke, 10, 95, .005)
  fill(mainColorFill + randomGaussian() * colorVarianceFill, 80, 95, .005)
  triangle.draw();
  let nextTriangle = randomTriangleFromSide(triangle.sides[side], triangle.midPoint);
  let nextChosenSide = recursion % 2 //floor(random(0, 2));
  if (random() > .75 && recursion > 0) {
    startBranching(nextTriangle, (recursion + 1) % 2, recursion + 1)
  }
  startBranching(nextTriangle, nextChosenSide, recursion + 1);
}