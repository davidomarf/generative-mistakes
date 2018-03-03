let recursion_depth = 15;

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a, b, c];
    this.sides = [[b, c], [a, c], [a, b]];
  }
}

class Point2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let triangles = [new Triangle(
  new Point2D(100, 100),
  new Point2D(100, 900),
  new Point2D(900, 100)
)]

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

function choosePoint(side) {
  let ratio = Math.random()
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

function createTriangle(triangle) {
  let longestSide = getLongestSide(triangle);
  let keptVertex = longestSide.side[Math.round(Math.random())]
  let newVertex = choosePoint(longestSide.side);
  let smallerTriangle = new Triangle(
    longestSide.vertex,
    keptVertex,
    newVertex
  )
  return (smallerTriangle)
}


function setup() {
  createCanvas(1000, 1000);
  noLoop();
}

function draw() {
  // translate(width / 2, height / 2);
  background(220);
  strokeWeight(2);
  noFill();

  beginShape();
  console.log("jaja")
  drawTriangle(triangles[0], 0)
  endShape(CLOSE)
}

function drawTriangle(triangle, recursion) {
  console.log(recursion)
  if (recursion < recursion_depth) {
    let v = triangle.vertices
    console.log(v)
    line(v[0].x, v[0].y, v[1].x, v[1].y);
    line(v[1].x, v[1].y, v[2].x, v[2].y);
    line(v[2].x, v[2].y, v[0].x, v[0].y)
    drawTriangle(createTriangle(triangle), recursion+1) 
  }
}