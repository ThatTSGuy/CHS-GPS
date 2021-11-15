// Setup canvas + map

const canvas = document.querySelector('.canvas');

canvas.width = window.innerWidth
canvas.height = window.innerHeight;

const map = new CanvasMap(canvas);

let nodeList = ['A102', 'A103', 'B1'];
fetch('../models/example2.json').then(response => response.json())
    .then(model => {
        map.loadModel(model);
        for (const node in map.nodes) {
            const name = map.metadata[node].name;
            if (!name.startsWith('node')) nodeList.push(name);
        }
        nodeList.sort();
    });

// Setup UI

const storage = window.localStorage;

let activeLocationInput;

const locationSearch = document.querySelector('.location-search');
const locationSearchBack = document.querySelector('.location-search-back');
const locationSearchInput = document.querySelector('.location-search-input');

const locationSearchResults = document.querySelector('.location-search-results');
const locationSearchRecentsLabel = document.querySelector('.location-search-recents-label');
const locationSearchRecents = document.querySelector('.location-search-recents');

const destinationInput = document.querySelector('.destination');
const originInput = document.querySelector('.origin');

function arrayToDivs(array) {
    const divs = [];
    for (const item of array) {
        const div = document.createElement('div');
        div.innerText = item;

        divs.push(div);
    }
    
    return divs;
}

storage.recents = storage.recents.startsWith('[') ? storage.recents : '[]';
function getRecents() {
    recents = JSON.parse(storage.recents);

    return recents;
}

function addRecent(name) {
    const recents = getRecents();
    recents.push(name);
    storage.recents = JSON.stringify(recents.slice(0, 10));
}

function hide(el) { el.classList.add('hidden'); }
function show(el) { el.classList.remove('hidden'); }