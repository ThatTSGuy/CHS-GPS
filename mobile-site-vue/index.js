const canvas = document.querySelector('.canvas');

canvas.width = window.innerWidth
canvas.height = window.innerHeight;

const map = new CanvasMap(canvas);

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

const locationSelector = new Vue({
    el: '.location-selector-container',
    data: {
        origin: 'Origin',
        destination: 'Destination',
    },
    methods: {
        showSearch: function (type) {
            locationSearch.show(type);
        },
        setLocation: function (type, location) {
            this[type] = location;

            if (this.origin !== 'Origin' && this.destination !== 'Destination') {
                map.pathfind(this.origin, this.destination);
            }
        },
    },
})

const locationSearch = new Vue({
    el: '.location-search-container',
    data: {
        visible: false,
        activeLocationType: '',
        placeholder: '',
        searchValue: '',
        results: [],
    },
    methods: {
        search: function () {
            const value = this.searchValue.toLowerCase();
            if (value == '') {
                this.results = [];
            } else {
                this.results = nodeList.filter(node => node.toLowerCase().startsWith(value));
            }
        },
        clickedLocation: function (result) {
            locationSelector.setLocation(this.activeLocationType, result);

            const recents = JSON.parse(localStorage.getItem('recents') || '[]').slice(0, 5);
            recents.unshift(result);
            localStorage.setItem('recents', JSON.stringify(recents));

            this.hide();
        },
        show: function (type) {
            this.visible = true;
            this.activeLocationType = type;
            this.placeholder = 'Search for ' + type;
            this.searchValue = '';
            this.results = [];
        },
        hide: function () {
            this.visible = false;
        },
        recents: function () {
            return JSON.parse(localStorage.getItem('recents')) || [];
        },
    },
})