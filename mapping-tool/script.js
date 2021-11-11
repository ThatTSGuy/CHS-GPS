const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const floorPlan = document.querySelector('.floor-plan');

window.onload = function () {
    canvas.width = floorPlan.width;
    canvas.height = floorPlan.height;

    render();
};

let dragStart;

canvas.addEventListener('mousedown', evt => {
    dragStart = transformPoint(evt.offsetX, evt.offsetY);
})

canvas.addEventListener('mouseup', evt => {
    dragStart = null;
})

canvas.addEventListener('mousemove', evt => {
    if (dragStart) {
        const transformed = transformPoint(evt.offsetX, evt.offsetY);

        ctx.translate(transformed.x - dragStart.x, transformed.y - dragStart.y);
        
        render();
    }
})

canvas.addEventListener('wheel', evt => {
    let delta = 1 + evt.wheelDelta / 1000;

    const matrixZoom = ctx.getTransform().a * delta;
    if (matrixZoom < 0.5 || matrixZoom > 3 ) delta = 1;

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
}

function transformPoint(x, y) {
    const matrix = ctx.getTransform().inverse();

    return {
        x: matrix.a * x + matrix.c * y + matrix.e,
        y: matrix.b * x + matrix.d * y + matrix.f,
    }
}