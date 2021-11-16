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

            map.origin = this.origin == 'Origin' ? null : this.origin;
            map.destination = this.destination == 'Destination' ? null : this.destination;

            const path = map.recalculate();
            if (path) console.log('Found path: ', path);
        },
    },
})

const locationSearch = new Vue({
    el: '.location-search-container',
    data: {
        isHidden: true,
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
            this.isHidden = false;
            this.activeLocationType = type;
            this.placeholder = 'Search for ' + type;
            this.searchValue = '';
            this.results = [];
        },
        hide: function () {
            this.isHidden = true;
        },
        recents: function () {
            return JSON.parse(localStorage.getItem('recents')) || [];
        },
    },
})

const destinationIndicator = new Vue({
    el: '.destination-indicator',
    data: {
        x: 0,
        y: 0,
    },
})