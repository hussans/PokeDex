const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const shinyFormBtn = document.getElementById('shinyFormBtn');
const pokemonName = document.getElementById('pokemonName');
const elementDisplay = document.getElementById('elementDisplay');
const locationDisplay = document.getElementById('locationDisplay');
const abilitiesBtn = document.getElementById('abilitiesBtn');
const movesBtn = document.getElementById('movesBtn');
const abilitiesPopup = document.getElementById('abilitiesPopup');
const movesPopup = document.getElementById('movesPopup');
const favoritesPopup = document.getElementById('favoritesPopup');
const closeAbilitiesPopup = document.getElementById('closeAbilitiesPopup');
const closeMovesPopup = document.getElementById('closeMovesPopup');
const closeFavoritesPopup = document.getElementById('closeFavoritesPopup');
const evoContainer = document.getElementById('evoContainer');
const pokemonImage = document.getElementById('pokemonImage');
const nightModeBtn = document.getElementById('nightAndDayMode');
const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
const favoritesBtn = document.getElementById('pokemonFavorites');
const favoritesList = document.querySelector('#favoritesPopup .bg-\\[\\#dddddd\\]');

let currentPokemon = null;
let isShiny = false;
let isNightMode = false;


fetchPokemonData(1);


nightModeBtn.addEventListener('click', function() {
    isNightMode = !isNightMode;
    if (isNightMode) {
        document.body.style.backgroundColor = '#2d3748';
    } else {
        document.body.style.backgroundColor = '#808080';
    }
    localStorage.setItem('nightMode', isNightMode);
});


if (localStorage.getItem('nightMode') === 'true') {
    isNightMode = true;
    document.body.style.backgroundColor = '#2d3748';
}


searchBtn.addEventListener('click', function() {
    let input = searchInput.value.trim().toLowerCase();
    if (!input) return;

    if (isNaN(input)) {
        fetchPokemonData(input);
    } else {
        let num = Number(input);
        if (num >= 1 && num <= 649) {
            fetchPokemonData(num);
        } else {
            alert('Please enter a number between 1-649');
        }
    }
});


randomizeBtn.addEventListener('click', function() {
    let randomId = Math.floor(Math.random() * 649) + 1;
    fetchPokemonData(randomId);
});


shinyFormBtn.addEventListener('click', function() {
    isShiny = !isShiny;
    updatePokemonImage();
});


