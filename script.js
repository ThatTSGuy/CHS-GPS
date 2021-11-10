const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

let graph = {
    start: { A: 5, B: 2 },
    A: { start: 1, C: 4, D: 2 },
    B: { A: 8, D: 7 },
    C: { D: 6, finish: 3 },
    D: { finish: 1 },
    finish: {},
}

function shortestDistanceNode(distances, visited) {
    let shortest = Infinity;

    for (let node in distances) {
        console.log(node);
    }
}

shortestDistanceNode(graph, {});