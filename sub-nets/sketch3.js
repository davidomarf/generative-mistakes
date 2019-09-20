class Station {
  constructor(id, name, coordinates, previous = {}, next = {}) {
    this.id = id;
    this.name = name;
    this.coordinates = coordinates;

    this.lines = [];
    this.previous = previous;
    this.next = next;
  }
}

class SubwayLine {
  constructor(id, start, end, stations) {
    this.id = id;
    this.start = start;
    this.end = end;

    this.stations = [start];
    if (stations !== null) this.stations.concat(stations);
    this.stations.push(end);

    this.size = this.stations.length;
    this.intersections = {};

    start.lines.push(this);
    end.lines.push(this);
  }
}

class Network {
  constructor(lines, stations) {
    this.lines = lines;
    this.stations = stations;
    this.totalStations = this.stations.length;
  }
}

let subwayNetwork = new Network([], []);

function setup() {
  createCanvas(1000, 1000);
  noLoop();
}

function draw() {
  for (let i = 0; i < 1; i++) {
    let start = new Station("st-0", "start", {
      x: 100 + random(width / 3),
      y: 100 + random(height / 3)
    });

    let end = new Station("st-1", "end", {
      x: width - random(width / 3),
      y: height - random(height / 3)
    });

    start.isTerminal = true;
    end.isTerminal = true;

    let newLine = createSubwayLine(start, end);

    subwayNetwork.lines = subwayNetwork.lines.concat([newLine]);
    subwayNetwork.totalStations += newLine.size;
    subwayNetwork.stations = subwayNetwork.stations.concat(newLine.stations);
    
    buildVoronoiFromStations();
    buildVoronoiFromStations();
    drawSubwayLine(newLine, i);
  }
}

function buildVoronoiFromStations() {
  let stationList = subwayNetwork.stations.map(e => [
    e.coordinates.x,
    e.coordinates.y
  ]);
  voronoiCellStroke(1);

  voronoiSites(stationList);
  voronoi(width, height, false);

  let diagram = voronoiGetDiagram();
  let siteVertices = diagram.cells.map(e => {
    let site = e.site;
    let station = subwayNetwork.stations.filter(
      e => e.coordinates.x === site.x && e.coordinates.y === site.y
    )[0];
    return {
      site: site,
      vertices: [].concat
        .apply(
          [],
          e.halfedges.map(e => [e.edge.va, e.edge.vb].map(e => [e.x, e.y]))
        )
        .filter(((t = {}), a => !(t[a] = a in t))),
      station: station,
      isTerminal: station.isTerminal
    };
  });

  siteVertices = siteVertices.map(e => {
    return { ...e, vertices: sortVertices(e.vertices, e.site) };
  });

  let areas = siteVertices.map(e => calculatePolygonArea(e));
  colorAreas = normalizeAreas(areas.filter(e => !e.isTerminal));
  let heaviestStation = colorAreas.filter(e => e.areaColor === 1)[0].station;
  heaviestStation.addLine = true;
  voronoiSiteFlag(false);
  
    colorAreas.map(e => {
    push();
    fill(`rgba(180, 20, 20, ${0.2 + e.areaColor * 0.8})`);
    strokeWeight(5);
    stroke(255);
    beginShape();
    for (let i = 0; i < e.vertices.length; i++) {
      vertex(e.vertices[i][0], e.vertices[i][1]);
    }
    endShape(CLOSE);
    pop();
  });

  createNewLineFromStation(heaviestStation);
}

function createNewLineFromStation(station) {
    let n = station.next[station.lines[0].id];
    let p = station.previous[station.lines[0].id];
    // line(n.coordinates.x, n.coordinates.y, p.coordinates.x, p.coordinates.y);
    let angle = angleBetweenPoints(n.coordinates, p.coordinates);
    angle += PI / 2;


    let newStation1 = new Station("ayke", "start", {
      x: station.coordinates.x + cos(angle) * 50,
      y: station.coordinates.y + sin(angle) * 50
    });

    let newStation2 = new Station("kosas", "end", {
      x: station.coordinates.x - cos(angle) * 50,
      y: station.coordinates.y - sin(angle) * 50
    });


    let newLine = new SubwayLine("linea", newStation1, newStation2);
    
    newLine.stations.push(station);
    station.lines.push(newLine);

    station.next[newLine.id] = newStation2;
    station.previous[newLine.id] = newStation1;

    newStation1.next[newLine.id] = station;
    newStation2.previous[newLine.id] = station;

    newStation1.isTerminal = true;
    newStation2.isTerminal = true;

    propagateLineInDirection(newLine, newStation2, angle+PI, "next");
    propagateLineInDirection(newLine, newStation1, angle, "previous");

    subwayNetwork.lines = subwayNetwork.lines.concat([newLine]);
    subwayNetwork.totalStations += newLine.size;
    subwayNetwork.stations = subwayNetwork.stations.concat(newLine.stations);
    
    drawSubwayLine(newLine, 2);
}

