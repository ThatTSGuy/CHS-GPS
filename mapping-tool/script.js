const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const floorPlan = document.querySelector('.floor-plan');
const nameInput = document.querySelector('.name-input');
const nodeDelete = document.querySelector('.node-delete');

let nodes = {};
let nodeCounter = 0;

nameInput.addEventListener('keyup', () => {
    for (const node in nodes) {
        if (nodes[node].selected) nodes[node].name = nameInput.value;
    }
})

nodeDelete.addEventListener('click', () => {
    for (const node in nodes) {
        if (nodes[node].selected) {
            for (const neighbour in nodes[node].neighbours) {
                delete nodes[neighbour].neighbours[node];
            }

            delete nodes[node];
        }
    }
})

window.onload = function () {
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight - 300;

    render();
};

let dragStart;
let dragPoint;
let connectingPoint;
let connectingLine;

canvas.addEventListener('mousedown', evt => {
    dragPoint = getNodeAtPoint(evt.offsetX, evt.offsetY);

    if (evt.buttons == 1 && !dragPoint) {
        dragStart = transformPoint(evt.offsetX, evt.offsetY);
    } else if (evt.buttons == 1 && dragPoint) {
        for (const node in nodes) {
            if (dragPoint == node) {
                nodes[node].selected = true;
                nameInput.value = nodes[node].name;
            } else nodes[node].selected = false;
        }
    } else if (evt.buttons == 2) {
        if (dragPoint) {
            connectingPoint = dragPoint;
            dragPoint = null;
        } else {
            const transformed = transformPoint(evt.offsetX, evt.offsetY);
            const id = 'node' + nodeCounter++;

            nodes[id] = {
                name: id,
                position: { x: transformed.x, y: transformed.y },
                neighbours: {},
                selected: false,
            };
        }
    }

    render();
})

canvas.addEventListener('contextmenu', evt => evt.preventDefault());

canvas.addEventListener('mouseup', evt => {
    const hoverPoint = getNodeAtPoint(evt.offsetX, evt.offsetY);

    if (connectingPoint && hoverPoint) {
        const distance = distanceBetween(nodes[hoverPoint].position, nodes[connectingPoint].position);

        nodes[connectingPoint].neighbours[hoverPoint] = distance;
        nodes[hoverPoint].neighbours[connectingPoint] = distance;

        render();
    } else if (dragPoint) {
        const point = nodes[dragPoint].position;

        for (const neighbour in nodes[dragPoint].neighbours) {
            const nPoint = nodes[neighbour].position;

            const distance = distanceBetween(point, nPoint);
            nodes[dragPoint].neighbours[neighbour] = distance;
            nodes[neighbour].neighbours[dragPoint] = distance;
        }
    }

    dragStart = dragPoint = connectingPoint = connectingLine = null;
})

canvas.addEventListener('mousemove', evt => {
    if (dragStart) {
        const transformed = transformPoint(evt.offsetX, evt.offsetY);

        ctx.translate(transformed.x - dragStart.x, transformed.y - dragStart.y);
    } else if (dragPoint) {
        const transformed = transformPoint(evt.offsetX, evt.offsetY);

        nodes[dragPoint].position = { x: transformed.x, y: transformed.y };
    } else if (connectingPoint) {
        connectingLine = {
            point1: transformPoint(evt.offsetX, evt.offsetY),
            point2: nodes[connectingPoint].position,
        }
    }

    render();
})

canvas.addEventListener('wheel', evt => {
    let delta = 1 + evt.wheelDelta / 1000;

    const matrixZoom = ctx.getTransform().a * delta;
    if (matrixZoom < 0.5 || matrixZoom > 3) delta = 1;

    const transformed = transformPoint(evt.offsetX, evt.offsetY);

    ctx.translate(transformed.x, transformed.y);
    ctx.scale(delta, delta);
    ctx.translate(-transformed.x, -transformed.y);

    render();
}, { passive: true });

function render() {
    const topLeft = transformPoint(0, 0);
    const bottomRight = transformPoint(canvas.width, canvas.height);
    ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

    ctx.drawImage(floorPlan, 0, 0);

    for (const node in nodes) {
        const { selected, position: { x, y } } = nodes[node];

        for (const neighbour in nodes[node].neighbours) {
            const { x: nx, y: ny } = nodes[neighbour].position;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = selected ? 'blue' : 'red';
        ctx.fill();
    }

    if (connectingLine) {
        ctx.beginPath();
        ctx.moveTo(connectingLine.point1.x, connectingLine.point1.y);
        ctx.lineTo(connectingLine.point2.x, connectingLine.point2.y);
        ctx.stroke();
    }
}

function transformPoint(x, y) {
    const matrix = ctx.getTransform().inverse();

    return {
        x: matrix.a * x + matrix.c * y + matrix.e,
        y: matrix.b * x + matrix.d * y + matrix.f,
    }
}

function getNodeAtPoint(pointX, pointY) {
    for (const node in nodes) {
        const { x, y } = nodes[node].position;
        const { x: eventX, y: eventY } = transformPoint(pointX, pointY);

        if (distanceBetween({ x, y }, { x: eventX, y: eventY }) < 25) return node;
    }
}

function distanceBetween(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    return Math.round(Math.sqrt(dx * dx + dy * dy));
}

function exportNodes() {
    const exportedNodes = {};
    const exportedMetadata = {};

    for (const node in nodes) {
        const { name, position, neighbours } = nodes[node];

        exportedNodes[node] = neighbours;
        exportedMetadata[node] = {
            name, position:
            {
                x: Math.round(position.x),
                y: Math.round(position.y),
            }
        };
    }

    return JSON.stringify({ nodes: exportedNodes, metadata: exportedMetadata, image: floorPlan.src, feetPerPixel: null });
}