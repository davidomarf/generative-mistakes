/**
 * TO-DO
 * 
 * - Make propagation function recursive.
 * - Re-format code 
 */

/*************** PRIMARY CONSTANTS ***************/

const WIDTH = 600; // SVG Element Width
const HEIGHT = 600; // SVG Element Height

const CELL_SIZE = 2; // Size in square pixels for a single cell
// WIDTH%CELL_SIZE and HEIGHT%CELL_SIZE must be 0
const SLAB_SIZE = 4; // Size in cells for a slab

const DENSITY_DOT = 0.05; // Probability of a slab to be single-dot-filled
const DENSITY_CHESS = 0.003; // Probability of a slab to be chess-filled
const DENSITY_SOLID = 0.0005; // Probability of a slab to be solid-filled
const DENSITY_RAIN = 0.05; // Probability of a cell to be rain-centers

const RAIN_MIN_LENGTH = 2; // Minimum span of a rain-drop
const RAIN_MAX_LENGTH = 6; // Maximum span of a rain-drop

/************** SECONDARY CONSTANTS **************/

const NO_OF_CELLS = WIDTH * HEIGHT / (CELL_SIZE * CELL_SIZE) // Total number of cells
const NO_OF_SLABS_X = WIDTH / (CELL_SIZE * SLAB_SIZE) // Slabs on X
const NO_OF_SLABS_Y = HEIGHT / (CELL_SIZE * SLAB_SIZE) // Slabs on Y

const NO_OF_DOT = NO_OF_CELLS * DENSITY_DOT // Number of slabs with only a single point
const NO_OF_CHESS = NO_OF_CELLS * DENSITY_CHESS // Number of slabs to be chess-filled
const NO_OF_SOLID = NO_OF_CELLS * DENSITY_SOLID // Number of slabs to be solid-filled
const NO_OF_RAIN = NO_OF_CELLS * DENSITY_RAIN // Number of cells to be rain-centers
const NO_OF_CLUSTERS = 40
const CLUSTER_EXTENSION = 50

/************** CONSISTENCY VARIABLES **************/

const CHESS_CONSISTENCY = 0.9;
const SOLID_CONSISTENCY = 0.95;

/****************** COLOR PALETTE ******************/

const palette = [
    d3.hsl(331, .98, .47),  // Pink
    d3.hsl(359, .98, .49),  // Red
    d3.hsl(54, .97, .58),   // Yellow hsl(54,97%,58%)
    d3.hsl(45, .71, .88),   // White
    d3.hsl(266, .12, .12),  // Black
]

/******************** FUNCTIONS ********************/

// Helping functions
//
// Not relevant to the specific algorithm. May be used
// in other projects cause their generality.

/**
 * From a base-point, generates a new point that is displaced by dx units
 * in the ith direction.
 * 
 * Directions:
 * 
 *    8  1  2
 *    7  x  3
 *    6  5  4
 * 
 * @param {number[]} point  [x,y] coordinates
 * @param {number} i        0<i<=8 Indicates the direction of displacement
 * @param {number} dx       Distance of the displacement
 * 
 * @return {number[]}       [x, y] coordinates
 */
function getNextPoint(point, i, dx) {
    newPoint = point.slice()
    switch (i) {
        case 1:
            newPoint[1] -= dx;
            break;
        case 2:
            newPoint[0] += dx;
            newPoint[1] -= dx;
            break;
        case 3:
            newPoint[0] += dx;
            break;
        case 4:
            newPoint[0] += dx;
            newPoint[1] += dx;
            break;
        case 5:
            newPoint[1] += dx;
            break;
        case 6:
            newPoint[0] -= dx;
            newPoint[1] += dx;
            break;
        case 7:
            newPoint[0] -= dx;
            break;
        case 8:
            newPoint[0] -= dx;
            newPoint[1] -= dx;
            break;
    }

    return newPoint;
}

/**
 * Fill one tile of size tileSize in coordinates [x, y] with
 * a solid color
 * 
 * @param {number[]} tile       Coordinates of the top left corner of the tile
 * @param {number} tileSize     Size of the tile in px
 */
