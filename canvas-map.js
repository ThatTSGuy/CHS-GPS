class CanvasMap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.dragStart, this.nodes, this.metadata, this.modelImage, this.feetPerPixel, this.currentPath;
        this.zooming;
    }

    hookEvents() {
        // this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        // this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        // this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        // this.canvas.addEventListener('contextmenu', this.contextMenu.bind(this));
        // this.canvas.addEventListener('wheel', this.wheel.bind(this), { passive: true });

        this.canvas.addEventListener('touchstart', evt => {
            const touches = evt.touches;

            if (touches.length == 2) this.zooming = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

            this.dragStart = this.getAverageOfTouches(touches);
        });

        this.canvas.addEventListener('touchmove', evt => {
            const touches = evt.touches;

            if (this.zooming) {
                const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

                const delta = ((distance - this.zooming) / 500) + 1;

                this.ctx.scale(delta, delta);
                this.zooming = distance;
            }

            const average = this.getAverageOfTouches(touches);
            this.ctx.translate(average.x - this.dragStart.x, average.y - this.dragStart.y);

            this.render();

            evt.preventDefault();
        });

        this.canvas.addEventListener('touchend', evt => {
            this.zooming = false;

            this.dragStart = this.getAverageOfTouches(evt.touches);
        });
    }

    loadModel(model) {
        this.nodes = model.nodes;
        this.metadata = model.metadata;
        this.feetPerPixel = model.feetPerPixel;

        this.modelImage = new Image();
        this.modelImage.src = model.image;
        this.modelImage.addEventListener('load', () => {
            this.hookEvents();
            this.render()
        })
    }

    mouseMove(evt) {
        if (this.dragStart) {
            const transformed = this.transformPoint(evt.offsetX, evt.offsetY);

            this.ctx.translate(transformed.x - this.dragStart.x, transformed.y - this.dragStart.y);
        }

        this.render();
    }

    mouseDown(evt) {
        if (evt.buttons == 1) {
            this.dragStart = this.transformPoint(evt.offsetX, evt.offsetY);
        }

        this.render();
    }

    mouseUp(evt) {
        this.dragStart = null
    }

    contextMenu(evt) {
        evt.preventDefault()
    }

    wheel(evt) {
        let delta = 1 + evt.wheelDelta / 1000;

        const matrixZoom = this.ctx.getTransform().a * delta;
        if (matrixZoom < 0.5 || matrixZoom > 3) delta = 1;

        const transformed = this.transformPoint(evt.offsetX, evt.offsetY);

        this.ctx.translate(transformed.x, transformed.y);
        this.ctx.scale(delta, delta);
        this.ctx.translate(-transformed.x, -transformed.y);

        this.render();
    }

    render() {
        const topLeft = this.transformPoint(0, 0);
        const bottomRight = this.transformPoint(canvas.width, canvas.height);
        this.ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

        this.ctx.drawImage(this.modelImage, 0, 0);

        if (!this.currentPath) {
            for (const node in this.nodes) for (const neighbour in this.nodes[node]) this.drawNodeConnection(node, neighbour);
            for (const node in this.nodes) this.drawNode(node);
        }

        let lastNode;
        this.currentPath?.forEach(node => {
            const { x, y } = this.metadata[node].position;

            if (node == this.currentPath[0] || node == this.currentPath[this.currentPath.length - 1]) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'lime';
                this.ctx.fill();
            }

            if (lastNode) {
                const { x: x1, y: y1 } = this.metadata[lastNode].position;
                const { x: x2, y: y2 } = this.metadata[node].position;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokeStyle = 'lime';
                this.ctx.lineWidth = 5;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }
            lastNode = node;
        })
    }

    drawNode(node, color = 'red') {
        const { x, y } = this.metadata[node].position;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawNodeConnection(node1, node2, color = 'black') {
        const { x: x1, y: y1 } = this.metadata[node1].position;
        const { x: x2, y: y2 } = this.metadata[node2].position;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    transformPoint(x, y) {
        const matrix = this.ctx.getTransform().inverse();

        return {
            x: matrix.a * x + matrix.c * y + matrix.e,
            y: matrix.b * x + matrix.d * y + matrix.f,
        }
    }

    getAverageOfTouches(touches) {
        let total = { x: 0, y: 0 };
        for (const touch of touches) {
            total.x += touch.clientX;
            total.y += touch.clientY;
        }
        return this.transformPoint(total.x / touches.length, total.y / touches.length);
    }

    getNodeFromName(name) {
        return Object.keys(this.metadata).find(node => this.metadata[node].name == name);
    }

    pixelsToLength(pixels) {
        const feetAndInches = pixels * this.feetPerPixel;

        return {
            feet: Math.trunc(feetAndInches),
            inches: Math.round((feetAndInches - Math.trunc(feetAndInches)) * 12),
        }
    }

    // Pathfinding functions

    pathfind(start, end) {
        const path = dijkstra.findPath(this.nodes, this.getNodeFromName(start), this.getNodeFromName(end));
        this.currentPath = path;
        
        this.render();

        let pixels = 0;
        let lastNode;
        this.currentPath.forEach(node => {
            if (lastNode) pixels += this.nodes[node][lastNode];
            lastNode = node;
        })

        const length = this.pixelsToLength(pixels);

        return { length, path };
    }
}