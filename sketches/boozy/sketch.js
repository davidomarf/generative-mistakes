/**
 * Standard function of p5js
 */
function setup() {
  createCanvas(DIMENSIONS[0], DIMENSIONS[1]).parent("artwork-container");
  noLoop();
}

/**
 * Standard function of p5js
 */
function draw() {
  // Use the same seed for every time setup is called.
  // (These are generated and initialized by Ginpar)
  randomSeed(RANDOM_SEED);
  noiseSeed(NOISE_SEED);

  colorMode(HSL);

  let palette = {
    light: [147, 26, 93],
    dark: [0, 0, 70],
    main: [185, 59, 34],
    accent: [9, 99, 65]
  };

  // Set a background color
  background(palette.light);


  strokeWeight(STROKE_WEIGHT);

  let CELL_SIZE = [width / GRID_COLS, height / GRID_ROWS];

  let field = [];

  for (let i = 0; i <= GRID_COLS; i++) {
    field.push([]);
    for (let j = 0; j <= GRID_ROWS; j++) {
      field[i].push(true);
    }
  }

  let walkers = [];

  for (let i = 0; i < NUMBER_WALKERS; i++) {
    walkers.push([[floor(random(GRID_COLS)), floor(random(GRID_ROWS))]]);
  }
  let maxRepetitions = 5000;
  while (countEmpty(field) && maxRepetitions > 0) {
    maxRepetitions--;
    for (let i = 0; i < walkers.length; i++) {
      let lastPoint = walkers[i][walkers[i].length - 1];
      let nextPoint = [
        lastPoint[0] + randomUnit(),
        lastPoint[1] + randomUnit()
      ];

      if (isOutsideBorders(nextPoint)) {
        continue;
      }

      if (field[nextPoint[0]][nextPoint[1]]) {
        walkers[i].push(nextPoint);
        field[nextPoint[0]][nextPoint[1]] = false;
      }
    }
  }

  for (let i = 0; i < walkers.length; i++) {
    let w = walkers[i];
    stroke(palette.main);
    if (random() < PROBABILITY_ACCENT) {
      stroke(palette.accent);
    }
    for (let j = 1; j < w.length; j++) {
      line(
        w[j - 1][0] * CELL_SIZE[0],
        w[j - 1][1] * CELL_SIZE[1],
        w[j][0] * CELL_SIZE[0],
        w[j][1] * CELL_SIZE[1]
      );
    }
  }
}

function randomUnit() {
  return random([-1, 0, 1]);
}

function countEmpty(field) {
  return field.filter(e => e.filter(a => a).length > 0).length > 0;
}

function isOutsideBorders(point) {
  // point = [x, y]
  return (
    point[0] < MARGIN ||
    point[0] > GRID_COLS - MARGIN ||
    point[1] < MARGIN ||
    point[1] > GRID_ROWS - MARGIN
  );
}
