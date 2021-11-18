class MapRender {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.addEventListener('touchstart', this.touchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.touchMove.bind(this));
    this.canvas.addEventListener('touchend', this.touchEnd.bind(this));

    this.dragStart;
    this.scaleStart;
  }

  touchStart(evt) {
    const touches = evt.touches;

    if (touches.length == 2) this.scaleStart = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    this.dragStart = this.getAverageTouchLocations(touches);
  }

  touchMove(evt) {
    const touches = evt.touches;

    if (this.scaleStart) {
      const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

      const delta = ((distance - this.scaleStart) / 500) + 1;

      this.ctx.scale(delta, delta);
      this.scaleStart = distance;
    }

    const average = this.getAverageTouchLocations(touches);
    this.ctx.translate(average.x - this.dragStart.x, average.y - this.dragStart.y);

    this.bake();

    evt.preventDefault();
  }

  touchEnd(evt) {
    this.scaleStart = false;

    this.dragStart = this.getAverageTouchLocations(evt.touches);
  }

  bake() {
    const topLeft = this.reverseMatrixTransform(0, 0);
    const bottomRight = this.reverseMatrixTransform(canvas.width, canvas.height);
    this.ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

    if (this.modelImage) this.ctx.drawImage(this.modelImage, 0, 0);

    if (this.currentPath) {
      this.currentPath.forEach(node => {
        this.ctx.fillRect(node.x, node.y, 10, 10);
      })
    }
  }

  translationToPoint(x, y) {
    const { a, e, f } = this.ctx.getTransform();
    return { x: (-e + this.canvas.width / 2) / a - x, y: (-f + this.canvas.height / 2) / a - y };
  }

  centerAt(x, y) {
    const { a, e, f } = this.ctx.getTransform();
    this.ctx.translate((-e + this.canvas.width / 2) / a - x, (-f + this.canvas.height / 2) / a - y);

    this.bake();
  }

  getAverageTouchLocations(touches) {
    let total = { x: 0, y: 0 };
    for (const touch of touches) {
      total.x += touch.clientX;
      total.y += touch.clientY;
    }
    return this.reverseMatrixTransform(total.x / touches.length, total.y / touches.length);
  }

  reverseMatrixTransform(x, y) {
    const { a, b, c, d, e, f } = this.ctx.getTransform().inverse();

    return {
      x: a * x + c * y + e,
      y: b * x + d * y + f,
    }
  }
}

class Map {
  constructor(render) {
    this.render = render;
    this.currentPosition = 'Front Entrance';
  }

  loadModel(model) {
    this.nodes = model.nodes;
    this.metadata = model.metadata;
    this.feetPerPixel = model.feetPerPixel;

    this.render.modelImage = new Image(model.image);
    this.render.modelImage.src = '../models/example2.png';

    this.render.modelImage.addEventListener('load', () => this.render.bake());
  }

  focusOnNode(node) {
    const { x, y } = this.getNodeMetadata(node).position;
    this.render.ctx.scale(1.5, 1.5);
    this.render.centerAt(x, y);
  }

  getNodeMetadata(nodeName) {
    if (nodeName.startsWith('node')) {
      return this.metadata[nodeName];
    } else {
      const node = Object.keys(this.nodes).find(key => this.metadata[key].name === nodeName);
      return { node, ...this.metadata[node] };
    }
  }

  calculateRoute(end) {
    const path = dijkstra.findPath(this.nodes, this.getNodeMetadata(this.currentPosition).node, this.getNodeMetadata(end).node);
    this.render.currentPath = path.map(node => this.getNodeMetadata(node).position);
    this.render.bake();
  }
}

function easeInOutQubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function reciprocal(x) {
  return 1 / x;
}

// --------------------
// Dijkstra's algorithm
// --------------------

var dijkstra = {
  singleSourceShortestPaths: function (graph, s, d) {
    // Predecessor map for each node that has been encountered.
    // node ID => predecessor node ID
    var predecessors = {};

    // Costs of shortest paths from s to all nodes encountered.
    // node ID => cost
    var costs = {};
    costs[s] = 0;

    // Costs of shortest paths from s to all nodes encountered; differs from
    // `costs` in that it provides easy access to the node that currently has
    // the known shortest path from s.
    // XXX: Do we actually need both `costs` and `open`?
    var open = dijkstra.PriorityQueue.make();
    open.push(s, 0);

    var closest,
      u, v,
      cost_of_s_to_u,
      adjacent_nodes,
      cost_of_e,
      cost_of_s_to_u_plus_cost_of_e,
      cost_of_s_to_v,
      first_visit;
    while (!open.empty()) {
      // In the nodes remaining in graph that have a known cost from s,
      // find the node, u, that currently has the shortest path from s.
      closest = open.pop();
      u = closest.value;
      cost_of_s_to_u = closest.cost;

      // Get nodes adjacent to u...
      adjacent_nodes = graph[u] || {};

      // ...and explore the edges that connect u to those nodes, updating
      // the cost of the shortest paths to any or all of those nodes as
      // necessary. v is the node across the current edge from u.
      for (v in adjacent_nodes) {
        if (adjacent_nodes.hasOwnProperty(v)) {
          // Get the cost of the edge running from u to v.
          cost_of_e = adjacent_nodes[v];

          // Cost of s to u plus the cost of u to v across e--this is *a*
          // cost from s to v that may or may not be less than the current
          // known cost to v.
          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

          // If we haven't visited v yet OR if the current known cost from s to
          // v is greater than the new cost we just found (cost of s to u plus
          // cost of u to v across e), update v's cost in the cost list and
          // update v's predecessor in the predecessor list (it's now u).
          cost_of_s_to_v = costs[v];
          first_visit = (typeof costs[v] === 'undefined');
          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
            costs[v] = cost_of_s_to_u_plus_cost_of_e;
            open.push(v, cost_of_s_to_u_plus_cost_of_e);
            predecessors[v] = u;
          }
        }
      }
    }

    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
      throw new Error(msg);
    }

    return predecessors;
  },

  extractShortestPathFromPredecessorList: function (predecessors, d) {
    var nodes = [];
    var u = d;
    var predecessor;
    while (u) {
      nodes.push(u);
      predecessor = predecessors[u];
      u = predecessors[u];
    }
    nodes.reverse();
    return nodes;
  },

  findPath: function (graph, s, d) {
    var predecessors = dijkstra.singleSourceShortestPaths(graph, s, d);
    return dijkstra.extractShortestPathFromPredecessorList(
      predecessors, d);
  },

  /**
   * A very naive priority queue implementation.
   */
  PriorityQueue: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
        t = {},
        key;
      opts = opts || {};
      for (key in T) {
        if (T.hasOwnProperty(key)) {
          t[key] = T[key];
        }
      }
      t.queue = [];
      t.sorter = opts.sorter || T.defaultSorter;
      return t;
    },

    defaultSorter: function (a, b) {
      return a.cost - b.cost;
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      var item = { value: value, cost: cost };
      this.queue.push(item);
      this.queue.sort(this.sorter);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      return this.queue.shift();
    },

    empty: function () {
      return this.queue.length === 0;
    }
  }
};