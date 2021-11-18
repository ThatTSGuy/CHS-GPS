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
        searchResults: [],
    },
    methods: {
        search: function() {
            const value = document.querySelector('.search-bar-input').value.trim().toLowerCase();
            const results = nodeList.filter(node => node.toLowerCase().startsWith(value));
            this.searchResults = results.map(result => ({ text: result, recent: false }));
        },
        clickedResult: function(node) {
            document.querySelector('.search-bar-input').value = node.text;
            this.closeMenu();
        },
        openMenu: function () {
            this.isMenuOpen = true;
            document.querySelector('.search-bar-input').value = '';
        },
        closeMenu: function () {
            this.isMenuOpen = false;
            this.searchResults = [];
        },
    },
})