let backgroundColor = [360, 0, 90, 1]
let randomTriangles = false;
let variance = 10;
let fixedScale = .5;
let recursion_depth = 17;
let alpha = .2;
let border = 0;
let thickness = .2;
let stopOdds = 00;

let w = 1080, h = 1080;

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a, b, c];
    this.sides = [[b, c], [a, c], [a, b]];
    this.midPoint = new Point2D(
      (a.x + b.x + c.x) / 3,
      (a.y + b.y + c.y) / 3
    )
  }
}

class Point2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let triangles = [new Triangle(
  new Point2D(border, border),
  new Point2D(border, h - border),
  new Point2D(w - border, border)
)]

triangles.push(new Triangle(
  new Point2D(border, h - border),
  new Point2D(w - border, border),
  new Point2D(w - border, h - border)
))

function getSideDistance(sides) {
  let a = sides[0], b = sides[1];
  return Math.sqrt(((a.x - b.x) ** 2) + ((a.y - b.y) ** 2))
}

function getLongestSide(triangle) {
  let longestSide = {
    side: triangle.sides[0],
    distance: getSideDistance(triangle.sides[0]),
    vertex: triangle.vertices[0]
  }

  for (let i = 1; i < triangle.sides.length; i++) {
    let sideDistance = getSideDistance(triangle.sides[i])
    if (sideDistance > longestSide.distance) {
      longestSide.side = triangle.sides[i];
      longestSide.distance = sideDistance;
      longestSide.vertex = triangle.vertices[i];
    }
  }
  return longestSide;
}

function getRatio() {
  if (randomTriangles) {
    let r = randomGaussian() / variance + 0.5;
    if (r > 1) return 1;
    if (r < 0) return 0;
    return r;
  }
  else {
    return fixedScale
  }
}

function choosePoint(side) {
  let ratio = getRatio()
  let point = new Point2D(
    side[1].x - side[0].x,
    side[1].y - side[0].y
  )

  point.x *= ratio;
  point.y *= ratio;

  point.x += side[0].x;
  point.y += side[0].y;

  return point;
}

function createTriangles(triangle, chosenVertex) {
  let longestSide = getLongestSide(triangle);
  let newVertex = choosePoint(longestSide.side);
  let newTriangles = [
    new Triangle(
      longestSide.vertex,
      longestSide.side[0],
      newVertex
    ),
    new Triangle(
      longestSide.vertex,
      longestSide.side[1],
      newVertex
    )
  ]
  return (newTriangles)
}


function setup() {
  createCanvas(w, h);
  noLoop();
}

function draw() {
  // translate(width / 2, height / 2);
  colorMode(HSB)
  background(color(backgroundColor));
  strokeWeight(thickness);
  noFill();
  drawTriangle(triangles[0], 0, recursion_depth)
  drawTriangle(triangles[1], 0, recursion_depth)
}

function drawTriangle(triangle, recursion, max_recursion) {
  
  if ((random() < stopOdds) ||
    (recursion > max_recursion)) {
    return
  }

  
  let v = triangle.vertices
  let mp = triangle.midPoint
  
  stroke(0, 100, 0, alpha)
  
  // bezier(v[0].x, v[0].y, mp.x, mp.y, mp.x, mp.y, v[1].x, v[1].y)
  // bezier(v[1].x, v[1].y, mp.x, mp.y, mp.x, mp.y, v[2].x, v[2].y)
  // bezier(v[2].x, v[2].y, mp.x, mp.y, mp.x, mp.y, v[0].x, v[0].y)
  line(v[0].x, v[0].y, v[1].x, v[1].y);
  // stroke(0, 100, 50, alpha)
  line(v[1].x, v[1].y, v[2].x, v[2].y);
  // stroke(100, 100, 80, alpha)
  line(v[2].x, v[2].y, v[0].x, v[0].y);
  // point(mp.x, mp.y)
  let triangles = createTriangles(triangle)
  drawTriangle(triangles[0], recursion + 1, max_recursion)
  drawTriangle(triangles[1], recursion + 1, max_recursion)
}
