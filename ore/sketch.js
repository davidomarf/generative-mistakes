const WIDTH = 2200;
const HEIGHT = 2200;
const MARGIN = 200;

const CELL_SIZE = 300;
const CELL_MARGIN = 0;

const ANGLE_VISUALIZATION = 30;

let PALETTE = []

function setup() {

    PALETTE = [
        "#d6e7f5",
        "#F76F8E",
        "#4c4e76",
        "#598392",
        "#292A40"
    ]


    createCanvas(WIDTH, HEIGHT);
    background(PALETTE[PALETTE.length - 1]);
    noFill();
    noLoop();
}

function transform3DCoordinates(x, y, z, a) {
    a = radians(a)
    return { x: x, y: 100 + y * sin(a) - z * cos(a) }
}

function createVoronoiDiagram(n, corners) {
    let height = abs(corners[0].x - corners[1].x)
    let width = abs(corners[0].y - corners[1].y)
    for (let i = 0; i < n; i++) {
        voronoiSite(
            random(height),
            random(width));
    }
    voronoi(width, height, true);
    return voronoiGetDiagram();
}

function drawEdge3D(edge, height, zero) {
    if (zero === undefined) zero = { x: 0, y: 0 }
    let a2 = transform3DCoordinates(edge.va.x, edge.va.y, height, ANGLE_VISUALIZATION);
    let b2 = transform3DCoordinates(edge.vb.x, edge.vb.y, height, ANGLE_VISUALIZATION);
    line(zero.x + a2.x, zero.y + a2.y, zero.x + b2.x, zero.y + b2.y);
}

function getLowerEdges(edges) {
    let lowerEdges = []
    for (let i = 0; i < edges.length; i++) {
        if (edges[i].angle <= 0) break;
        lowerEdges.push(edges[i]);
    }
    return lowerEdges;
}

function joinVertex(edge, height, zero) {
    if (zero === undefined) zero = { x: 0, y: 0 }
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
    vertex(zero.x + bot.x, zero.y + bot.y)
    vertex(zero.x + bot_2.x, zero.y + bot_2.y)
    vertex(zero.x + top_2.x, zero.y + top_2.y)
    vertex(zero.x + top.x, zero.y + top.y)
    endShape(CLOSE)
    pop()

}

function angleBetweenPoints(p1, p2) {
    return (
        atan2(p2.y - p1.y, p2.x - p1.x)
    )
}

function drawCell3D(cell, height, zero) {

    // circle(zero.x, zero.y, 10)
    // circle(zero.x + cell.site.x, zero.y + cell.site.y, 5)

    let edges = cell.halfedges;
    let lowerEdges = getLowerEdges(edges);
    let cellCenter = edges[0].site;
    for (let edges_i = 0; edges_i < lowerEdges.length; edges_i++) {
        let edge = lowerEdges[edges_i].edge;
        // drawEdge3D(edge, 0, zero)
        joinVertex(edge, height, zero)
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
    noStroke();
    // stroke(PALETTE[0]);
    // strokeWeight(2);
    fill(PALETTE[0]);
    for (let vertices_i = 0; vertices_i < vertAng.length; vertices_i++) {
        let v = vertAng[vertices_i][0];
        v = transform3DCoordinates(v.x, v.y, height, ANGLE_VISUALIZATION);
        vertex(zero.x + v.x, zero.y + v.y);
    }
    endShape(CLOSE);
    pop()
}

function draw() {
    // let diagrams = []
    for (let grid_i = 0; grid_i <= HEIGHT / CELL_SIZE; grid_i++) {
        for (let grid_j = 0; grid_j <= WIDTH / CELL_SIZE; grid_j++) {
            let corners = [
                { x: MARGIN + grid_i * CELL_SIZE + CELL_MARGIN / 2, y: MARGIN + grid_j * CELL_SIZE + CELL_MARGIN / 2 },
                { x: MARGIN + (grid_i + 1) * CELL_SIZE - CELL_MARGIN / 2, y: MARGIN + (grid_j + 1) * CELL_SIZE - CELL_MARGIN / 2 }
            ]
            if (corners[1].x > WIDTH || corners[1].y > HEIGHT) break;
            // rectMode(CORNERS)
            // rect(
            //     grid_i * CELL_SIZE + CELL_MARGIN / 2,
            //     grid_j * CELL_SIZE + CELL_MARGIN / 2,
            //     (grid_i + 1) * CELL_SIZE - CELL_MARGIN / 2,
            //     (grid_j + 1) * CELL_SIZE - CELL_MARGIN / 2
            // )

            let diagram = createVoronoiDiagram(500,
                corners);

            // voronoiDraw(corners[0].x, corners[0].y, true, false)
            let center = { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 }
            let mainSite = voronoiGetSite((CELL_SIZE - CELL_MARGIN) / 2, (CELL_SIZE - CELL_MARGIN) / 2, false);
            if (mainSite === undefined) break;
            let sites = [mainSite];
            sites = sites.concat(voronoiNeighbors(mainSite));
            let extraSites = [];
            for (let i = 0; i < sites.length; i++) {
                extraSites = extraSites.concat(voronoiNeighbors(sites[i]));
            }
            sites = sites.concat(extraSites)
            extraSites = [];
            for (let i = 0; i < sites.length; i++) {
                extraSites = extraSites.concat(voronoiNeighbors(sites[i]));
            }
            sites = sites.concat(extraSites)
            sites = [...new Set(sites)];
            extraSites = [];
            for (let i = 0; i < sites.length; i++) {
                extraSites = extraSites.concat(voronoiNeighbors(sites[i]));
            }
            sites = sites.concat(extraSites)
            sites = [...new Set(sites)];

            sites.sort((a, b) => (a - b))
            for (let i = 0; i < sites.length; i++) {
                let cell = diagram.cells[sites[i]];
                let height = randomGaussian(
                    (CELL_SIZE - cell.site.y) * (CELL_SIZE - cell.site.y) * (CELL_SIZE - cell.site.y) * ((grid_j + 3) / 8) * .000015, grid_j * grid_j);
                if (height < 0) height = 2;
                drawCell3D(cell, height, { x: corners[0].x, y: corners[0].y });
            }
            voronoiClearSites();

        }
    }
}