function propagateLineInDirection(line, station, angle, order, calls = 0){
  if(calls > 5) return;
  let newAngle = randomGaussian(angle, .25);
  let newStation = new Station(getUniqueID("st-"), "hey",
  {
    x: station.coordinates.x + cos(newAngle) * 70,
    y: station.coordinates.y + sin(newAngle) * 70
  });

  if(order === "next"){
    newStation.previous[line.id] = station;
    station.next[line.id] = newStation;
    line.end = newStation;

  } else {
    newStation.next[line.id] = station;
    station.previous[line.id] = newStation;
    line.start = newStation;
  }
  line.stations.push(newStation)
  propagateLineInDirection(line, newStation, angle, order, calls+1);

  console.log(line);
};

function getUniqueID(prefix){
  return prefix + random(40000)
}

function sortVertices(vertices, center) {
  let angles = vertices.map(e => [
    e,
    angleBetweenPoints(center, { x: e[0], y: e[1] })
  ]);
  return angles.sort((a, b) => a[1] - b[1]).map(e => e[0]);
}

function normalizeAreas(areas) {
  let list = areas.map(e => e.area);

  let maxArea = max(list);
  let minArea = min(list);
  areas = areas.map(e => {
    return { ...e, areaColor: (e.area - minArea) / (maxArea - minArea) };
  });

  return areas;
}

function calculatePolygonArea(site) {
  let total = 0;
  let vertices = site.vertices;
  for (let i = 0, l = vertices.length; i < l; i++) {
    let addX = vertices[i][0];
    let addY = vertices[i == vertices.length - 1 ? 0 : i + 1][1];
    let subX = vertices[i == vertices.length - 1 ? 0 : i + 1][0];
    let subY = vertices[i][1];

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return {
    ...site,
    area: Math.abs(total)
  };
}

function isCloseEnough(a, b, d) {
  return dist(a.x, a.y, b.x, b.y) < d;
}

function insertStation(line, stationA, stationB, station) {
  // Push a new element of the id of the station inside the line
  // structure
  line.stations.push(station.id);

  // Assuming stations is global (or was sent as parameter)
  // Update the next and previous fields for A and B
  stations[stationA.id].next[line.id] = station.id;
  stations[stationB.id].previous[line.id] = station.id;

  // Add the line information to the station
  station.line.push(line.id);

  // Specify the previous and next values for the new station
  // for the corresponding line
  station.previous[line.id] = stationA.id;
  station.next[line.id] = stationB.id;
}

function getNearestStation(line, coordinates) {
  let lines = subwayNetwork.lines;
  let closestStation = {
    station: lines[0].stations[0],
    distance: dist(
      lines[0].stations[0].coordinates.x,
      lines[0].stations[0].coordinates.y,
      coordinates.x,
      coordinates.y
    )
  };
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].id === line.id) continue;
    let stations = lines[i].stations;
    for (let j = 0; j < stations.length; j++) {
      let station = stations[j];
      let distBetweenStations = dist(
        station.coordinates.x,
        station.coordinates.y,
        coordinates.x,
        coordinates.y
      );

      if (distBetweenStations < closestStation.distance) {
        closestStation = {
          station: station,
          distance: distBetweenStations
        };
      }
    }
  }
  return closestStation;
}

