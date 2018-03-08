let backgroundColor = [360, 80, 10, 1]
let recursionDepth = 30;
let radiusVariance = .1;
let branchingOdds = 0.1;
// Range in degrees to choose the next step direction
let nextStepRange = 90;

let w = 600, h = 600;

function setup() {
  createCanvas(w, h);
  angleMode(DEGREES)
  noLoop();
  noStroke()
}

function draw() {
  translate(width / 2, height / 2);
  colorMode(HSB);
  background(color(backgroundColor));
  let circle = new Circle(new Vector2D(0, 0), 20, new Vector2D(0, 0));
  for (let i = 0; i < 5; i++) {
    startFlow(circle, 0);
  }
}

function getAngleOriginRadius(circle) {
  if (Vector2D.areEqual(circle.origin, circle.center)) {
    return random() * 360;
  }
  return Vector2D.angleBetween(circle.center, circle.origin);
}

function startFlow(circle, recursion) {
  if (recursion > recursionDepth) {
    return;
  }
  if (random() < branchingOdds) {
    let childAngle = getAngleOriginRadius(circle);
    if (random() > .5){
      childAngle += 90;
    } else {
      childAngle -= 90;
    }
    
    newCircle = circle.createChild(childAngle)
    startFlow(newCircle, recursion);
  }
  ellipse(circle.center.x, circle.center.y, circle.radius, circle.radius);
  let childAngle = getAngleOriginRadius(circle);
  childAngle += random() * nextStepRange - nextStepRange / 2;
  childCircle = circle.createChild(childAngle);
  ellipse(circle.center.x, circle.center.y, circle.radius, circle.radius);
  // drawContinously(circle, childCircle, childAngle);
  startFlow(circle.createChild(childAngle), recursion + 1);
}

function drawContinously(circle, child, angle){
  let distance = Vector2D.dist(circle.center, child.center);
  let radius = circle.radius - child.radius;
  let tangentPoints = circle.externalTangentsWithCircle(child);
  let path = Vector2.substract(child.center, circle.center)
  let step = Math.round(radiusDiff / distance);
  let n = Math.round(distance);

  let center = circle.center; 
  for(let i = 0, radius = circle.radius - step; i < n; i++, radius -= step){
    ellipse(cir, circle.center.y, circle.radius, circle.radius);
  }
}

class Circle {
  constructor(center, radius, origin) {
    this.center = center;
    this.radius = radius;
    this.origin = origin;
  }

  createChild(angle) {
    let radius = this.radius * (random() * (radiusVariance) + 1 - radiusVariance);
    let center = new Vector2D(
      this.center.x + (radius + this.radius) * cos(angle) / 2,
      this.center.y + (radius + this.radius) * sin(angle) / 2);
    let origin = this.center;
    return new Circle(center, radius, origin);
  }

  externalTangentsWithCircle(circle){
    let lines = this.tangentWithPoint(circle.center);
    let tangents = [Vector2D.parallel(lines[0], circle.radius), 
                    Vector2D.parallel(lines[1], circle.radius)];
  }

  tangentWithPoint(a){
    let distance = Vector2D.dist(this.center, a);
    let theta = atan(this.radius/distance);
    let length = sqrt(distance**2 + this.radius **2);
    let angleCenterCenter = Vector2D.angleBetween(a, this.center);
    let alpha = [angleCenterCenter + theta,
                angleCenterCenter - theta];
    let tangents = [new Vector2D(
                      a.x + cos(alpha[0]) * length,
                      a.y + sen(alpha[0]) * length
                      ),
                    new Vector2D(
                      a.x + cos(alpha[1]) * length,
                      a.y + sen(alpha[1]) * length
                      )]
    return tangents;
  }
}

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static angleBetween(a, b) {
    return atan2(a.y - b.y, a.x - b.x);
  }
  static areEqual(a, b) {
    return a.x == b.x && a.y == b.y
  }

  static dist(a, b){
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
  }

  static substract(a, b){
    return new Vector2D(a.x - b.x, a.y - b.y);
  }

  static addition(a, b){
    return new Vector2D(a.x + b.x, a.y + b.y);
  }

  static parallel(a, r){
    
  }
}