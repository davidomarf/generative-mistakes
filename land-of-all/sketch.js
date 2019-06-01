const WIDTH = 2200;
const HEIGHT = 2200;
const MARGIN = 50;

const CELL_SIZE = 10;

const ANGLE_VISUALIZATION = 90;
const VERTICAL_DISPLACEMENT = 0;

const NOISE_SCALE = 0.012;
const CELLS_IN_MAP = 220;

const MAXIMUM_HEIGHT = 800;

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
  if (pan === undefined) pan = VERTICAL_DISPLACEMENT;
  a = radians(a)
  return { x: x, y: pan + y * sin(a) - z * cos(a) }
}


function setup() {
  createCanvas(WIDTH, HEIGHT);
  background("#EEE8CC");
  noLoop();
}

function defineVoxelsFromHeightmap(heights) {
  let voxels = []
  for (let i = 0; i < heights.length - 1; i++) {
    voxels.push([])
    for (let j = 0; j < heights[i].length - 1; j++) {
      let voxel = {
        id: j * heights[0].length + i,
        i: i,
        j: j,
        x: i * CELL_SIZE,
        y: j * CELL_SIZE,
        z: [
          heights[i][j] * MAXIMUM_HEIGHT,
          heights[i + 1][j] * MAXIMUM_HEIGHT,
          heights[i + 1][j + 1] * MAXIMUM_HEIGHT,
          heights[i][j + 1] * MAXIMUM_HEIGHT],
        isInCurve: {}
      }
      voxel.max = max([voxel.z[0], voxel.z[1], voxel.z[2], voxel.z[3]]);
      voxel.min = min([voxel.z[0], voxel.z[1], voxel.z[2], voxel.z[3]]);

      voxels[i].push(voxel)
    }
  }
  return voxels;
}

function drawMapFromVoxels(voxels) {
  for (row of voxels) {
    for (voxel of row) {
      drawVoxel(voxel);
    }
  }
}

function generateHeightMap(n, noiseScale) {
  if (n === undefined) n = CELLS_IN_MAP;
  if (noiseScale === undefined) noiseScale = NOISE_SCALE
  let heights = []
  for (let i = 0; i < n; i++) {
    heights.push([])
    for (let j = 0; j < n; j++) {
      heights[i].push(
        noise(noiseScale * i, noiseScale * j)
      );
    }
  }
  return heights;
}

function draw() {
  let heights = generateHeightMap();
  let voxels = defineVoxelsFromHeightmap(heights);
  drawMapFromVoxels(voxels);

  let areas = getAreasFromVoxels(voxels);
}

function isHeightInVoxel(h, v) {
  return (v.max > h && v.min < h);
}

function getHeightPointProportion(h, a, b) {
  let min = min(a, b);
  let max = a + b - min;
  return ((h - min) / (max - min));
}

function addVertexToCurve(v) {
  let coordinates3D = transform3DCoordinates(v.x, v.y, v.z[0]);
  vertex(coordinates3D.x, coordinates3D.y)
}

function interpolateHeight(v, h, origin) {
  let skip = (origin + 2) % v.z.length;
  let d = 0;
  let edge = 0;
  for (let i = 0; i < v.z.length; i++) {
    if (i === skip) continue;
    let a = v.z[i]
    let b = v.z[(i + 1) % v.z.length]
    if (a < h && b > h || a > h && b < h) {
      let p = (h - a) / (b - a);
      d = p * CELL_SIZE;
      edge = i;
    }
  }

  let point = {
    x: v.x,
    y: v.y,
    z: h
  }

  let c = transform3DCoordinates(point.x, point.y, point.z)

  // console.log(origin, edge)
  // console.log(point)
  if (edge === 0) {
    point.x += d;
    push()
    fill("blue")
    noStroke()
    // circle(c.x, c.y, 4)
    pop()
  }
  if (edge === 1) {
    point.x += CELL_SIZE;
    point.y += d;
    push()
    fill("yellow")
    noStroke()
    // circle(c.x, c.y, 4)
    pop()
  }
  if (edge === 2) {
    push()
    noStroke()
    fill("red")
    // circle(c.x, c.y, 4)
    pop();
    point.x += CELL_SIZE - d;
    point.y += CELL_SIZE;
  }
  if (edge === 3) {
    push()
    noStroke()
    fill("green")
    // circle(c.x, c.y, 4)
    pop();
    point.y += CELL_SIZE - d;
  }

  // console.log(point);

  return point;
}

