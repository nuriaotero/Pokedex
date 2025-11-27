// Función para formatear el nombre del Pokémon con símbolos de género
function formatPokemonName(name) {
    // Convertir a minúsculas para hacer la comparación más fácil
    const lowerName = name.toLowerCase();
    
    // Verificar si termina en -male o -m
    if (lowerName.endsWith('-male') || lowerName.endsWith('-m')) {
        // Remover el sufijo y añadir símbolo masculino
        const baseName = name.replace(/[-]?(male|m)$/i, '');
        return `${baseName} ♂`;
    }
    
    // Verificar si termina en -female o -f
    if (lowerName.endsWith('-female') || lowerName.endsWith('-f')) {
        // Remover el sufijo y añadir símbolo femenino
        const baseName = name.replace(/[-]?(female|f)$/i, '');
        return `${baseName} ♀`;
    }
    
    // Si no tiene sufijo de género, devolver el nombre original
    return name;
}

// Función para mostrar el Pokémon en la tarjeta (ACTUALIZADA)
function displayPokemon(pokemon) {
    // Actualizar información básica con nombre formateado
    const formattedName = formatPokemonName(pokemon.name);
    pokemonName.textContent = formattedName;
    pokemonName.innerHTML = formattedName; // Usar innerHTML para permitir estilos si es necesario
    
    pokemonImage.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    pokemonImage.alt = formattedName;
    
    // Actualizar altura y peso
    pokemonHeight.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    pokemonWeight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
    
    // Actualizar tipos
    pokemonTypes.innerHTML = '';
    pokemon.types.forEach((typeInfo, index) => {
        const typeElement = document.createElement('span');
        typeElement.classList.add('type', `type-${typeInfo.type.name}`);
        typeElement.textContent = typeInfo.type.name;
        pokemonTypes.appendChild(typeElement);
    });
    
    // Configurar colores de fondo más claros para la tarjeta
    const primaryType = pokemon.types[0].type.name;
    const secondaryType = pokemon.types[1] ? pokemon.types[1].type.name : primaryType;
    
    // Usar variables CSS para el gradiente de la tarjeta
    pokemonCard.style.setProperty('--type-color-1', `${typeColors[primaryType]}80`);
    pokemonCard.style.setProperty('--type-color-2', `${typeColors[secondaryType]}80`);
    
    // Aplicar clase de tipo para el fondo de la tarjeta
    pokemonCard.className = 'pokemon-card type-' + primaryType;
    
    // Mostrar tarjeta
    showPokemonCard();
}

// Versión alternativa con estilos para los símbolos de género
function formatPokemonNameWithStyles(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.endsWith('-male') || lowerName.endsWith('-m')) {
        const baseName = name.replace(/[-]?(male|m)$/i, '');
        return `${baseName} <span class="gender-symbol male">♂</span>`;
    }
    
    if (lowerName.endsWith('-female') || lowerName.endsWith('-f')) {
        const baseName = name.replace(/[-]?(female|f)$/i, '');
        return `${baseName} <span class="gender-symbol female">♀</span>`;
    }
    
    return name;
}

// CSS adicional para estilizar los símbolos de género (añadir al archivo CSS)
const genderStyles = `
.gender-symbol {
    font-size: 1.2em;
    margin-left: 5px;
    vertical-align: middle;
}

.gender-symbol.male {
    color: #3498db;
    text-shadow: 0 0 3px rgba(52, 152, 219, 0.5);
}

.gender-symbol.female {
    color: #e84393;
    text-shadow: 0 0 3px rgba(232, 67, 147, 0.5);
}
`;

// Función para inyectar los estilos de género
function injectGenderStyles() {
    if (!document.querySelector('#gender-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'gender-styles';
        styleElement.textContent = genderStyles;
        document.head.appendChild(styleElement);
    }
}

// JavaScript completo actualizado para la Pokédex
document.addEventListener('DOMContentLoaded', function() {
    // Inyectar estilos de género
    injectGenderStyles();
    
    // Elementos del DOM
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const pokemonCard = document.getElementById('pokemon-card');
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonTypes = document.getElementById('pokemon-types');
    const pokemonHeight = document.getElementById('pokemon-height');
    const pokemonWeight = document.getElementById('pokemon-weight');
const pokemonNumber = document.getElementById("pokemon-id");
    // Mapeo de colores de fondo según el tipo principal
    const typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };

    // Función para formatear el nombre del Pokémon
    function formatPokemonName(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.endsWith('-male') || lowerName.endsWith('-m')) {
            const baseName = name.replace(/[-]?(male|m)$/i, '');
            return `${baseName} <span class="gender-symbol male">♂</span>`;
        }
        
        if (lowerName.endsWith('-female') || lowerName.endsWith('-f')) {
            const baseName = name.replace(/[-]?(female|f)$/i, '');
            return `${baseName} <span class="gender-symbol female">♀</span>`;
        }
        
        return name;
    }

    // Función para buscar Pokémon
    async function searchPokemon() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            showError('Por favor, ingresa un nombre o ID de Pokémon');
            return;
        }
        
        // Mostrar loading
        showLoading();
        hideError();
        hidePokemonCard();
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
            
            if (!response.ok) {
                throw new Error('Pokémon no encontrado');
            }
            
            const pokemon = await response.json();
            displayPokemon(pokemon);
            
        } catch (error) {
            showError('¡Pokémon no encontrado! Intenta con otro nombre o ID.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    }

    // Función para mostrar el Pokémon en la tarjeta
    function displayPokemon(pokemon) {
        // Actualizar información básica con nombre formateado
        const formattedName = formatPokemonName(pokemon.name);
        pokemonName.innerHTML = formattedName; // Usar innerHTML para renderizar el span
    
        pokemonImage.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        pokemonImage.alt = pokemon.name;
        
        // Actualizar altura y peso
        pokemonHeight.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
        pokemonWeight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
        
        // Actualizar tipos
        pokemonTypes.innerHTML = '';
        pokemon.types.forEach((typeInfo, index) => {
            const typeElement = document.createElement('span');
            typeElement.classList.add('type', `type-${typeInfo.type.name}`);
            typeElement.textContent = typeInfo.type.name;
            pokemonTypes.appendChild(typeElement);
        });
        
        // Configurar colores de fondo según el tipo
        const primaryType = pokemon.types[0].type.name;
        const secondaryType = pokemon.types[1] ? pokemon.types[1].type.name : primaryType;
        
        // Usar variables CSS para el gradiente de la tarjeta
        pokemonCard.style.setProperty('--type-color-1', `${typeColors[primaryType]}80`);
        pokemonCard.style.setProperty('--type-color-2', `${typeColors[secondaryType]}80`);
        
        // Aplicar clase de tipo para el fondo de la tarjeta
        pokemonCard.className = 'pokemon-card type-' + primaryType;
        
        // Mostrar tarjeta
        showPokemonCard();
    }

    // Funciones para mostrar/ocultar elementos
    function showLoading() {
        loading.classList.remove('hidden');
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function showPokemonCard() {
        pokemonCard.classList.remove('hidden');
    }

    function hidePokemonCard() {
        pokemonCard.classList.add('hidden');
    }

    // Event Listeners
    searchBtn.addEventListener('click', searchPokemon);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });

    // Inicialización
    searchInput.focus();
});