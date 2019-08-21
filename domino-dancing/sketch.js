const WIDTH = 2048;
const HEIGHT = (5 * WIDTH) / 4;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  noLoop();
  background(225);
}

function draw() {
  stroke(0);
  fill(30);
  for (let i = 2; i < 28; i++) {
    let column = {
      x: i * (WIDTH / 30),
      y: HEIGHT / 2 + randomGaussian(0, 300),
      // y: HEIGHT / 2 + random(-250, 250),
      width: WIDTH / 40,
      height: random(HEIGHT * 0.1, HEIGHT * 0.6)
    };
    column.x = column.x + column.width / 2;
    column.borders = {
      top: column.y - column.height / 2,
      bottom: column.y + column.height / 2,
      left: column.x - column.width / 2,
      right: column.x + column.width / 2
    };
    handDrawRectangleMiddle(
      { x: column.x, y: column.y },
      column.width,
      column.height
    );

    let squares = [];
    for (let j = 0; ; j++) {
      let size = 1;
      if (random() < 0.95) {
        squares.push({
          middle:
            (column.width * j + column.width * 0.5 * (j + (size - 1))) / 2,
          size: 1
        });
      } else {
        squares.push({
          middle:
            (column.width * j + column.width * 0.5 * (j + (size - 1))) / 2,
          size: size
        });
      }
      if (squares[j].middle >= HEIGHT) break;
    }
    push();
    rectMode(CENTER);
    noStroke();
    for (let j = 0; j < squares.length; j++) {
      colorMode(RGB);
      fill(225);

      if (random() > 0.9) {
        colorMode(HSL);
        fill(random([40, 350, 220]), 60, 40);
      }

      if (
        squares[j].middle < column.borders.top ||
        squares[j].middle > column.borders.bottom
      ) {
        fill(`rgba(30, 30, 30, ${1 - abs(HEIGHT / 2 - squares[j].middle) / (HEIGHT / 2)})`);
        if (random() > 0.9) {
          colorMode(HSL);
          fill(random([40, 350, 220]), 60, 40);
        }
        if (random() * 0.9 < abs(HEIGHT / 2 - squares[j].middle) / (HEIGHT / 2))
          continue;
      }

      handDrawRectangleMiddle(
        { x: randomGaussian(column.x, 2), y: randomGaussian(squares[j].middle, 2) },
        column.width * 0.4,
        randomGaussian(column.width * squares[j].size - column.width * 0.75, 6)
      );
    }
    pop();
  }
}

function getCornersFromMiddle(middle, width, height) {
  let halfW = width / 2;
  let halfH = height / 2;
  return [
    { x: middle.x - halfW, y: middle.y - halfH },
    { x: middle.x + halfW, y: middle.y - halfH },
    { x: middle.x + halfW, y: middle.y + halfH },
    { x: middle.x - halfW, y: middle.y + halfH }
  ];
}

function angleBetweenPoints(p1, p2) {
  return atan2(p2.y - p1.y, p2.x - p1.x);
}

function getHandDrawnLine(a, b) {
  noiseSeed(random(1000));
  let distance = dist(a.x, a.y, b.x, b.y);
  let angle = angleBetweenPoints(a, b);
  let internalPoints = distance;
  let pointsInLine = [];
  for (let i = 0; i < internalPoints; i++) {
    pointsInLine.push({
      x: a.x + i * ((distance * cos(angle)) / internalPoints),
      y: a.y + i * ((distance * sin(angle)) / internalPoints)
    });
  }
  for (let i = 0; i < pointsInLine.length; i++) {
    let displacement = 3 * noise(i * 0.2) - 0.5;
    let perpendicular = angle + PI / 2;
    pointsInLine[i].x += displacement * cos(perpendicular);
    pointsInLine[i].y += displacement * sin(perpendicular);
  }

  return pointsInLine;
}

function handDrawRectangleMiddle(middle, width, height) {
  beginShape();
  let corners = getCornersFromMiddle(middle, width, height);
  for (let i = 0; i < 4; i++) {
    let handLine = getHandDrawnLine(
      corners[i],
      corners[(i + 1) % corners.length]
    );
    for (let j = 0; j < handLine.length; j++) {
      vertex(handLine[j].x, handLine[j].y);
    }
  }
  endShape(CLOSE);
}
