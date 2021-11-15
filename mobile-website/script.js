const canvas = document.querySelector('.canvas');

canvas.width = window.innerWidth
canvas.height = window.innerHeight;

const map = new CanvasMap(canvas);

let nodeList = [];
fetch('../models/example2.json').then(response => response.json())
    .then(model => {
        map.loadModel(model);
        for (const node in map.nodes) {
            const name = map.metadata[node].name;
            if (!name.startsWith('node')) nodeList.push(name);
        }
        nodeList.sort();
    });

const searchBarInput = document.querySelector('.search-bar-input');
const searchResultsContainer = document.querySelector('.search-results');

searchBarInput.addEventListener('input', evt => {
    const search = searchBarInput.value.toLowerCase().trim();

    const searchResults = nodeList.filter(node => node.toLowerCase().startsWith(search));

    while (searchResultsContainer.firstChild) {
        searchResultsContainer.removeChild(searchResultsContainer.firstChild);
    }

    searchResults.forEach(result => {
        const resultElement = document.createElement('div');

        resultElement.classList.add('search-result');
        resultElement.innerText = result;

        searchResultsContainer.appendChild(resultElement);
    })
})

searchBarInput.addEventListener('blur', evt => {
    while (searchResultsContainer.firstChild) {
        searchResultsContainer.removeChild(searchResultsContainer.firstChild);
    }
})