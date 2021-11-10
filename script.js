const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let graph = {
    r0: { h0: 2 },
    r1: { h0:1, h1: 1, r2: 1 },
    r2: { r1: 1 },
    r3: { h0: 3, h1: 1, r5: 4 },
    r4: { h1: 2 },
    r5: { r3: 4 },

    h0: { r0: 2, r1: 1, r3: 3 },
    h1: { r1: 1, r4: 2, r3: 1 },
}

let positions = {
    r0: { x: 1, y: 3 },
    r1: { x: 2, y: 2 },
    r2: { x: 2, y: 1 },
    r3: { x: 3, y: 2 },
    r4: { x: 3, y: 1 },
    r5: { x: 3, y: 4 },

    h0: { x: 2, y: 3  },
    h1: { x: 2.5, y: 2 },
}

function drawGraph() {
    for (let node in graph) {
        const position = positions[node];

        ctx.beginPath();
        ctx.arc(position.x * 50, position.y * 50, 10, 0, 2 * Math.PI);
        ctx.fill();

        const neighbors = graph[node];

        for (let neighbor in neighbors) {
            const neighborPosition = positions[neighbor];

            ctx.beginPath();
            ctx.moveTo(position.x * 50, position.y * 50);
            ctx.lineTo(neighborPosition.x * 50, neighborPosition.y * 50);
            ctx.stroke();
        }
    }
}

function drawPath(path) {
    console.log(path);

    let lastNode;
    path.forEach(node => {
        lastNode ??= path[0];

        ctx.strokeStyle = 'red';

        ctx.beginPath();
        ctx.moveTo(positions[node].x * 50, positions[node].y * 50);
        ctx.lineTo(positions[lastNode].x * 50, positions[lastNode].y * 50);
        ctx.stroke();

        lastNode = node;
    })
}

function calculatePathLength(path) {
    let length = 0;

    for (let i = 1; i < path.length; i++) {
        length += graph[path[i]][path[i - 1]];
    }

    return length;
}

let path = dijkstra.findPath(graph, 'r0', 'r5');
drawGraph();
drawPath(path);
console.log(calculatePathLength(path));