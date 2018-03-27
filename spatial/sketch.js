//// Constants ///////////////////////////////////////
// Modifying these, will modify the whole work
// without going deeper in the code

/// Drawing Area ///
const WIDTH = 500
const HEIGHT = 500

/// Grid ///
const tileSize = 10



function createGrid(svgSpace) {
    let grid = []
    let centers = []
    for (let i = tileSize, a = 0; i <= WIDTH; i += tileSize, a++) {
        grid.push([])
        centers.push([])
        for (let j = tileSize; j <= HEIGHT; j += tileSize) {
            let points = [
                [i - tileSize, j - tileSize],
                [i, j - tileSize],
                [i, j],
                [i - tileSize, j]
            ].join(" ")

            grid[a].push(svgSpace.append("polygon")
                .attr("points", points)
                .style("fill-opacity", 0)
                .style("stroke", "black")
                .style("stroke-opacity", .1))

            centers[a].push([i - tileSize / 2, j - tileSize / 2])
        }
    }
    return [grid, centers]
}

const svgSpace = d3.select("body")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)

let [grid, centers] = createGrid(svgSpace)

for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
        if (Math.random() > .995) {
            // grid[i][j].style("fill-opacity", Math.random());
            svgSpace.append("circle")
                .attr
            console.log(grid[i][j].points)
        }
    }
}