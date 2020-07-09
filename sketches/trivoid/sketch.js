// Size of the cells for the heightmap
const CELL_SIZE = 10;
const CELLS_IN_MAP = 200;

// The big squares that contain each Delaunay triangulation
const BIG_CELL_SIZE = 400;

// The seed for the noise, so I can keep track of nice ones.
// Known seeds to produce nice outputs: 9423, 4450, 1780271
const NOISE_SEED = Math.random() * 2000000;

/**
 * Standard function of p5js
 */
function setup() {
  createCanvas(DIMENSIONS[0], DIMENSIONS[1]).parent("artwork-container");
  noiseSeed(NOISE_SEED);
  console.log("Seed: ", NOISE_SEED);

  // Set a dark blueish color as background
  background("#0f191f");

  // Call draw() only once
  noLoop();
}

/**
 * Standard function of p5js
 */
function draw() {
  // Create the heightmap
  let heights = generateHeightMap();
  // createSpacesBetweenCells(heights, 40);
 
  background(color(`hsl(${COLOR_HUE}, 10%, 5%)`));

  // Create the filling instructions for each section
  let sections = [
    {
      heights: heights,
      pointAttempts: POINT_SATURATION,
      rangeLambda: e => e < 0.5 && e > 0.35,
      thresholdLambda: e => e * B_TRIANGLE_THRESHOLD,
      colorLambda: e => [COLOR_HUE, 50, 45]
    },
    {
      heights: heights,
      pointAttempts: POINT_SATURATION,
      rangeLambda: e => e > 0.6 && e < 0.75,
      thresholdLambda: e => e * A_TRIANGLE_THRESHOLD,
      colorLambda: e => [COLOR_HUE, 50, 70]
    },
    {
      heights: heights,
      pointAttempts: POINT_SATURATION,
      rangeLambda: e => e < 0.25,
      thresholdLambda: e => C_TRIANGLE_THRESHOLD,
      colorLambda: e => [COLOR_HUE, 90, 95]
    }
  ];

  // Fill each section
  sections.map(e => fillWithTriangles(e));
}

/**
 * Apply a callback function to the cell that contains a continuos point
 *
 * @param {Object} point        Coordinates of the point {x, y}
 * @param {number[][]} heights  Heightmap with values between 0 and 1
 * @param {Function} callback   Function to apply to the heightmap cell
 *
 * @returns {}                  callback(heights[i][j])
 */
function isPointInSet(point, heights, callback) {
  // Obtain the cell that the point is in
  let cell = { i: floor(point.x / 10), j: floor(point.y / 10) };
  return callback(heights[cell.i][cell.j]);
}

/**
 * Get the distance between two points
 * @param {number[]} a  Point containing coordinates [x, y]
 * @param {number[]} b  Point containing coordinates [x, y]
 *
 * @returns {number}    Distance between a and b
 */
function distanceBetweenPoints(a, b) {
  return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
}

/**
 * Checks if any of the sides of the triangle exceeds a threshold
 *
 * @param {number[]} a        Point containing coordinates [x, y]
 * @param {number[]} b        Point containing coordinates [x, y]
 * @param {number[]} c        Point containing coordinates [x, y]
 * @param {number} threshold  Threshold to compare the distances to
 *
 * @returns {boolean}         True if any distance is greater than threshold
 */
function isTriangleTooBig(a, b, c, threshold) {
  return (
    distanceBetweenPoints(a, b) > threshold ||
    distanceBetweenPoints(b, c) > threshold ||
    distanceBetweenPoints(a, c) > threshold
  );
}

function fillWithTriangles(instructions) {
  // Parse the filling instrunctions
  let {
    heights,
    pointAttempts,
    rangeLambda,
    thresholdLambda,
    colorLambda
  } = instructions;

  // Initialize the set of points that will produce the Delaunay triangulation
  let points = [];

  for (let c_i = 0; c_i < DIMENSIONS[0] / BIG_CELL_SIZE; c_i++) {
    for (let c_j = 0; c_j < DIMENSIONS[1] / BIG_CELL_SIZE; c_j++) {
      for (let i = 0; i < pointAttempts; i++) {
        // Get a random point inside the current square
        let point = {
          x: random(c_i * BIG_CELL_SIZE, (c_i + 1) * BIG_CELL_SIZE),
          y: random(c_j * BIG_CELL_SIZE, (c_j + 1) * BIG_CELL_SIZE)
        };

        // Check if the height for the point is within range
        if (isPointInSet(point, heights, rangeLambda)) {
          // Add it to the set of points
          points.push(point);
        }
      }

      // Transform a {x, y} array into a [x, y] array
      let arr = points.map(e => [e.x, e.y]);

      // Get the Delaunay Triangulation for the current Cell
      let delaunay = Delaunator.from(arr);

      // Push new p5js style configuration values
      push();

      colorMode(HSL);
      noFill();
      strokeWeight(0.5);

      // Go through all the triangles inside the Delaunay triangulation
      for (let del_i = 0; del_i < delaunay.triangles.length; del_i += 3) {
        // triangles[i], triangles[i+1], triangles[i+2] represent the vertices of each triangle
        // Each i = n * 3 - 1 represents the begginning of a different triangle
        let a = arr[delaunay.triangles[del_i]];
        let b = arr[delaunay.triangles[del_i + 1]];
        let c = arr[delaunay.triangles[del_i + 2]];

        // Calculate the height of the first vertex
        let height = heights[floor(a[0] / 10)][floor(a[1] / 10)];

        // If any side if the triangle is bigger than a threshold, continue
        if (isTriangleTooBig(a, b, c, thresholdLambda(height))) {
          continue;
        }
        // Calculate the color using the height value of the triangle
        let fillColor = color(colorLambda(height));

        // Change the stroke color for the p5js functions
        stroke(fillColor);

        // Create a p5js shape using the vertices and close it
        beginShape();
        vertex(a[0], a[1]);
        vertex(b[0], b[1]);
        vertex(c[0], c[1]);
        endShape(CLOSE);

        // Restart the set of points for the next big square
        points = [];
      }
      pop();
    }
  }
}

/**
 * Set the height = 0 for every cell nth cell in row or column direction
 *
 * @param {number[][]} heights  Heightmap with values between 0 and 1
 * @param {number} n            Integer that indicates the nth cell
 *
 * @returns {number[][]}        Updated heightmap
 */
function createSpacesBetweenCells(heights, n) {
  for (let h_i = 0; h_i < heights.length; h_i++) {
    for (let h_j = 0; h_j < heights[h_i].length; h_j++) {
      if (h_i % n === 0 || h_j % n === 0) {
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