function createStationWithCoordinates(line, coordinates) {
  if (subwayNetwork.lines.length === 0) {
    let newStation = new Station(
      "st-" + floor(random(1000)),
      "test",
      coordinates
    );
    newStation.isTerminal = false;
    return newStation;
  }

  let distance = 150;
  let nearestStation = getNearestStation(line, coordinates);
  let newStation = null;
  if (
    nearestStation.distance < distance &&
    !line.intersections[nearestStation.station.lines[0]]
  ) {
    line.intersections[nearestStation.station.lines[0]] =
      nearestStation.station.id;
    newStation = nearestStation.station;
  } else {
    newStation = new Station("st-" + floor(random(1000)), "test", coordinates);
    newStation.isTerminal = false;
  }

  return newStation;
}

/**
 * Recursive function to create intermediate stations between two stations
 * @param {Vector[]}  line        Array of the stations in the line
 * @param {Vector}    a           Start of the section
 * @param {Vector}    b           End of the section
 * @param {number}    distance    The threshold to decide whether to create one more station or not
 * @param {number}    iteration   The current iteration of the function
 *
 * @return {Vector}   Indicates the coordinates of the new station
 */
function createIntermediateStations(
  line,
  stationA,
  stationB,
  distance,
  iteration
) {
  let a = stationA.coordinates;
  let b = stationB.coordinates;
  if (isCloseEnough(a, b, distance)) {
    return;
  }

  let stationDistance = dist(a.x, a.y, b.x, b.y);
  let angle = angleBetweenPoints(a, b);

  let ratio = randomGaussian(0.5, 0.05);

  let newStationCoordinates = {
    x: a.x + cos(angle) * stationDistance * ratio,
    y: a.y + sin(angle) * stationDistance * ratio
  };

  let newStation = createStationWithCoordinates(line, newStationCoordinates);

  stationA.next[line.id] = newStation;
  stationB.previous[line.id] = newStation;

  newStation.next[line.id] = stationB;
  newStation.previous[line.id] = stationA;

  newStation.lines.push(line);

  line.stations.push(newStation);
  line.size++;

  if (newStation.lines.length == 1) {
    newStation.coordinates = warpPoint(
      newStation.coordinates,
      angle,
      100 / (iteration + 1)
    );
  }
  createIntermediateStations(
    line,
    stationA,
    newStation,
    distance,
    iteration + 1
  );

  createIntermediateStations(
    line,
    newStation,
    stationB,
    distance,
    iteration + 1
  );
}

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && (0 < gamma && gamma < 1);
  }
}

function createSubwayLine(start, end) {
  let newLine = new SubwayLine("ln-" + floor(random(100000)), start, end);

  createIntermediateStations(newLine, newLine.start, newLine.end, 100, 0);

  return newLine;
}

function drawSubwayLine(subwayLine, i) {
  let station = subwayLine.start;
  colorMode(HSL);
  let strokeHue = 122;
  stroke(strokeHue, 0, 0);
  strokeWeight(5);
  while (station !== undefined) {
    if (station.id !== subwayLine.start.id) {
      let previous = station.previous[subwayLine.id];
      line(
        previous.coordinates.x,
        previous.coordinates.y,
        station.coordinates.x,
        station.coordinates.y
      );
    }
    station = station.next[subwayLine.id];
  }

  station = subwayLine.start;
  while (station !== undefined) {
    if (station.lines.length > 1) {
      push();
      fill("white");
      stroke("black");
      strokeWeight(3.5);
      circle(station.coordinates.x, station.coordinates.y, 8.5);
      pop();
    } else {
      fill("white");
      strokeWeight(2.5);
      if (station.addLine) {
        push();
        fill("red");
        strokeWeight(5);
        stroke("white");
        circle(station.coordinates.x, station.coordinates.y, 10);
        pop();
      } else {
        circle(station.coordinates.x, station.coordinates.y, 6.5);
      }
    }
    station = station.next[subwayLine.id];
  }
}

function warpPoint(p, angle, distance) {
  angle += PI / 2;
  let warpingDistance = randomGaussian(0, 1) * distance;
  let newPoint = {
    x: p.x + cos(angle) * warpingDistance,
    y: p.y + sin(angle) * warpingDistance
  };
  return newPoint;
}

/**
 * Angle of the line that joins two different points
 *
 * @param {Object} p1   {x, y} coordinates of the first point
 * @param {Object} p2   {x, y} coordinates of the second point
 * @returns {number}    Angle in radians
 */
function angleBetweenPoints(p1, p2) {
  return atan2(p2.y - p1.y, p2.x - p1.x);
}
