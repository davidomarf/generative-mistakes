const WIDTH = 2200;
const HEIGHT = 2200;
const MARGIN = 200;

const CELL_SIZE = 300;
const CELL_MARGIN = 0;

const ANGLE_VISUALIZATION = 30;
const VERTICAL_DISPLACEMENT = 100;

let PALETTE = [
    "#d6e7f5",  // Top of cell (white-ish)
    "#F76F8E",  // Right walls (red)
    "#4c4e76",  // Front walls (purple)
    "#598392",  // Left walls (blue)
    "#292A40"   // Background (dark purple)
]

function setup() {
    createCanvas(WIDTH, HEIGHT);
    background(PALETTE[PALETTE.length - 1]);
    noLoop();
}

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

/**
 * Creates a Voronoi diagram inside a rectangular area containing
 * n random points.
 * 
 * @param {number} n Number of random points for the diagram
 * @param {Object[]} corners Corners for the rectangle that will contain the diagram
 * @return {Voronoi.Diagram} Voronoi diagram for the set of points
 */
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

/**
 *  From a set of edges, returns the ones that would be visible
 * if they formed the bottom face of a prism
 * 
 * @param {Voronoi.Halfedge[]} edges All the edges of Voronoi.Cell
 * @return {Voronoi.Halfedge[]} Visible edges
 */
function getLowerEdges(edges) {
    let lowerEdges = []
    for (let i = 0; i < edges.length; i++) {
        if (edges[i].angle <= 0) break;
        lowerEdges.push(edges[i]);
    }
    return lowerEdges;
}

/**
 * Creates the side-faces of the prism for the elevated site
 * 
 * @param {Voronoi.Edge} edge Visible edge from the bottom face
 * @param {number} height Height of the Voronoi cell
 * @param {Object} [origin = {x: 0, y:0}] Coordinates to translate the origin to
 */
function createSiteWall(edge, height, origin) {
    if (origin === undefined) origin = { x: 0, y: 0 }
    let bot = transform3DCoordinates(edge.va.x, edge.va.y, 0);
    let bot_2 = transform3DCoordinates(edge.vb.x, edge.vb.y, 0);

    let top = transform3DCoordinates(edge.va.x, edge.va.y, height);
    let top_2 = transform3DCoordinates(edge.vb.x, edge.vb.y, height);

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
    vertex(origin.x + bot.x, origin.y + bot.y)
    vertex(origin.x + bot_2.x, origin.y + bot_2.y)
    vertex(origin.x + top_2.x, origin.y + top_2.y)
    vertex(origin.x + top.x, origin.y + top.y)
    endShape(CLOSE)
    pop()

}


/**
 * Calculate the angle from point to point
 * 
 * @param {Object} p1 Contains {x, y} coordinates of first point
 * @param {Object} p2 Contains {x, y} coordinates of second point
 * @return {number} Angle in radians between p1 and p2
 */
function angleBetweenPoints(p1, p2) {
    return (
        atan2(p2.y - p1.y, p2.x - p1.x)
    )
}

/**
 * Draw a given Voronoi Cell in 3D
 * 
 * @param {Voronoi.Cell} cell Cell to be drawn in 3D
 * @param {number} height Height of the Voronoi cell
 * @param {Object} [origin = {x: 0, y: 0}] Coordinates to translate the origin to
 */
function drawCell3D(cell, height, origin) {
    if (origin === undefined) origin = { x: 0, y: 0 };
    let edges = cell.halfedges;
    let lowerEdges = getLowerEdges(edges);
    let cellCenter = edges[0].site;

    for (let edges_i = 0; edges_i < lowerEdges.length; edges_i++) {
        let edge = lowerEdges[edges_i].edge;
        createSiteWall(edge, height, origin)
    }

    // Create an array to contain the coordinates of every vertex
    let vertices = []
    for (let edges_i = 0; edges_i < edges.length - 1; edges_i++) {
        let edge = edges[edges_i].edge;
        let a = edge.va;
        let b = edge.vb;
        if (edges_i == 0) {
            vertices.push(a, b);
            continue;
        }

        // From the current edge, push whichever vertex isn't in the array
        vertices.indexOf(a) == -1?
            vertices.push(a):
            vertices.push(b);
    }

    // Calculate the angle between the site, and every vertex
    let vertAng = vertices.slice();
    for (let i = 0; i < vertices.length; i++) {
        vertAng[i] = [
            vertAng[i],
            angleBetweenPoints(cellCenter, vertices[i])
        ]
    }

    // Sort them to be in anticlockwise direction
    vertAng.sort((a, b) => a[1] - b[1])
    
    push()
    beginShape();
    noStroke();
    fill(PALETTE[0]);
    for (let vertices_i = 0; vertices_i < vertAng.length; vertices_i++) {
        let v = vertAng[vertices_i][0];
        v = transform3DCoordinates(v.x, v.y, height);
        vertex(origin.x + v.x, origin.y + v.y);
    }
    endShape(CLOSE);
    pop()
}

function draw() {
    let n_cells_i = Math.floor((WIDTH - 2 * MARGIN) / (CELL_SIZE + 2 * CELL_MARGIN));
    let n_cells_j = Math.floor((HEIGHT - 2 * MARGIN) / (CELL_SIZE + 2 * CELL_MARGIN));

    for (let grid_i = 0; grid_i < n_cells_i; grid_i++) {
        for (let grid_j = 0; grid_j < n_cells_j; grid_j++) {
            let corners = [
                {
                    x: MARGIN + grid_i * CELL_SIZE + CELL_MARGIN / 2,
                    y: MARGIN + grid_j * CELL_SIZE + CELL_MARGIN / 2
                },
                {
                    x: MARGIN + (grid_i + 1) * CELL_SIZE - CELL_MARGIN / 2,
                    y: MARGIN + (grid_j + 1) * CELL_SIZE - CELL_MARGIN / 2
                }
            ]

            // Generate a random diagram
            let diagram = createVoronoiDiagram(500, corners);

            // Select the Voronoi Site that contains the midpoint of the rectangle
            let mainSite = voronoiGetSite((CELL_SIZE - CELL_MARGIN) / 2, (CELL_SIZE - CELL_MARGIN) / 2, false);
            let sites = [mainSite];
            let extraSites = [];

            for (let neighbors_i = 0; neighbors_i < 4; neighbors_i++) {
                for (let i = 0; i < sites.length; i++) {
                    // Obtain the neighboring Voronoi sites of every site in the array
                    extraSites = extraSites.concat(voronoiNeighbors(sites[i]));
                }
                // Add the new neighbors to the array
                sites = sites.concat(extraSites)
                sites = [...new Set(sites)];
                extraSites = [];
            }

            // Sort them so they get drawn from back to front
            sites.sort((a, b) => (a - b))

            for (let i = 0; i < sites.length; i++) {
                let cell = diagram.cells[sites[i]];

                // Generate a height for the Voronoi cell using its Y coordinate and the
                // rectangle it's being drawn in
                let height = randomGaussian(
                    pow((CELL_SIZE - cell.site.y), 3) * ((grid_j + 3) / 8) * .000015,
                    grid_j * grid_j);

                // Set a minimum height    
                if (height < 0) height = 2;

                // Draw the current cell
                drawCell3D(cell, height, { x: corners[0].x, y: corners[0].y });
            }

            // Clear Sites to start a new diagram in the next rectangle
            voronoiClearSites();
        }
    }
}