addToFavoritesBtn.addEventListener('click', function() {
    if (!currentPokemon) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let found = false;

    for (let i = 0; i < favorites.length; i++) {
        if (favorites[i] === currentPokemon.id) {
            found = true;
            break;
        }
    }

    if (!found) {
        favorites.push(currentPokemon.id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
});


favoritesBtn.addEventListener('click', function() {
    favoritesPopup.style.display = 'block';
    updateFavoritesList();
});


closeFavoritesPopup.addEventListener('click', function() {
    favoritesPopup.style.display = 'none';
});

function updateFavoritesList() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';

    for (let i = 0; i < favorites.length; i++) {
        let container = document.createElement('div');
        container.className = 'flex items-center justify-between mb-2';

        let img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${favorites[i]}.png`;
        img.className = 'cursor-pointer w-25 h-25';
        img.onclick = function() {
            fetchPokemonData(favorites[i]);
            favoritesPopup.style.display = 'none';
        };

        let removeBtn = document.createElement('img');
        removeBtn.src = './assets/close.png';
        removeBtn.className = 'w-6 h-6 cursor-pointer';
        removeBtn.onclick = function() {
            let newFavorites = [];
            for (let j = 0; j < favorites.length; j++) {
                if (favorites[j] !== favorites[i]) {
                    newFavorites.push(favorites[j]);
                }
            }
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            updateFavoritesList();
        };

        container.appendChild(img);
        container.appendChild(removeBtn);
        favoritesList.appendChild(container);
    }
}


async function fetchPokemonData(identifier) {
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) {
            alert('Pokémon not found!');
            return;
        }
        currentPokemon = await response.json();
        updateDisplay();
        getLocation();
        getEvolutionChain();
    } catch (error) {
        alert('Error loading Pokémon data');
    }
}


function updateDisplay() {
    pokemonName.textContent = currentPokemon.name[0].toUpperCase() + currentPokemon.name.slice(1);

    let types = '';
    for (let i = 0; i < currentPokemon.types.length; i++) {
        types += currentPokemon.types[i].type.name;
        if (i < currentPokemon.types.length - 1) {
            types += ', ';
        }
    }
    elementDisplay.textContent = types;

    updatePokemonImage();
}

function updatePokemonImage() {
    let imgUrl = isShiny ? currentPokemon.sprites.front_shiny : currentPokemon.sprites.front_default;
    pokemonImage.innerHTML = `<img src="${imgUrl}" class="w-[300px]">`;
}


async function getLocation() {
    try {
        let response = await fetch(currentPokemon.location_area_encounters);
        let locations = await response.json();

        if (locations.length > 0) {
            locationDisplay.textContent = locations[0].location_area.name;
        } else {
            locationDisplay.textContent = 'N/A';
        }
    } catch {
        locationDisplay.textContent = 'N/A';
    }
}


async function getEvolutionChain() {
    try {
        let speciesResponse = await fetch(currentPokemon.species.url);
        let speciesData = await speciesResponse.json();

        let evolutionResponse = await fetch(speciesData.evolution_chain.url);
        let evolutionData = await evolutionResponse.json();

        showEvolutions(evolutionData.chain);
    } catch {
        evoContainer.innerHTML = 'N/A';
    }
}


async function showEvolutions(chain) {
    evoContainer.innerHTML = '';

    try {
        let hasEvolutions = false;
        let currentEvolution = chain;

        while(currentEvolution) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentEvolution.species.name}`);
            const pokemon = await response.json();

            if(pokemon.name !== currentPokemon.name) {
                const div = document.createElement('div');
                div.className = 'bg-[#D9D9D940] w-[33.33%] rounded-xl flex items-center justify-center';
                div.innerHTML = `<img src="${pokemon.sprites.front_default}" class="w-20 h-20">`;
                evoContainer.appendChild(div);
                hasEvolutions = true;
            }

            if(currentEvolution.evolves_to.length > 0) {
                currentEvolution = currentEvolution.evolves_to[0];
            } else {
                currentEvolution = null;
            }
        }

        if(!hasEvolutions) {
            showNoEvolutions();
        }

    } catch {
        showNoEvolutions();
    }
}

function showNoEvolutions() {
    evoContainer.innerHTML = `
        <div class="bg-[#D9D9D940] w-full rounded-xl flex items-center justify-center p-4">
            <p class="text-white text-xl">N/A</p>
        </div>
    `;
}


abilitiesBtn.addEventListener('click', function() {
    abilitiesPopup.style.display = 'block';

    let abilitiesText = '';
    for (let i = 0; i < currentPokemon.abilities.length; i++) {
        abilitiesText += currentPokemon.abilities[i].ability.name;
        if (i < currentPokemon.abilities.length - 1) {
            abilitiesText += ', ';
        }
    }

    document.querySelector('#abilitiesPopup .bg-\\[\\#dddddd\\] p').textContent = abilitiesText;
});


movesBtn.addEventListener('click', function() {
    movesPopup.style.display = 'block';

    let movesText = '';
    for (let i = 0; i < currentPokemon.moves.length; i++) {
        movesText += currentPokemon.moves[i].move.name;
        if (i < currentPokemon.moves.length - 1) {
            movesText += ', ';
        }
    }

    document.querySelector('#movesPopup .bg-\\[\\#dddddd\\] p').textContent = movesText;
});


closeAbilitiesPopup.addEventListener('click', function() {
    abilitiesPopup.style.display = 'none';
});

closeMovesPopup.addEventListener('click', function() {
    movesPopup.style.display = 'none';
});

abilitiesPopup.style.display = 'none';
movesPopup.style.display = 'none';
favoritesPopup.style.display = 'none';