////  C O N S T A N T S  ////////////////////////////////////
const WIDTH = 1400;
const HEIGHT = 750;

/// Randomness ///
const VARIANCE = 5;
const ANGLE_VARIANCE = 1;

/// River Drawing ///
const RIVER_DIST_STEP = 150;

/// City birth constants ///
const POLYGON_SIDES = 12;
const POLYGON_RADIUS = 15;

/// Resources constants ///
const RESOURCE_CLUSTERS = 3;
const RESOURCE_CLUSTER_RADIUS = 15;
const RESOURCE_CLUSTER_VARIANCE = 13;

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
 * Returns an SVG Drawing space with custom size and background color
 * 
 * @param {number} w      Width of the canvas
 * @param {number} h      Height of the canvas
 * @param {string} color  Color for the background. Name or RGB.
 */
function initializeCanvas(w, h, color) {
  // Create a svgSpace using D3 with custom dimensions
  const svgSpace = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // Create a background (useful for certain debugging purposes)
  svgSpace.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", color);

  return svgSpace;
}

/**
 * Calculates the angle between two points
 * @param {object} a   Start point {x, y}
 * @param {object} b   End point {x, y}
 * 
 * @return {Number}   Angle between a and b
 */
function getAngle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Gets a ratio [0, 1] from a normal distribution with custom variance
 * @param {number} variance   Represent variance of the distribution
 * 
 * @return {Number}   Random number from of a normal distribution
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

/**
 * Sums multiple vectors containing only x and y coordinates
 * 
 * @param {array} vectors   Array with all the vectors to be summed
 *                          each needs to be a {x, y} object
 */
function sumVectors(vectors) {
  let sum = { x: 0, y: 0 };
  for (let i = 0; i < vectors.length; i++) {
    sum.x += vectors[i].x;
    sum.y += vectors[i].y;
  }
  return sum;
}

/////// A C T U A L   A L G O R I T H M S ////////////////

/**
 * Creates a river that goes (roughly) from start to end
 * 
 * @param {array} start   Coordinates [x, y] of first river point
 * @param {array} end     Coordinates [x, y] of last river point
 * 
 * @return {array}  Points of entire river path [[x, y], ...]
 */
