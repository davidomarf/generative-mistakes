/**
 * TO-DO
 * 
 * - Create functions to propagate from clusters
 * - Avoid repeating code (LOC 207-232)
 * - Add raindrops
 * - Make solid fills be a single rectangle of accent color,
 *   with few rectangles of background color inside
 *   (instead of many rectangles of accent color)
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
 * Create the svgSpace and make it global (is this an antipattern?)
 */
const svgSpace = initializeCanvas(WIDTH, HEIGHT, "#0B0B0B");

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
        [slab[0] + SLAB_SIZE * CELL_SIZE,
        slab[1] + SLAB_SIZE * CELL_SIZE],
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
                        [slab[0] + i * CELL_SIZE,
                        slab[1] + j * CELL_SIZE],
                        CELL_SIZE)
                }
        }
    }
}

/**
 * Fills slab in a solid color
 * @param {Array} slab  Contains [x, y] coordinates
 */
function fill_solid(slab){
    for(let i = 0; i < SLAB_SIZE; i++){
        for(let j = 0; j < SLAB_SIZE; j++){
            if(Math.random() < SOLID_CONSISTENCY){
                fillTile(
                    [slab[0] + i * CELL_SIZE,
                    slab[1] + j * CELL_SIZE],
                    CELL_SIZE)
            }
        }
    }
}

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
        case 1: newPoint[1] -= dx; break;
        case 2: newPoint[0] += dx; newPoint[1] -= dx; break;
        case 3: newPoint[0] += dx; break;
        case 4: newPoint[0] += dx; newPoint[1] += dx; break;
        case 5: newPoint[1] += dx; break;
        case 6: newPoint[0] -= dx; newPoint[1] += dx; break;
        case 7: newPoint[0] -= dx; break;
        case 8: newPoint[0] -= dx; newPoint[1] -= dx; break;
    }

    return newPoint;
}

/**
 * Fill one tile of size tileSize in coordinates [x, y] with
 * a solid color
 * 
 * @param {number[]} tile       Coordinates of the tile
 * @param {number} tileSize     Size of the tile in px
 */
function fillTile(tile, tileSize) {
    if (tileSize === null) tileSize = GRID_SIZE;
    svgSpace.append("rect")
        .attr("x", tile[0] + tileSize / 2)
        .attr("y", tile[1] + tileSize / 2)
        .attr("width", tileSize)
        .attr("height", tileSize)
        .attr("stroke-width", 0)
        .attr("opacity", 1)
        .attr("fill", "#D8D8D8");
}

function main() {
    // const svgSpace = initializeCanvas(WIDTH, HEIGHT, "white");
    // const grid = drawGrid(WIDTH, HEIGHT, GRID_SIZE, svgSpace);
    // createRandomPoints(WIDTH, HEIGHT);
    for(let i = 0; i < NO_OF_DOT; i++){
        let x = Math.random() * (WIDTH - SLAB_SIZE * CELL_SIZE)
        let y = Math.random() * (HEIGHT - SLAB_SIZE * CELL_SIZE)
        fill_dot([
            x - (x % (SLAB_SIZE*CELL_SIZE)),
            y - (y % (SLAB_SIZE*CELL_SIZE))
        ])
    }

    for(let i = 0; i < NO_OF_CHESS; i++){
        let x = Math.random() * (WIDTH - SLAB_SIZE * CELL_SIZE)
        let y = Math.random() * (HEIGHT - SLAB_SIZE * CELL_SIZE)
        fill_chess([
            x - (x % (SLAB_SIZE*CELL_SIZE)),
            y - (y % (SLAB_SIZE*CELL_SIZE))
        ])
    }

    for (let i = 0; i < 6; i++) {
        let x = Math.random() * (WIDTH - SLAB_SIZE * CELL_SIZE)
        let y = Math.random() * (HEIGHT - SLAB_SIZE * CELL_SIZE)
        x = x - (x % (SLAB_SIZE*CELL_SIZE));
        y = y - (y % (SLAB_SIZE*CELL_SIZE))
        let cluster = propagateCluster([x, y])
        // fill_solid([x, y])
    }

}


/**
 * Receives one slab, and generates a cluster around it
 * 
 * @param {*} center    Center coordinates
 */
function propagateCluster(center) {
    let direction = Math.ceil(Math.random() * 8);
    let coordinates = getNextPoint(center, direction, SLAB_SIZE * CELL_SIZE);
    fill_solid(coordinates);
    for (let i = 0; i < 8; i++) {
        let r = Math.random();
        if (r > 0.9) {
            if (Math.random() > 0.5) {
                direction = (direction + 2) % 8;
            } else {
                direction = (direction + 6) % 8;
            }
        }
        else if (r > 0.7) {
            if (Math.random() > 0.5) {
                direction = (direction + 1) % 8;
            } else {
                direction = (direction + 7) % 8;
            }
        }

        coordinates = getNextPoint(coordinates, direction, SLAB_SIZE * CELL_SIZE);
        fill_solid(coordinates);

        let siblings = [
            getNextPoint(coordinates, (direction + 1) % 8, SLAB_SIZE * CELL_SIZE),
            getNextPoint(coordinates, (direction + 7) % 8, SLAB_SIZE * CELL_SIZE)
        ]
        fill_solid(siblings[0]);
        fill_solid(siblings[1]);

        siblings = [
            getNextPoint(coordinates, (direction + 1) % 8, SLAB_SIZE * CELL_SIZE * 2),
            getNextPoint(coordinates, (direction + 7) % 8, SLAB_SIZE * CELL_SIZE * 2)
        ]
        fill_chess(siblings[0]);
        fill_chess(siblings[1]);


    }
    // console.log(direction);
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