function getHeightCurve(h, voxel, voxels) {
  let origin = -1;
  let curvePoints = [voxel];
  let n = voxels.length;
  let counter = 0;



  while (counter < n * 3) {
    counter++
    let i = voxel.i;
    let j = voxel.j;

    // for(let i = 0; i < 4; i++){
    //   if (i == origin)continue;
    // }

    if (origin != 0 && j > 0 && isHeightInVoxel(h, voxels[i][j - 1])) {
      voxel = voxels[i][j - 1]
      if (!voxel.isInCurve[h]) {
        origin = 2;
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
        voxel.isInCurve[h] = true;
        continue;
      }
      if (curvePoints[0].id === voxel.id) {
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
      };
    }
    if (origin != 1 && i + 1 < n && isHeightInVoxel(h, voxels[i + 1][j])) {
      voxel = voxels[i + 1][j]
      if (!voxel.isInCurve[h]) {
        origin = 3;
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
        voxel.isInCurve[h] = true;
        continue;
      }
      if (curvePoints[0].id === voxel.id) {
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
      };
    }
    if (origin != 2 && j + 1 < n && isHeightInVoxel(h, voxels[i][j + 1])) {
      voxel = voxels[i][j + 1]
      if (!voxel.isInCurve[h]) {
        origin = 0;
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
        voxel.isInCurve[h] = true;
        continue;
      }
      if (curvePoints[0].id === voxel.id) {
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
      };
    }
    if (origin != 3 && i > 0 && isHeightInVoxel(h, voxels[i - 1][j])) {
      voxel = voxels[i - 1][j]
      if (!voxel.isInCurve[h]) {
        origin = 1;
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
        voxel.isInCurve[h] = true;
        continue;
      }
      if (curvePoints[0].id === voxel.id) {
        let p = interpolateHeight(voxel, h, origin);
        curvePoints.push({ x: p.x, y: p.y, z: p.z });
      };
    }
    break;
  }

  push()
  noFill()
  stroke(100);
  if (h % 50 == 0) { strokeWeight(2); stroke(0) }
  beginShape();
  for (let i = 0; i < curvePoints.length; i++) {
    let cp3D = curvePoints[i];
    cp3D = transform3DCoordinates(cp3D.x, cp3D.y, cp3D.z);
    vertex(cp3D.x, cp3D.y);
  }
  endShape();
  pop();
  let last = curvePoints[curvePoints.length - 1];
  let i = last.i;
  let j = last.j;
}

function getAreasFromVoxels(voxels) {
  let testHeight = 500;
  let h = testHeight;
  for (let h = 0; h < MAXIMUM_HEIGHT; h += 10) {
    for (let i = 0; i < voxels.length; i++) {
      for (let j = 0; j < voxels[i].length; j++) {
        let voxel = voxels[i][j];
        if (voxel.isInCurve[h]) continue;
        let max = 0;
        let min = 0;
        if (isHeightInVoxel(h, voxel)) {
          getHeightCurve(h, voxel, voxels);
          // i = voxels.length;
          // break;
        }
      }
    }
    console.log("finished h", h);
  }
}

function drawVoxel(voxel, heightFactor) {
  if (heightFactor === undefined) heightFactor = MAXIMUM_HEIGHT;
  beginShape()
  noStroke()
  let color = "#FFFFFF"
  if (voxel.z[0] > 300) { color = "#009922" } else { color = "#222299" }
  fill(color);
  let voxel3D = {
    a: transform3DCoordinates(voxel.x, voxel.y, voxel.z[0]),
    b: transform3DCoordinates(voxel.x + CELL_SIZE, voxel.y, voxel.z[1]),
    c: transform3DCoordinates(voxel.x + CELL_SIZE, voxel.y + CELL_SIZE, voxel.z[2]),
    d: transform3DCoordinates(voxel.x, voxel.y + CELL_SIZE, voxel.z[3])
  };
  vertex(voxel3D.a.x, voxel3D.a.y);
  vertex(voxel3D.b.x, voxel3D.b.y);
  vertex(voxel3D.c.x, voxel3D.c.y);
  vertex(voxel3D.d.x, voxel3D.d.y);
  endShape(CLOSE)

}