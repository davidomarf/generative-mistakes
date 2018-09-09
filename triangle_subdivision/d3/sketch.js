//// Constants ///////////////////////////////////////
// Modifying these, will modify the whole work
// without going deeper in the code

/// Drawing Area ///
const WIDTH = 650
const HEIGHT = 650

/// Randomization parameters ///
// Selection of point for new triangle //
const RANDOM_SCALE = true
const VARIANCE = 8
const FIXED_SCALE = .618

// Recursion //
const MIN_RECURSION_DEPTH = 5
const MAX_RECURSION_DEPTH = 13
const STOPPING_ODDS = .1

/// Drawing Variables ///
// Color space is RGB
const BACKGROUND_COLOR = "rgb(255, 255, 255)"
const BACKGROUND_OPACITY = 0

const FILL_COLOR = "rgb(0, 0, 0)"
const FILL_OPACITY = 0

const STROKE_COLOR = "rgb(73, 78, 82)"
const STROKE_OPACITY = 1
const STROKE_THICKNESS = .2


//// Classes /////////////////////////////////////////

class Triangle {
  constructor(a, b, c) {
    this.vertices = [a, b, c]
    this.sides = [[b, c], [a, c], [a, b]]
    this.center = Vector.midpoint(this.vertices)
  }

  getLongestSide() {
    let longest_side = this.sides[0]
    let opposite_vertex = this.vertices[0]
    let longest_side_length = Vector.dist(this.sides[0])
    if (Vector.dist(this.sides[1]) > longest_side_length) {
      longest_side = this.sides[1]
      opposite_vertex = this.vertices[1]
    }
    if (Vector.dist(this.sides[2]) > longest_side_length) {
      longest_side = this.sides[2]
      opposite_vertex = this.vertices[2]
    }
    console.log("in:", longest_side)
    return [longest_side, opposite_vertex]
  }
}

class Vector {
  constructor(coordinates) {
    this.coordinates = coordinates
    this.dimension = coordinates.length
  }

  static midpoint(vectors) {
    return Vector.sum(vectors).multiply(1 / vectors.length)
  }

  static sum(vectors) {
    if (Vector.same_dimension(vectors)) {
      return new Vector(sumByColumns(vectors.map(v => v.coordinates)))
    }
    else {
      return null
    }
  }

  multiply(scalar) {
    let coordinates = this.coordinates.slice();
    for (let i = 0; i < coordinates.length; i++) {
      coordinates[i] *= scalar
    }
    return new Vector(coordinates)
  }

  static substract(a, b) {
    return Vector.sum([a, b.multiply(-1)])
  }

  static same_dimension(vectors) {
    let dimension = vectors[0].dimension
    for (let i = 0; i < vectors.length; i++) {
      if (vectors[i].dimension != dimension) {
        return false
      }
    }
    return true
  }

  static dist(a) {
    return Vector.substract(a[0], a[1]).magnitude()
  }

  magnitude() {
    return Math.sqrt(this.coordinates.reduce((a, b) => a + b ** 2, 0))
  }
}


function sumByColumns(arr) {
  let res = [];
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      res[j] = (res[j] || 0) + arr[i][j];
    }
  }
  return res
}

//// Helper Functions ////////////////////////////////

function get_ratio() {
  if (RANDOM_SCALE) {
    r = d3.randomNormal()() / VARIANCE + 0.5
    if (r > 1) {
      return 1
    }
    if (r < 0) {
      return 0
    }
    return r
  }
  else {
    return FIXED_SCALE
  }
}

function choosePoint(side) {
  ratio = get_ratio()
  point = Vector.substract(side[0], side[1]).multiply(ratio)
  return Vector.sum([point, side[1]])
}

function create_triangle(triangle) {
  // console.log(triangle)
  
  let [longest_side, opposite_vertex] = triangle.getLongestSide()
  // console.log(triangle, longest_side, opposite_vertex)
  
  new_vertex = choosePoint(longest_side)
  new_triangles = [
    new Triangle(
      opposite_vertex,
      longest_side[0],
      new_vertex
    ),
    new Triangle(
      opposite_vertex,
      longest_side[1],
      new_vertex
    )
  ]
  return new_triangles
}

function create_starting_triangles() {
  return [new Triangle(new Vector([WIDTH, 0]), new Vector([0, HEIGHT]), new Vector([WIDTH, HEIGHT])),
  new Triangle(new Vector([0, 0]), new Vector([0, HEIGHT]), new Vector([WIDTH, 0]))]
}

//// Main drawing function ////

function createTriangleSVG(svgSpace, triangle, recursion) {
  d = triangle.vertices.map(v => v.coordinates).join(" ")
  svgTriangle = svgSpace.append("polygon")
    .attr("points", d)
    .style("fill-opacity", 0)
    .style("stroke", "black")
}

function draw_triangle(svgSpace, triangle, recursion) {
  // console.log(triangle)
  if ((recursion > MIN_RECURSION_DEPTH &&
    (d3.randomUniform()() < STOPPING_ODDS ||
      recursion > MAX_RECURSION_DEPTH))) {
    return
  }

  createTriangleSVG(svgSpace, triangle, recursion)

  new_triangles = create_triangle(triangle)
  draw_triangle(svgSpace, new_triangles[0], recursion + 1)
  draw_triangle(svgSpace, new_triangles[1], recursion + 1)
}

const svgSpace = d3.select("body")
  .append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)

let first_triangles = create_starting_triangles();
draw_triangle(svgSpace, first_triangles[0], 0)
// console.log(first_triangles[1])
draw_triangle(svgSpace, first_triangles[1], 0)

// let b = new Vector([10, 20])
// c = Vector.multiply(b, -1)
// console.log(b.coordinates)
// console.log(c.coordinates)