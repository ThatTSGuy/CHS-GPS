const nodeList = document.querySelector('.node-list');
const nodeStart = document.querySelector('.node-start');
const nodeEnd = document.querySelector('.node-end');
const startPathfind = document.querySelector('.start-pathfind');
const pathLength = document.querySelector('.path-length');

startPathfind.addEventListener('click', () => map.pathfind(nodeStart.value, nodeEnd.value));

const canvas = document.querySelector('.canvas');

canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight - 300;

const map = new CanvasMap(canvas);

// async function fetchModel(modelName) {
//     return new Promise((resolve, reject) => {
//         const response = await fetch(`/models/${modelName}.json`);
//         const model = await response.json();

//         resolve(model);
//     })
// }

map.loadModel({"nodes":{"node0":{"node6":105,"node5":57,"node4":55},"node1":{"node4":36},"node2":{"node4":75},"node3":{"node4":40},"node4":{"node0":55,"node1":36,"node3":40,"node2":75,"node22":32},"node5":{"node9":71,"node0":57},"node6":{"node0":105,"node7":86,"node8":102,"node21":77},"node7":{"node16":128,"node15":137,"node8":57,"node6":86},"node8":{"node7":57,"node9":52,"node6":102},"node9":{"node8":52,"node10":85,"node5":71},"node10":{"node9":85,"node11":66},"node11":{"node12":96,"node13":77,"node10":66},"node12":{"node14":63,"node13":69,"node11":96,"node15":89},"node13":{"node12":69,"node11":77},"node14":{"node17":92,"node12":63},"node15":{"node12":89,"node16":122,"node7":137},"node16":{"node15":122,"node7":128},"node17":{"node18":59,"node14":92},"node18":{"node19":59,"node17":59},"node19":{"node20":102,"node18":59},"node20":{"node19":102},"node21":{"node6":77},"node22":{"node4":32}},"metadata":{"node0":{"name":"node0","position":{"x":692,"y":241}},"node1":{"name":"Laundry","position":{"x":755,"y":219}},"node2":{"name":"Door","position":{"x":750,"y":329}},"node3":{"name":"Bath","position":{"x":777,"y":279}},"node4":{"name":"Entry","position":{"x":745,"y":254}},"node5":{"name":"Island","position":{"x":653,"y":282}},"node6":{"name":"Kitchen","position":{"x":634,"y":154}},"node7":{"name":"node7","position":{"x":554,"y":187}},"node8":{"name":"node8","position":{"x":577,"y":239}},"node9":{"name":"node9","position":{"x":583,"y":291}},"node10":{"name":"Dining Room","position":{"x":534,"y":361}},"node11":{"name":"node11","position":{"x":468,"y":361}},"node12":{"name":"Foyer","position":{"x":384,"y":314}},"node13":{"name":"Front Door","position":{"x":395,"y":383}},"node14":{"name":"node14","position":{"x":321,"y":313}},"node15":{"name":"node15","position":{"x":427,"y":236}},"node16":{"name":"Living Room","position":{"x":448,"y":116}},"node17":{"name":"Master Bedroom","position":{"x":242,"y":360}},"node18":{"name":"node18","position":{"x":207,"y":313}},"node19":{"name":"Master Bath","position":{"x":227,"y":258}},"node20":{"name":"Walk In Closet","position":{"x":325,"y":228}},"node21":{"name":"Back Door","position":{"x":640,"y":78}},"node22":{"name":"Closet","position":{"x":774,"y":240}}},"image":"https://bt-wpstatic.freetls.fastly.net/wp-content/blogs.dir/2318/files/2019/03/Floor-Plan-1st-Floor.png","feetPerPixel":0.086806})

//feetPerPixel: 0.086806
//map.pathfind('Master Bedroom', 'Entry');