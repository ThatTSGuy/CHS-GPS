const canvas = document.querySelector('.canvas');

const render = new MapRender(canvas, window.innerWidth, window.innerHeight);
const map = new Map(render);

const nodeList = [];
fetch('../models/example2.json').then(response => response.json())
    .then(model => {
        map.loadModel(model);
        for (const node in map.nodes) {
            const name = map.metadata[node].name;
            if (!name.startsWith('node')) nodeList.push(name);
        }
        nodeList.sort();
    });

const search = new Vue({
    el: '.search',
    data: {
        isMenuOpen: false,
        inputValue: '',
        results: [
            { text: 'A101', recent: false },
            { text: 'A102', recent: false },
            { text: 'A105', recent: false },
            { text: 'A101', recent: false },
            { text: 'A102', recent: false },
            { text: 'A105', recent: false },
            { text: 'A101', recent: false },
            { text: 'A102', recent: false },
            { text: 'A105', recent: false },
            { text: 'A101', recent: false },
            { text: 'A102', recent: false },
            { text: 'A105', recent: false },
            { text: 'Bathroom', recent: true },
            { text: 'Main Office', recent: true },
        ],
        recents: [],
    },
    methods: {
        openMenu: function () {
            this.isMenuOpen = true;
        },
        closeMenu: function () {
            this.isMenuOpen = false;
        },
    },
})