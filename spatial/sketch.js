//// Constants ///////////////////////////////////////
// Modifying these, will modify the whole work
// without going deeper in the code

/// Drawing Area ///
const equatorialCircumference = 40000;
const WIDTH = equatorialCircumference / 50;
const HEIGHT = equatorialCircumference / 50;

const continents_n = 5;
const points_n = 16;


function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function generateContinents(n) {
    let continents = [];
    for (let i = 0; i < n; i++) {
        continents.push({
            center: {
                x: Math.random() * WIDTH,
                y: (.3 * HEIGHT) + Math.random() * HEIGHT * 0.4
            },
            radius: (WIDTH / 15) + Math.random() * (WIDTH / 10)
        });
    }
    let continents_polygons = [];
    for (let i = 0; i < n; i++) {
        let polygon = [];
        let c = continents[i];
        let angleDelta = 360 / points_n;
        for (let j = 0; j <= 360; j += angleDelta) {
            let scale = .5 + Math.random();
            polygon.push(
                [c.center.x + c.radius  * scale * Math.cos(toRadians(j)),
                    c.center.y + c.radius * scale * Math.sin(toRadians(j))
                ]
            )
        }
        continents_polygons.push(
            polygon
        );
    }

    // let distorted = [];
    // for (let i = 0; i < continents_polygons.length; i++) {
    //     for (j = 0; j < continents_polygons[i].length; j++) {

    //     }
    // }
    return continents_polygons;
}

function drawContinents(svgSpace, continents) {
    for (let i = 0; i < continents.length; i++) {
        svgSpace.append("polygon")
            .attr("points", continents[i])
            .style("fill-opacity", 1);
    }
}

const svgSpace = d3.select("body")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

continents = generateContinents(continents_n);
drawContinents(svgSpace, continents);


// for (let i = 0; i < continents.length; i++) {
//     svgSpace.append("circle")
//         .attr("cx", continents[i][0])
//         .attr("cy", continents[i][1])
//         .attr("r", 10);
// }
// /// Grid ///
// const tileSize = 10

// function createGrid(svgSpace) {
//     let grid = []
//     let centers = []
//     for (let i = tileSize, a = 0; i <= WIDTH; i += tileSize, a++) {
//         grid.push([])
//         centers.push([])
//         for (let j = tileSize; j <= HEIGHT; j += tileSize) {
//             let points = [
//                 [i - tileSize, j - tileSize],
//                 [i, j - tileSize],
//                 [i, j],
//                 [i - tileSize, j]
//             ].join(" ")

//             grid[a].push(svgSpace.append("polygon")
//                 .attr("points", points)
//                 .style("fill-opacity", 0)
//                 .style("stroke", "black")
//                 .style("stroke-opacity", .1))

//             centers[a].push([i - tileSize / 2, j - tileSize / 2])
//         }
//     }
//     return [grid, centers]
// }



// let [grid, centers] = createGrid(svgSpace)

// for (let i = 0; i < grid.length; i++) {
//     for (let j = 0; j < grid[i].length; j++) {
//         if (Math.random() > .995) {
//             grid[i][j].style("fill-opacity", Math.random());
//             // svgSpace.append("circle")
//             //     .attr
//             console.log(grid[i][j].points)
//         }
//     }
// }