function fillTile(tile, tileSize, color) {
    if (tileSize === null) tileSize = GRID_SIZE;
    svgSpace.append("rect")
        .attr("x", tile[0] + tileSize / 2)
        .attr("y", tile[1] + tileSize / 2)
        .attr("width", tileSize)
        .attr("height", tileSize)
        .attr("stroke-width", 0)
        .attr("opacity", 1)
        .attr("fill", color);
}

/**
 * Returns an SVG Element of size w x h and filled with color
 *
 * @param {integer} w       Width
 * @param {integer} h       Height
 * @param {string} color    Color
 */
function initializeCanvas(w, h, color) {
    // Create a svgSpace using D3 with custom dimensions
    const svgSpace = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create a background (useful for certain debugging purposes)
    if (color != null) {
        svgSpace.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", color);
    }

    return svgSpace;
}

// Slab-filling functions
//
// Receiving the coordinates of the cell (0,0) of a slab,
// fills the corresponding cells following a pattern:
//  - Dot: Fill either cell(0,0) or cell(SLAB_SIZE, SLAB_SIZE)
//  - Chess: Fill slab in a chess-grid pattern
//  - Solid: Fill every cell in a slab
//
// Every pattern has a consistency ratio, that perturbates
// the original pattern. Check 

/**
 * Fill last cell in slab
 * 
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_dot(slab, color) {
    fillTile(
        [slab[0] + SLAB_SIZE * CELL_SIZE,
            slab[1] + SLAB_SIZE * CELL_SIZE
        ],
        CELL_SIZE,
        getSimilarColor(color));
}

/**
 * Fills slab in chess-grid pattern
 * 
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_chess(slab, color) {

    for (let i = 0; i < SLAB_SIZE; i++) {
        for (let j = 0; j < SLAB_SIZE; j++) {
            if (
                (i + j) % 2 == 0 && Math.random() < CHESS_CONSISTENCY ||
                (i + j) % 2 == 1 && Math.random() > CHESS_CONSISTENCY) {
                fillTile(
                    [slab[0] + i * CELL_SIZE,
                        slab[1] + j * CELL_SIZE
                    ],
                    CELL_SIZE,
                    getSimilarColor(color))
            }
        }
    }
}

/**
 * Fills slab in a solid color
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_solid(slab, color) {
    if (SOLID_CONSISTENCY > 0.5){
        fillTile([
            slab[0] - CELL_SIZE/2,
            slab[1] - CELL_SIZE/2],
            CELL_SIZE * SLAB_SIZE,
            color)
    }
    // for (let i = 0; i < SLAB_SIZE; i++) {
    //     for (let j = 0; j < SLAB_SIZE; j++) {
    //         if (Math.random() < SOLID_CONSISTENCY) {
    //             fillTile(
    //                 [slab[0] + i * CELL_SIZE,
    //                     slab[1] + j * CELL_SIZE
    //                 ],
    //                 CELL_SIZE,
    //                 color)
    //         }
    //     }
    // }
}

/**
 * 
 * @param {number[]} cell [x,y] coordinates 
 */
function fill_raindrop(cell, color) {
    let nextCell = getNextPoint(cell, 6, CELL_SIZE);
    fillTile(nextCell, CELL_SIZE);
    let length = Math.floor(RAIN_MIN_LENGTH + Math.random() * (RAIN_MAX_LENGTH - RAIN_MIN_LENGTH));
    for (let i = 0; i < length; i++) {
        nextCell = getNextPoint(nextCell, 6, CELL_SIZE);
        fillTile(nextCell, CELL_SIZE, getSimilarColor(color));
    }
}

// Propagation functions
//
// Main and helping functions just for the
// propagator/cluster-maker

/**
 * Receives one slab, and generates a cluster around it
 * 
 * @param {*} center    Center coordinates
 */
