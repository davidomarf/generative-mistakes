/**
 * TO-DO
 * 
 * - Clean useless parts of the code
 * - Create functions to propagate from clusters
 * - Avoid repeating code (LOC 207-232)
 */

/**
 * Primary constants
 */

const WIDTH = 600;          // SVG Element Width
const HEIGHT = 600;         // SVG Element Height

const CELL_SIZE = 2;        // Size in square pixels for a single cell
                            // WIDTH%CELL_SIZE and HEIGHT%CELL_SIZE must be 0
const SLAB_SIZE = 4;        // Size in cells for a slab

const DENSITY_DOT = 0.01;    // Probability of a slab to be single-dot-filled
const DENSITY_CHESS = 0.001;  // Probability of a slab to be chess-filled
const DENSITY_SOLID = 0.001;  // Probability of a slab to be solid-filled
const DENSITY_RAIN = 0.01;   // Probability of a cell to be rain-centers

const RAIN_MIN_LENGTH = 4;  // Minimum span of a rain-drop
const RAIN_MAX_LENGTH = 8;  // Maximum span of a rain-drop

/**
 * Dependent constants
 */

const NO_OF_CELLS = WIDTH * HEIGHT / (CELL_SIZE * CELL_SIZE)    // Total number of cells
const NO_OF_SLABS_X = WIDTH / (CELL_SIZE * SLAB_SIZE)           // Slabs on X
const NO_OF_SLABS_Y = HEIGHT / (CELL_SIZE * SLAB_SIZE)          // Slabs on Y

const NO_OF_DOT = NO_OF_CELLS * DENSITY_DOT     // Number of slabs with only a single point
const NO_OF_CHESS = NO_OF_CELLS * DENSITY_CHESS // Number of slabs to be chess-filled
const NO_OF_SOLID = NO_OF_CELLS * DENSITY_SOLID // Number of slabs to be solid-filled
const NO_OF_RAIN = NO_OF_CELLS * DENSITY_RAIN   // Number of cells to be rain-centers

/**
 * Consistency Indexes
 */

const CHESS_CONSISTENCY = 0.9;
const SOLID_CONSISTENCY = 0.9;


/**
 * Slab-filling functions
 *
 * Receiving the coordinates of the cell (0,0) of a slab,
 * fills the corresponding cells following a pattern:
 *  - Dot: Fill either cell(0,0) or cell(SLAB_SIZE, SLAB_SIZE)
 *  - Chess: Fill slab in a chess-grid pattern
 *  - Solid: Fill every cell in a slab
 *
 * Every pattern has an inconsistency ratio, that perturbates
 * the original pattern
 */

