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

const storage = window.localStorage;

const search = new Vue({
    el: '.search',
    data: {
        isMenuOpen: false,
        inputValue: '',
        searchResults: [],
    },
    methods: {
        search: function () {
            const value = document.querySelector('.search-bar-input').value.trim().toLowerCase();
            const results = value == '' ? [] : nodeList.filter(node => node.toLowerCase().startsWith(value));

            this.searchResults = [
                ...results.map(result => ({ text: result, recent: false })),
                ...JSON.parse(storage.getItem('recents') || '[]').map(recent => ({ text: recent, recent: true })),
            ];
        },
        clickedResult: function (node) {
            document.querySelector('.search-bar-input').value = node;
            map.focusOnNode(node);

            const recents = JSON.parse(storage.getItem('recents') || '[]').slice(0, 2);
            recents.unshift(node);
            storage.setItem('recents', JSON.stringify(recents));

            preview.show(node);

            this.closeMenu();
        },
        openMenu: function () {
            this.isMenuOpen = true;
            this.search();
        },
        closeMenu: function () {
            this.isMenuOpen = false;
            this.searchResults = [];
            document.querySelector('.search-bar-input').value = '';
        },
    },
})

const preview = new Vue({
    el: '.preview',
    data: {
        isHidden: true,
        node: '',
        imageSrc: 'https://picsum.photos/200?random=1',
    },
    methods: {
        show: function (node) {
            map.calculateRoute(node);
            this.node = node;
            this.isHidden = false;
        },
    },
})