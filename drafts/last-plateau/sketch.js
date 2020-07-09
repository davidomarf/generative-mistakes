const WIDTH = 1920;
const HEIGHT = 1920;
const MARGIN = 50;

const ANGLE_VISUALIZATION = 30;

let PALETTE = []

function setup() {

    PALETTE = [
        // color(255,195,73),
        "#292A40",
        "#F2F2F2",
        // color(255,195,73),
        "#292A40",
        "#D99E6A"
    ]
   
    createCanvas(WIDTH, HEIGHT);
    background(PALETTE[PALETTE.length - 1]);
    noFill();
    noLoop();
}

function transform3DCoordinates(x, y, z, a) {
    a = radians(a)
    return { x: x, y: 1000 + y * sin(a) - z * cos(a) }
}

function createVoronoiDiagram(n) {
    for (let i = 0; i < n; i++) {
        voronoiSite(random(WIDTH), random(HEIGHT));
    }
    voronoi(WIDTH, HEIGHT, true);
    return voronoiGetDiagram();
}

function drawEdge3D(edge, height) {
    let a2 = transform3DCoordinates(edge.va.x, edge.va.y, height, ANGLE_VISUALIZATION);
    let b2 = transform3DCoordinates(edge.vb.x, edge.vb.y, height, ANGLE_VISUALIZATION);
    line(a2.x, a2.y, b2.x, b2.y);
}

function getLowerEdges(edges) {
    let lowerEdges = []
    for (let i = 0; i < edges.length; i++) {
        if (edges[i].angle <= 0) break;
        lowerEdges.push(edges[i]);
    }
    return lowerEdges;
}

function joinVertex(edge, height) {
    let bot = transform3DCoordinates(edge.va.x, edge.va.y, 0, ANGLE_VISUALIZATION);
    let bot_2 = transform3DCoordinates(edge.vb.x, edge.vb.y, 0, ANGLE_VISUALIZATION);

    let top = transform3DCoordinates(edge.va.x, edge.va.y, height, ANGLE_VISUALIZATION);
    let top_2 = transform3DCoordinates(edge.vb.x, edge.vb.y, height, ANGLE_VISUALIZATION);

    let angle = degrees(angleBetweenPoints(bot, bot_2)) % 180;

    push()
    beginShape()
    let c;
    if (angle > 90 && angle < 165) {
        c = PALETTE[1]
    } else if (angle < 15 || angle > 165) {
        c = PALETTE[2]
    } else {
        c = PALETTE[3]
    }
    fill(c);
    noStroke();
    // stroke(255);
    vertex(bot.x, bot.y)
    vertex(bot_2.x, bot_2.y)
    vertex(top_2.x, top_2.y)
    vertex(top.x, top.y)
    endShape(CLOSE)
    pop()

}

function angleBetweenPoints(p1, p2) {
    return (
        atan2(p2.y - p1.y, p2.x - p1.x)
    )
}

function drawCell3D(cell, height) {
    let edges = cell.halfedges;
    let lowerEdges = getLowerEdges(edges);
    let cellCenter = edges[0].site;
    for (let edges_i = 0; edges_i < lowerEdges.length; edges_i++) {
        let edge = lowerEdges[edges_i].edge;
        // drawEdge3D(edge, 0)
        joinVertex(edge, height)
    }

    let vertices = []
    for (let edges_i = 0; edges_i < edges.length - 1; edges_i++) {
        let edge = edges[edges_i].edge;
        let a = edge.va;
        let b = edge.vb;
        if (edges_i == 0) {
            vertices.push(a, b);
            continue;
        }

        if (vertices.indexOf(a) == -1) {
            vertices.push(a);
        } else {
            vertices.push(b);
        }
    }
    let vertAng = vertices.slice();
    for (let i = 0; i < vertices.length; i++) {
        vertAng[i] = [
            vertAng[i],
            angleBetweenPoints(cellCenter, vertices[i])
        ]
    }
    vertAng.sort((a, b) => a[1] - b[1])
    push()
    beginShape();
    // noStroke();
    stroke(PALETTE[0]);
    // strokeWeight(2);
    fill(PALETTE[0]);
    for (let vertices_i = 0; vertices_i < vertAng.length; vertices_i++) {
        let v = vertAng[vertices_i][0];
        v = transform3DCoordinates(v.x, v.y, height, ANGLE_VISUALIZATION);
        // circle(v.x, v.y, vertices_i + 2);

        vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop()
}

function draw() {
    let diagram = createVoronoiDiagram(5000);

    let mainSite = Math.round(1550);
    let sites = [mainSite];
    sites = sites.concat(voronoiNeighbors(mainSite));
    let extraSites = [];
    for (let i = 0; i < sites.length; i++) {
        extraSites = extraSites.concat(voronoiNeighbors(sites[i]));
    }
    sites = sites.concat(extraSites)
    sites = [...new Set(sites)];
    sites.sort()

    for (let i = 0; i < diagram.cells.length; i++) {
        let cell = diagram.cells[i];
    // for (let i = 0; i < sites.length; i++) {
    //     let cell = diagram.cells[sites[i]];
        let height = randomGaussian((HEIGHT - cell.site.y) * (HEIGHT - cell.site.y)  * .00037, 3);
        // console.log(cell.site.y);
        if (height < 0) height = 0;
        drawCell3D(cell, height);
        // circle(cell.site.x, cell.site.y, i + 1)
        // voronoiDrawCell(cell.site.x, cell.site.y, cell.site.voronoiId, VOR_CELLDRAW_SITE, false, false);
    }
}