let dark = 30;
let light = 220;

let MIN_HEIGHT = 0;
let MAX_HEIGHT = 0.5;

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
  randomSeed(RANDOM_SEED);
  noiseSeed(NOISE_SEED);

  // Set a background color
  strokeWeight(STROKE_WEIGHT);
  background(light);

  let CELL_SIZE = [width / MAZE_CELLS_W, height / MAZE_CELLS_H];

  let field = [];
  for (let i = 0; i < MAZE_CELLS_W; i++) {
    field.push([]);
    for (let j = 0; j < MAZE_CELLS_H; j++) {
      field[i].push(noise(i * NOISE_SCALE, j * NOISE_SCALE));
    }
  }

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      let x = i * CELL_SIZE[0];
      let y = j * CELL_SIZE[1];
      let c = [height / 2, width / 2];
      let d = dist(x, y, c[0], c[1]);

      if (d < Number(CIRCLE_RADIUS)) {
        field[i][j] = 1 - field[i][j];
      }
    }
  }

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      let h = field[i][j];
      if (h > Number(MAX_HEIGHT) || h < Number(MIN_HEIGHT)) {
        continue;
      }

      if (round(h * DISCRETE_LEVELS * 2) % 2 === 0) continue;

      let x = i * CELL_SIZE[0];
      let y = j * CELL_SIZE[1];
      let c = [height / 2, width / 2];

      let d = dist(x, y, c[0], c[1]);

      let sw = STROKE_WEIGHT;
      let dw = DRAWING_PROBABILITY;
      let sc = dark;
      if (d < CIRCLE_RADIUS) {
        sw = STROKE_WEIGHT * THICKNESS_PROPORTION;
        dw = DRAWING_PROBABILITY;
        sc = dark;
      }


      if (random() > dw) {
        continue;
      }
      
      let dtb = min([
        x,
        width - x,
        y,
        height-y
      ])

      if(dtb <  400 * abs(randomGaussian())) continue;

      strokeWeight(sw);
      stroke(sc)
      
      let mazeLine = [
        (i + 1) * CELL_SIZE[0],
        j * CELL_SIZE[1],
        i * CELL_SIZE[0],
        (j + 1) * CELL_SIZE[1]
      ];
      if (random() > 0.5) {
        mazeLine = [
          i * CELL_SIZE[0],
          j * CELL_SIZE[1],
          (i + 1) * CELL_SIZE[0],
          (j + 1) * CELL_SIZE[1]
        ];
      }

      line(mazeLine[0], mazeLine[1], mazeLine[2], mazeLine[3]);
    }
  }
}