function propagateCluster(center, c1, c2, c3) {
    let direction = Math.ceil(Math.random() * 8);
    let coordinates = getNextPoint(center, direction, SLAB_SIZE * CELL_SIZE);
    fill_solid(coordinates, getSimilarColor(c1, 10, .2, .2));
    for (let i = 0; i < CLUSTER_EXTENSION; i++) {
        let r = Math.random();
        if (r > 0.9) {
            if (Math.random() > 0.5) {
                direction = (direction + 2) % 8;
            } else {
                direction = (direction + 6) % 8;
            }
        } else if (r > 0.7) {
            if (Math.random() > 0.5) {
                direction = (direction + 1) % 8;
            } else {
                direction = (direction + 7) % 8;
            }
        }

        coordinates = getNextPoint(coordinates, direction, SLAB_SIZE * CELL_SIZE);
        if (Math.random() > 0.5) {
            fill_solid(coordinates,
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        } else {
            fill_chess(coordinates,
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        }

        let siblings = [
            getNextPoint(coordinates, (direction + 1) % 8, SLAB_SIZE * CELL_SIZE),
            getNextPoint(coordinates, (direction + 7) % 8, SLAB_SIZE * CELL_SIZE)
        ]

        if (Math.random() > 0.5) {
            
            fill_solid(siblings[0],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));

            fill_solid(siblings[1],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        } else {
            fill_chess(siblings[0],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));

            fill_chess(siblings[1],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        }
        siblings = [
            getNextPoint(coordinates, (direction + 1) % 8, SLAB_SIZE * CELL_SIZE * 2),
            getNextPoint(coordinates, (direction + 7) % 8, SLAB_SIZE * CELL_SIZE * 2)
        ]

        if (Math.random() > 0.5) {
            
            fill_solid(siblings[0],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));

            fill_solid(siblings[1],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        } else {
            fill_chess(siblings[0],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));

            fill_chess(siblings[1],
                getSimilarColor(
                    getColorBetweenColors(c1, c2, i / CLUSTER_EXTENSION),
                    10, .2, .2));
        }


    }
}




function getColorBetweenColors(color1, color2, proportion) {
    let c1 = color1;
    let c2 = color2;
    let resultantColor = d3.hsl(
        c1.h + (c2.h - c1.h) * proportion,
        c1.s + (c2.s - c1.s) * proportion,
        c1.l + (c2.l - c1.l) * proportion,

    );
    return resultantColor;
}

function getSimilarColor(color, dh, ds, dl) {
    if (dh === undefined) dh = 30;
    if (ds === undefined) ds = .3;
    if (dl === undefined) dl = .3;
    let newColor = d3.hsl(
        color.h + Math.random() * dh - (dh / 2),
        color.s + Math.random() * ds - (ds / 2),
        color.l + Math.random() * dl - (dl / 2)
    )

    return newColor;
}

function drawElements(n, func, color){
    for (let i = 0; i < n; i++) {
        let x = Math.random() * (WIDTH - SLAB_SIZE * CELL_SIZE)
        let y = Math.random() * (HEIGHT - SLAB_SIZE * CELL_SIZE)
        func([
                x - (x % (SLAB_SIZE * CELL_SIZE)),
                y - (y % (SLAB_SIZE * CELL_SIZE))
            ],
            color)
    }
}

/**
 * Create the svgSpace and make it global (is this an antipattern?)
 */
const svgSpace = initializeCanvas(WIDTH, HEIGHT, palette[4]);

function main() {

    drawElements(NO_OF_DOT, fill_dot, palette[4]);
    drawElements(NO_OF_CHESS, fill_chess, palette[2]);
    drawElements(NO_OF_SOLID, fill_solid, palette[4]);
    drawElements(20, fill_raindrop, palette[2]);

    for (let i = 0; i < NO_OF_CLUSTERS; i++) {
        let x = Math.random() * (WIDTH - SLAB_SIZE * CELL_SIZE)
        let y = Math.random() * (HEIGHT - SLAB_SIZE * CELL_SIZE)
        x = x - (x % (SLAB_SIZE * CELL_SIZE));
        y = y - (y % (SLAB_SIZE * CELL_SIZE))
        let cluster = propagateCluster([x, y], palette[4], palette[2])
    }

}

main()