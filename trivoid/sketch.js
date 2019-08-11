const WIDTH = 2000;
const HEIGHT = 2000;

const CELL_SIZE = 10;
const CELLS_IN_MAP = 200;

const BIG_CELL_SIZE = 400;

const NOISE_SCALE = 0.012;
// const NOISE_SEED = 9423;
// const NOISE_SEED = 4450;
const NOISE_SEED = Math.random() * 2000000;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  console.log("Seed: ", NOISE_SEED);
  noiseSeed(NOISE_SEED);
  noLoop();
  background("#101520");
}

function isPointInSet(point, heights, threshold) {
  let cell = { i: floor(point.x / 10), j: floor(point.y / 10) };
  return threshold(heights[cell.i][cell.j]);
}

function distanceBetweenPoints(a, b) {
  return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
}

function isTriangleTooBig(a, b, c, threshold) {
  return (
    distanceBetweenPoints(a, b) > threshold ||
    distanceBetweenPoints(b, c) > threshold ||
    distanceBetweenPoints(a, c) > threshold
  );
}

function draw() {
  let heights = generateHeightMap();
  // createSpacesBetweenCells(heights);

  let points = [];

  for (let c_i = 0; c_i < WIDTH / BIG_CELL_SIZE; c_i++) {
    for (let c_j = 0; c_j < HEIGHT / BIG_CELL_SIZE; c_j++) {
      for (let i = 0; i < 2000; i++) {
        let point = {
          x: random(c_i * BIG_CELL_SIZE, (c_i + 1) * BIG_CELL_SIZE),
          y: random(c_j * BIG_CELL_SIZE, (c_j + 1) * BIG_CELL_SIZE)
        };
        if (isPointInSet(point, heights, e => e > 0.5 && e < 0.7)) {
          points.push(point);
          // circle(point.x, point.y, 1);
        }
      }
      let arr = points.map(e => [e.x, e.y]);

      // Get the Delaunay Triangulation for current Cell
      let delaunay = Delaunator.from(arr);
      push();
      colorMode(HSL);
      noFill();
      strokeWeight(1);
      for (let del_i = 0; del_i < delaunay.triangles.length; del_i += 3) {
        let a = arr[delaunay.triangles[del_i]];
        let b = arr[delaunay.triangles[del_i + 1]];
        let c = arr[delaunay.triangles[del_i + 2]];
        let height = heights[floor(a[0] / 10)][floor(a[1] / 10)];

        let fillColor = color(20 + 40 * height * height, 50, 50);
        stroke(fillColor);
        if (isTriangleTooBig(a, b, c, 30 * height * height)) {
          continue;
        }
        beginShape();
        vertex(a[0], a[1]);
        vertex(b[0], b[1]);
        vertex(c[0], c[1]);
        endShape(CLOSE);

        points = [];
      }
      pop();
    }
  }

  for (let c_i = 0; c_i < WIDTH / BIG_CELL_SIZE; c_i++) {
    for (let c_j = 0; c_j < HEIGHT / BIG_CELL_SIZE; c_j++) {
      for (let i = 0; i < 2000; i++) {
        let point = {
          x: random(c_i * BIG_CELL_SIZE, (c_i + 1) * BIG_CELL_SIZE),
          y: random(c_j * BIG_CELL_SIZE, (c_j + 1) * BIG_CELL_SIZE)
        };
        if (isPointInSet(point, heights, e => e < 0.5 && e > 0.40)) {
          points.push(point);
          // circle(point.x, point.y, 1);
        }
      }
      let arr = points.map(e => [e.x, e.y]);

      // Get the Delaunay Triangulation for current Cell
      let delaunay = Delaunator.from(arr);
      push();
      colorMode(HSL);
      noFill();
      strokeWeight(1);
      for (let del_i = 0; del_i < delaunay.triangles.length; del_i += 3) {
        let a = arr[delaunay.triangles[del_i]];
        let b = arr[delaunay.triangles[del_i + 1]];
        let c = arr[delaunay.triangles[del_i + 2]];
        let height = heights[floor(a[0] / 10)][floor(a[1] / 10)];

        let fillColor = color(0, 50, 100 * height);
        stroke(fillColor);
        if (isTriangleTooBig(a, b, c, 20 - 30 * height * height)) {
          continue;
        }
        beginShape();
        vertex(a[0], a[1]);
        vertex(b[0], b[1]);
        vertex(c[0], c[1]);
        endShape(CLOSE);

        points = [];
      }
      pop();
    }
  }
}

function createSpacesBetweenCells(heights) {
  for (let h_i = 0; h_i < heights.length; h_i++) {
    for (let h_j = 0; h_j < heights[h_i].length; h_j++) {
      if (h_i % 40 === 0 || h_j % 40 === 0) {
        heights[h_i][h_j] = 0;
      }
    }
  }
  return heights;
}

/**
 * Uses noise functions to create a Heights array with n = m
 * @param {number} n            Size n of the heightmap
 * @param {number} noiseScale   Scale of the noise
 *
 * @return {number[]}           Matrix containing height values
 */
function generateHeightMap(n, noiseScale) {
  if (n === undefined) n = CELLS_IN_MAP;
  if (noiseScale === undefined) noiseScale = NOISE_SCALE;
  let heights = [];
  for (let i = 0; i < n; i++) {
    heights.push([]);
    for (let j = 0; j < n; j++) {
      heights[i].push(noise(noiseScale * i, noiseScale * j));
    }
  }
  return heights;
}
