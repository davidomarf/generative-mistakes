////  C O N S T A N T S  ////////////////////////////////////
const WIDTH = 1400;
const HEIGHT = 750;

/// Randomness ///
const VARIANCE = 5;
const ANGLE_VARIANCE = 1;

/// River Drawing ///
const RIVER_DIST_STEP = 150;

/// City birth constants ///
const POLYGON_SIDES = 6;
const POLYGON_RADIUS = 15;

/// Resources constants ///
const RESOURCE_CLUSTERS = 5;
const RESOURCE_CLUSTER_RADIUS = 15;
const RESOURCE_CLUSTER_VARIANCE = 3;

////// H E L P I N G   F U N C T I O N S /////////////////

/**
 * Returns the degrees equivalent of an angle in radians
 * @param {number} angle  Angle in radians
 */
function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

/**
 * Returns the radians equivalent of an angle in degrees
 * @param {number} angle  Angle in degrees
 */
function toRadians(angle) {
  return angle * (Math.PI / 180);
}


/**
 * Calculates the angle between two points
 * @param {array} a   Start point [x, y]
 * @param {array} b   End point [x, y]
 * 
 * @return {Number}   Angle between a and b
 */
function getAngle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Gets a ratio [0, 1] from a normal distribution with custom variance
 * @param {array} a   Start point [x, y]
 * @param {array} b   End point [x, y]
 * 
 * @return {Number}   Angle between a and b
 */
function getRatio(variance) {
  r = d3.randomNormal()() / variance + 0.5
  if (r > 1) {
    return 1
  }
  if (r < 0) {
    return 0
  }
  return r
}

/**
 * Displace a point towards a custom angle with custom distance
 * 
 * @param {object} origin Origin {x, y} for the displacement
 * @param {number} angle  Angle of the displacement
 * @param {number} dist   Distance of the displacement
 */
function sumDisplacement(origin, angle, dist) {
  let endPoint = {
    x: origin.x + dist * Math.cos(angle),
    y: origin.y + dist * Math.sin(angle)
  };

  return endPoint;
}

/////// A C T U A L   A L G O R I T H M S ////////////////


/**
 * Creates a polygon with custom center, number of sides, and radius
 * 
 * @param {number} sides    Number of polygon sides
 * @param {number} radius   Distance between center and vertices
 * @param {array} center    Coordinates of center [x, y]
 */
function createPolygon(sides, radius, center) {
  let polygon = [];
  let angleStep = 360 / sides;
  for (let i = 0, angle = 0; i < sides; i++ , angle += angleStep) {
    let vertex = new CityVertex(
      center.x + radius * Math.cos(toRadians(angle)),
      center.y + radius * Math.sin(toRadians(angle)),
      center
    )
    polygon.push(vertex);
  }
  return polygon;
}

/**
 * Draws a city 
 * 
 * @param {*} city 
 * @param {*} svgSpace 
 */
function drawCity(city, svgSpace) {
  // Line function to convert array of points into SVG Path notation
  let lineFunction = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .curve(d3.curveBasisClosed);

  // Draw river as a path  
  svgSpace.append("path")
    .attr("d", lineFunction(city))
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}

/**
 * Draws a river
 * 
 * @param {array} river   Points of entire river path [[x, y], ...]
 * @param {svg} svgSpace  Canvas where the river will be drawn
 */
function drawRiver(river, svgSpace) {

  // Line function to convert array of points into SVG Path notation
  let lineFunction = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Draw river as a path  
  svgSpace.append("path")
    .attr("d", lineFunction(river))
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}

/**
 * Calculates the Euclidean distance between two points
 * 
 * @param {object} a   Coordinates {x, y} of first point
 * @param {object} b   Coordinates {x, y} of second point
 * 
 * @return {number}   Euclidan distance between a and b 
 */
function distanceBetweenPoints(a, b) {
  return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y))
}

/**
 * Creates a river that goes (roughly) from start to end
 * 
 * @param {array} start   Coordinates [x, y] of first river point
 * @param {array} end     Coordinates [x, y] of last river point
 * 
 * @return {array}  Points of entire river path [[x, y], ...]
 */
function createRiver(start, end) {
  // river contains all the points from start to end.
  // We initialize it with only start point
  let river = [start]

  // head is the last point added to the river: the head
  let head = { x: start.x, y: start.y }

  while (true) {
    // angleHeadEnd is the angle of the line segment beween head and end
    let angleHeadEnd = getAngle(head, end);

    // The new river point created is head with some displacement towards the
    // end of the river. The displacement uses a sligthly perturbed `angleHeadEnd`
    // and a sligthly perturbed distance RIVER_DIST_STEP
    let newRiverPoint = sumDisplacement(head,
      (getRatio(ANGLE_VARIANCE) + .5) * angleHeadEnd,
      getRatio(VARIANCE) * RIVER_DIST_STEP);

    // Add the last generated point to the river and use it as the new head
    river.push(newRiverPoint);
    head = { x: newRiverPoint.x, y: newRiverPoint.y };

    // Check if head is close enough to end point
    if (distanceBetweenPoints(head, end) < RIVER_DIST_STEP) {
      break;
    }
  }

  // Push end as last point
  river.push(end);

  return river;
}

/**
 * Grows the city outwards from the center
 * 
 * @param {array} city    Contains the vertex of the city
 * @param {array} center  Contains the original center of the city
 */
function extendCityTerritory(city, center) {
  extendedCity = city.slice();
  for (let i = 0; i < city.length; i++) {
    let angleCenterVertex = getAngle(center, city[i]);
    let distance = distanceBetweenPoints(
      city[i],
      city[(i + 1) % city.length])
    let newPoint = sumDisplacement(city[i],
      (getRatio(ANGLE_VARIANCE * 3) + 0.5) * angleCenterVertex,
      (getRatio(VARIANCE) * distance / 2))
    extendedCity[i] = new CityVertex(newPoint.x, newPoint.y, center);
  }
  return extendedCity;
}

/**
 * Create random clusters of resources along one area
 * 
 * @param {array} area  Contains maximum values for x and y
 */
function generateResources(area) {
  let resourceClusters = [];
  for (let i = 0; i < RESOURCE_CLUSTERS; i++) {
    resourceClusters.push({
      x: Math.random() * area[0],
      y: Math.random() * area[1]
    });
  }
  return resourceClusters;
}

function drawResources(resources, svgSpace) {
  for (let i = 0; i < resources.length; i++) {
    let cluster = createPolygon(5,
      getRatio(RESOURCE_CLUSTER_VARIANCE) * RESOURCE_CLUSTER_RADIUS,
      resources[i]);
    drawCity(cluster, svgSpace);
  }
}

class CityVertex {
  constructor(x, y, center) {
    this.x = x;
    this.y = y;
    this.center = center;
  }
}

class City {
  constructor(vertices) {
    this.vertices = vertices;
  }
}


function main() {

  // Create a svgSpace using D3 with custom dimensions
  const svgSpace = d3.select("body")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  // Create a background (useful for certain debugging purposes)
  svgSpace.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");

  let river = createRiver({ x: 100, y: 0 }, { x: WIDTH, y: HEIGHT - 100 });
  drawRiver(river, svgSpace);

  let resources = generateResources([WIDTH, HEIGHT]);
  drawResources(resources, svgSpace);

  let cityOrigin = river[Math.floor(Math.random() * river.length)]
  let city = createPolygon(POLYGON_SIDES, POLYGON_RADIUS, cityOrigin);
  for (let i = 0; i < 10; i++) {
    drawCity(city, svgSpace);
    city = extendCityTerritory(city, cityOrigin)
  }
}

main()