/**
 * Fill last cell in slab
 * 
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_dot(slab){
    fillTile(
        slab[0] + SLAB_SIZE * CELL_SIZE,
        slab[1] + SLAB_SIZE * CELL_SIZE,
        CELL_SIZE);
}

/**
 * Fills slab in chess-grid pattern
 * 
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_chess(slab){
    
    for(let i = 0; i < SLAB_SIZE; i++){
        for(let j = 0; j < SLAB_SIZE; j++){
            if(
                (i+j)%2 == 0 && Math.random() < CHESS_CONSISTENCY
                ||
                (i+j)%2 == 1 && Math.random() > CHESS_CONSISTENCY)
                {
                    fillTile(
                        slab[0] + i * CELL_SIZE,
                        slab[1] + j * CELL_SIZE,
                        CELL_SIZE)
                }
        }
    }
}

function fill_solid(slab){
    for(let i = 0; i < SLAB_SIZE; i++){
        for(let j = 0; j < SLAB_SIZE; j++){
            if(Math.random() < SOLID_CONSISTENCY){
                fillTile(
                    slab[0] + i * CELL_SIZE,
                    slab[1] + j * CELL_SIZE,
                    CELL_SIZE)
            }
        }
    }
}

const svgSpace = initializeCanvas(WIDTH, HEIGHT, "black");

function drawGrid(width, height, gridSize) {
    let grid = 1;
    for (let i = 0; i < width; i += gridSize) {
        for (let j = 0; j < height; j += gridSize) {
            svgSpace
                .append("circle")
                .attr("cx", i)
                .attr("cy", j)
                .attr("r", DOT_SIZE_PX)
                .attr("fill", "black");
        }
    }
    return 0;
}

function drawPoint(x, y) {
    svgSpace
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", DOT_SIZE_PX)
        .attr("fill", "black");
}

function getNextPoint(point, i) {
    newPoint = point.slice()
    switch (i) {
        case 0: newPoint[0] += 10; break;
        case 1: newPoint[0] += 10; newPoint[1] -= 10; break;
        case 2: newPoint[1] -= 10; break;
        case 3: newPoint[0] -= 10; newPoint[1] -= 10; break;
        case 4: newPoint[0] -= 10; break;
        case 5: newPoint[0] -= 10; newPoint[1] += 10; break;
        case 6: newPoint[1] += 10; break;
        case 7: newPoint[0] += 10; newPoint[1] += 10; break;
    }

    return newPoint;
}

function fillTile(x, y, tileSize) {
    if (tileSize === null) tileSize = GRID_SIZE;
    svgSpace.append("rect")
        .attr("x", x + tileSize / 2)
        .attr("y", y + tileSize / 2)
        .attr("width", tileSize)
        .attr("height", tileSize)
        .attr("stroke-width", 0)
        .attr("opacity", 1)
        .attr("fill", "white");
}

// function fillWithDots(x, y) {
//     for (let i = 0; i < GRID_SIZE; i += DOT_SIZE_PX) {
//         for (let j = 0; j < GRID_SIZE; j += DOT_SIZE_PX) {
//             if (d3.randomUniform()() > 0.7) {
//                 fillTile(x + i, y+j, DOT_SIZE_PX)
//             }
//         }
//     }
// }

function fillWithDots(x, y) {
    for (let i = 0; i < GRID_SIZE; i += DOT_SIZE_PX) {
        fillTile(x + GRID_SIZE - i, y + i, DOT_SIZE_PX)
    }
}

function createRandomPoints(max_x, max_y) {
    for (let i = 0; i < SATURATION_LEVEL; i++) {

        let cluster_center = [d3.randomUniform()() * max_x, d3.randomUniform()() * max_y]
            .map(x => GRID_SIZE * Math.floor(x / GRID_SIZE));

        fillTile(cluster_center[0], cluster_center[1]);

        for (let k = 0; k < 8; k++) {
            let nextPoint = cluster_center
            for (let j = 0; j < MAXIMUM_SPAN; j++) {
                nextPoint = getNextPoint(nextPoint, k)
                if (d3.randomUniform()() > 0.2) {
                    // drawPoint(nextPoint[0], nextPoint[1]);
                    fillTile(nextPoint[0], nextPoint[1]);
                    fillWithDots(nextPoint[0], nextPoint[1]);
                } else { break }
            }
        }

    }
}

function main() {
    // const svgSpace = initializeCanvas(WIDTH, HEIGHT, "white");
    // const grid = drawGrid(WIDTH, HEIGHT, GRID_SIZE, svgSpace);
    // createRandomPoints(WIDTH, HEIGHT);
    for(let i = 0; i < NO_OF_DOT; i++){
        let x = Math.random() * WIDTH
        let y = Math.random() * HEIGHT
        fill_dot([
            x - (x % SLAB_SIZE),
            y - (y % SLAB_SIZE)
        ])
    }
    
    for(let i = 0; i < NO_OF_CHESS; i++){
        let x = Math.random() * WIDTH
        let y = Math.random() * HEIGHT
        fill_chess([
            x - (x % SLAB_SIZE),
            y - (y % SLAB_SIZE)
        ])
    }

    for(let i = 0; i < NO_OF_SOLID; i++){
        let x = Math.random() * WIDTH
        let y = Math.random() * HEIGHT
        fill_solid([
            x - (x % SLAB_SIZE),
            y - (y % SLAB_SIZE)
        ])
    }

}

/**
 * Standard-drawing functions
 *
 * D3 functions that I'll reuse in other projects and
 * just sets the beginning of any project
 */


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
    if(color != null){
        svgSpace.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", color);
    }

    return svgSpace;
}

main()