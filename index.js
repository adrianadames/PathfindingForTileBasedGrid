// Code for building a graph representation of a 2D grid 
// for the purposes of implementing pathfinding algorithms. 

// -queue for bfs 
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        if (item === null) {
            return Error('The item passed into this function must be a non-null value.')
        } else if (item === undefined) {
            return Error('The item passed into the function is undefined.')
        } else {
            this.items.push(item);
        } 
    }

    dequeue() {
        if (this.items.length < 1) {
            return 'queue is empty'
        } else {
            return this.items.shift();
        }
    }
}

class Graph {
    constructor(width, height) {
        this.width = width; // numColumns in grid (x-axis)
        this.height = height; // numRows in grid (y-axis)
        this.blockades = {}; // grid cells you can't pass through
    }

    inBounds(cellId) {
        let [x,y] = cellId;
        return (x >= 0 && y >= 0 && x < this.width && y < this.height)
    } 

    passable(cellId) {
        return (!this.blockades[cellId])
    }

    neighbors(cellId) {
        let [x,y] = cellId;
        let neighbors = [[x, y-1], [x,y+1], [x+1, y], [x-1, y]]; // N S E W;
        let inBoundNeighbors = neighbors.filter(neighbor => {return this.inBounds(neighbor)});
        let inBoundAndPassableNeighbors = inBoundNeighbors.filter(inBoundNeighbor => {return this.passable(inBoundNeighbor)}); 
        return inBoundAndPassableNeighbors
    }
    
    // style an object w/ these possible keys: 'number', 'pointTo', 'start', 'goal', 'path'
    drawCell(cellId, style) {
        let [x1,y1] = cellId;
        let cellText = '.';

        if (style['pointTo'] && style['pointTo'][cellId]) {
            let [x2,y2] = style['pointTo'][cellId];

            if (x2 === x1 + 1) {
                cellText = '\u2192'; // rightwards arrow
            } else if (x2 === x1 - 1) {
                cellText = '\u2190'; // leftwards arrow
            } else if (y2 === y1 + 1) {
                cellText = '\u2193'; // downwards arrow
            } else if (y2 === y1 - 1) {
                cellText = '\u2191'; // upwards arrow
            }
        }

        if (style['start'] && x1 === style['start'][0] && y1 === style['start'][1]) {
            cellText = 'S';
        }
        if (style['destination'] && x1 === style['destination'][0] && x2 === style['destination'][1]) {
            cellText = 'D';
        }
        if (style['path'] && x1 === style['destination'][0] && x2 === style['destination'][1]) {
            cellText = '@';
        }
        if (this.blockades[cellId]) {
            cellText = '#';
        }
        return cellText
    }
    // style an object w/ these possible keys: 'number', 'pointTo', 'start', 'goal', 'path'
    drawGrid(style) { 
        let gridDrawing = ''; 
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                gridDrawing += this.drawCell([x,y], style);
            }
            gridDrawing += '\n';
        }
        console.log(gridDrawing)
    }
}

function breadth_first_search(graph, startLocation) {
    let frontier = new Queue; 
    frontier.enqueue(startLocation);
    let cameFrom = {};
    cameFrom[startLocation] = null;

    while (frontier.items.length > 0) {
        let currentLocation = frontier.dequeue();
        let neighbors = graph.neighbors(currentLocation);

        for (let i = 0; i <neighbors.length; i++) {
            if (!cameFrom[neighbors[i]]) {
                frontier.enqueue(neighbors[i]);
                cameFrom[neighbors[i]] = currentLocation;
            }
        }
    }
    // console.log('cameFrom: ', cameFrom);
    return cameFrom
}

function reconstructPath(cameFrom, start, goal) {
    let [xCurrent, yCurrent] = goal;
    let [xStart, yStart] = start;
    let path = [];

    while (!(xCurrent === xStart && yCurrent === yStart)) {
        path.push([xCurrent, yCurrent]);
        [xCurrent, yCurrent] = cameFrom[[xCurrent, yCurrent]];
    }
    path.push([xStart, yStart]); 
    path.reverse();
    // console.log('path: ', path);
    return path
}


let g1 = new Graph(3,3);
g1.blockades[[1,0]] = true;
g1.blockades[[1,1]] = true;

let cameFrom = breadth_first_search(g1, [0,0]);

g1.drawGrid({pointTo:cameFrom, start: [0,0]});
// yields the following: 
//          S#↓
//          ↑#↓
//          ↑←←

g1.drawGrid({});
// yields the following: 
//          .#.
//          .#.
//          ...



let g2 = new Graph(8,5);
let g2Blockades = [
    [1,0], [1,1], [1,2], [3,2], [3,3], [3,4], [5,0], [5,1]
];
for (let i = 0; i < g2Blockades.length; i++) {
    g2.blockades[g2Blockades[i]] = true;
}

g2.drawGrid({});
// yields the following: 
//      .#...#..
//      .#...#..
//      .#.#....
//      ...#....
//      ...#....

let cameFrom2 = breadth_first_search(g2, [0,0]);

g2.drawGrid({pointTo:cameFrom2, start: [0,0]});
// yields the following: 
//      S#↓←←#↓←
//      ↑#↓←←#↓←
//      ↑#↓#↑←←←
//      ↑←←#↑←←←
//      ↑←←#↑←←←

let path2 = reconstructPath(cameFrom2, [0,0], [7,0])
// console.log('path2: ', path2)