function generateRiver(start, end) {
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

/**
 * Draws resource clusters with random size
 * 
 * @param {array} resources     Contains the coordinates of each cluster center
 * @param {svgSpace} svgSpace   SVG element for the cluster to be drawn
 */
function drawResources(resources, svgSpace) {
  for (let i = 0; i < resources.length; i++) {
    let cluster = generatePolygon(5,
      getRatio(RESOURCE_CLUSTER_VARIANCE) * RESOURCE_CLUSTER_RADIUS,
      resources[i]);
    drawPolygon(cluster, svgSpace);
  }
}

/**
 * Creates a polygon with custom center, number of sides, and radius
 * 
 * @param {number} sides    Number of polygon sides
 * @param {number} radius   Distance between center and vertices
 * @param {array} center    Coordinates of center [x, y]
 */
function generatePolygon(sides, radius, center) {
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
 * @param {CityVertex[]} city      Contains all CityVertex of the city
 * @param {svgSpace} svgSpace      SVG Canvas where city will be drawn
 * @param {string} color    The color of the city border
 * @param {number} opacity  Number between 0 and 1 for the border opacity
 */
function drawPolygon(polygon, svgSpace, color, opacity) {
  if (color == null) {
    color = "black"
  }

  if (opacity == null) {
    opacity = 1;
  }

  // Line function to convert array of points into SVG Path notation
  let lineFunction = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .curve(d3.curveBasisClosed);

  // Draw polygon as a path  
  svgSpace.append("path")
    .attr("d", lineFunction(polygon))
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("opacity", opacity);
}


function getNaturalDisplacement(center, vertex, radius, consistency) {
  let angleCenterVertex = getAngle(center, vertex);
  let displacementVector = sumDisplacement({ x: 0, y: 0 },
    (getRatio(ANGLE_VARIANCE * 3 * consistency) + 0.5) * angleCenterVertex,
    radius * 1.2)

  return displacementVector;
}

function getInfluencedDisplacement(vertex, resource, radius) {
  let angleVertexResource = getAngle(vertex, resource);
  let displacementVector = sumDisplacement({ x: 0, y: 0 },
    angleVertexResource,
    radius * .4);

  return displacementVector;
}

/**
 * Grows the city outwards from the center
 * 
 * @param {array} city                Contains the vertex of the city
 * @param {array} center              Contains the original center of the city
 * @param {array} resourceInfluence   Contains explored resources and its influence
 *                                    city territorial expansion
 * @param {number} speed              Speed of growth. Bigger means faster (or further)
 * @param {number} consistency        Avoid random growth direction and distance
 */
function extendCityTerritory(city, center, resourceInfluence, speed, consistency) {
  extendedCity = city.slice();
  for (let i = 0; i < city.length; i++) {
    let distance = distanceBetweenPoints(
      city[i],
      city[(i + 1) % city.length])

    let radius = (getRatio(VARIANCE * consistency) * distance / 2) * speed;

    let naturalDisplacementVector =
      getNaturalDisplacement(center, city[i], radius, consistency);

    let influencedDisplacementVector = { x: 0, y: 0 }

    for (let j = 0; j < resourceInfluence.length; j++) {
      let individualDisplacement = getInfluencedDisplacement(city[i], resourceInfluence[j], radius);
      influencedDisplacementVector.x += individualDisplacement.x
      influencedDisplacementVector.y += individualDisplacement.y
    }
    let newPoint = sumVectors([city[i], naturalDisplacementVector, influencedDisplacementVector]);

    extendedCity[i] = new CityVertex(newPoint.x, newPoint.y, center);
  }
  return extendedCity;
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

function exploreEnvironment(city, center, resources, drawAreas, svgSpace) {
  let exploredArea = city.slice();
  let resourceInfluence = []
  for (let i = 0; i < 10; i++) {
    exploredArea = extendCityTerritory(exploredArea, center, 1, 13, 100)
    if (drawAreas) {
      drawPolygon(exploredArea, svgSpace, "red", 0.2);
    }
    for (let j = 0; j < resources.length; j++) {
      if (d3.polygonContains(exploredArea.map(d => [d.x, d.y]), [resources[j].x, resources[j].y])) {
        drawPolygon(resources[j], svgSpace, "green", .5)
        resourceInfluence.push({
          x: resources[j].x,
          y: resources[j].y,
          distanceToCenter: distanceBetweenPoints(resources[j], center)
        });
        resources.splice(j, 1);
      }
    }
  }

  function compare(a, b) {
    if (a.distanceToCenter < b.distanceToCenter)
      return -1;
    if (a.distanceToCenter > b.distanceToCenter)
      return 1;
    return 0;
  }

  resourceInfluence.sort(compare);
  console.log(resourceInfluence)
  for (let i = 0; i < resourceInfluence.length; i++) {
    Object.assign(resourceInfluence[i], { influence: resourceInfluence.length - i })
  }

  return resourceInfluence;
}

function drawResourceInfluence(influenceNetwork, center, svgSpace) {
  let lineFunction = d3.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .curve(d3.curveLinear);


  for (let i = 0, n = influenceNetwork.length; i < n; i++) {
    svgSpace.append("path")
      .attr("d", lineFunction([influenceNetwork[i], center]))
      .attr("stroke", "green")
      .attr("stroke-width", (n - i))
      .attr("fill", "none")
      .attr("opacity", (n - i) / n);
  }
}

function main() {

  const svgSpace = initializeCanvas(WIDTH, HEIGHT, "white");

  let river = generateRiver({ x: 100, y: 0 }, { x: WIDTH, y: HEIGHT - 100 });
  drawRiver(river, svgSpace);

  let resources = generateResources([WIDTH, HEIGHT]);
  drawResources(resources, svgSpace);

  let cityOrigin = river[Math.floor(Math.random() * river.length)]
  let city = generatePolygon(POLYGON_SIDES, POLYGON_RADIUS, cityOrigin);
  drawPolygon(city, svgSpace);

  let resourceInfluence = exploreEnvironment(city, cityOrigin, resources, true, svgSpace);
  drawResourceInfluence(resourceInfluence, cityOrigin, svgSpace);

  for (let i = 0, n = 25; i < n; i++) {
    city = extendCityTerritory(city, cityOrigin, resourceInfluence, 1, 3)
    drawPolygon(city, svgSpace, "black", 1 - i * (1 / (1.1 * n)));
  }

}

main()