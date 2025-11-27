// translations.js
const POKEMON_TRANSLATIONS = {
    // Nombres de Pokémon
    'bulbasaur': 'bulbasaur',
    'ivysaur': 'ivysaur', 
    'venusaur': 'venusaur',
    'charmander': 'charmander',
    'charmeleon': 'charmeleon',
    'charizard': 'charizard',
    'squirtle': 'squirtle',
    'wartortle': 'wartortle',
    'blastoise': 'blastoise',
    'pikachu': 'pikachu',
    'raichu': 'raichu',
    'eevee': 'eevee',
    'vaporeon': 'vaporeon',
    'jolteon': 'jolteon',
    'flareon': 'flareon',
    // Agrega más traducciones según necesites
};

const TYPE_TRANSLATIONS = {
    'normal': 'normal',
    'fire': 'fuego',
    'water': 'agua',
    'electric': 'eléctrico',
    'grass': 'planta',
    'ice': 'hielo',
    'fighting': 'lucha',
    'poison': 'veneno',
    'ground': 'tierra',
    'flying': 'volador',
    'psychic': 'psíquico',
    'bug': 'bicho',
    'rock': 'roca',
    'ghost': 'fantasma',
    'dragon': 'dragón',
    'dark': 'siniestro',
    'steel': 'acero',
    'fairy': 'hada'
};

const ABILITY_TRANSLATIONS = {
    'overgrow': 'Espesura',
    'chlorophyll': 'Clorofila',
    'blaze': 'Mar Llamas',
    'solar-power': 'Poder Solar',
    'torrent': 'Torrente',
    'rain-dish': 'Cura Lluvia',
    'shield-dust': 'Polvo Escudo',
    'run-away': 'Fuga',
    'shed-skin': 'Mudar',
    'compound-eyes': 'Ojo Compuesto',
    'swarm': 'Enjambre',
    'keen-eye': 'Vista Lince',
    'tangled-feet': 'Tumbos',
    'big-pecks': 'Sacapecho',
    'hustle': 'Entusiasmo',
    'static': 'Electricidad Estática',
    'lightning-rod': 'Pararrayos',
    'sand-veil': 'Velo Arena',
    'poison-point': 'Punto Tóxico',
    'rivalry': 'Rivalidad',
    'guts': 'Agallas'
};

const STAT_TRANSLATIONS = {
    'hp': 'PS',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defensa Especial',
    'speed': 'Velocidad'
};

class PokedexApp {

    
    constructor() {
        this.currentView = 'list';
        this.currentPage = 0;
        this.limit = 20;
        this.favorites = JSON.parse(localStorage.getItem('pokedexFavorites') || '[]');
        this.allPokemon = [];
        this.filteredPokemon = [];
        this.currentTypeFilter = 'all';
        this.currentGenFilter = 'all';
        this.init();
    }

    init() {
        this.injectGenderStyles();
        this.setupEventListeners();
        this.loadInitialData();
        
        // Cargar tema
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        document.getElementById('theme-btn').textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }

    injectGenderStyles() {
        if (!document.querySelector('#gender-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'gender-styles';
            styleElement.textContent = `
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
            document.head.appendChild(styleElement);
        }
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showView(e.target.dataset.view);
            });
        });

        // Paginación
        document.getElementById('prev-btn').addEventListener('click', () => this.prevPage());
        document.getElementById('next-btn').addEventListener('click', () => this.nextPage());

        // Búsqueda
        document.getElementById('search-btn').addEventListener('click', () => this.searchPokemon());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPokemon();
        });

        // Filtros
        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.currentTypeFilter = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('gen-filter').addEventListener('change', (e) => {
            this.currentGenFilter = e.target.value;
            this.applyFilters();
        });

        // Tema
        document.getElementById('theme-btn').addEventListener('click', () => this.toggleTheme());
        
        // Favoritos desde header
        document.getElementById('favorites-btn').addEventListener('click', () => {
            this.showView('favorites');
        });

        // Volver
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showView(this.previousView || 'list');
        });
    }

    async loadInitialData() {
        await this.loadFilters();
        await this.loadAllPokemon();
    }

    async loadAllPokemon() {
        this.showLoading(true);
        try {
            console.log('🔄 Cargando lista de Pokémon...');
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            if (!response.ok) {
                console.error('❌ Error en loadAllPokemon: Response no OK');
                throw new Error('Error cargando Pokémon');
            }
            const data = await response.json();
            this.allPokemon = data.results;
            this.filteredPokemon = [...this.allPokemon];
            console.log(`✅ Lista cargada: ${this.allPokemon.length} Pokémon`);
            this.loadPokemonList();
        } catch (error) {
            console.error('💥 Error crítico en loadAllPokemon:', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async loadPokemonList() {
        this.showLoading(true);
        try {
            const startIndex = this.currentPage * this.limit;
            const endIndex = startIndex + this.limit;
            const pagePokemon = this.filteredPokemon.slice(startIndex, endIndex);
            
            const container = document.getElementById('pokemon-list');
            container.innerHTML = '';
            
            if (this.filteredPokemon.length === 0) {
                container.innerHTML = `
                    <div class="empty" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <p>No se encontraron Pokémon con los filtros aplicados</p>
                        <button onclick="app.clearFilters()" style="margin-top: 10px; padding: 10px 20px; background: var(--blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Limpiar filtros
                        </button>
                    </div>
                `;
                this.updatePagination();
                return;
            }
            
            for (const pokemon of pagePokemon) {
                try {
                    const pokemonData = await this.fetchPokemon(pokemon.name);
                    if (pokemonData) {
                        container.appendChild(this.createPokemonCard(pokemonData));
                    }
                } catch (error) {
                    console.error(`❌ Error cargando ${pokemon.name}:`, error.message);
                }
            }
            
            this.updatePagination();
        } catch (error) {
            console.error('💥 Error en loadPokemonList:', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async applyFilters() {
        this.showLoading(true);
        this.currentPage = 0;
        
        try {
            let filtered = [...this.allPokemon];
            
            if (this.currentTypeFilter !== 'all') {
                console.log(`🔄 Aplicando filtro de tipo: ${this.currentTypeFilter}`);
                try {
                    const typePokemon = await this.getPokemonByType(this.currentTypeFilter);
                    filtered = filtered.filter(pokemon => 
                        typePokemon.some(p => p.pokemon.name === pokemon.name)
                    );
                } catch (error) {
                    console.error(`❌ Error en filtro de tipo ${this.currentTypeFilter}:`, error.message);
                }
            }
            
            if (this.currentGenFilter !== 'all') {
                console.log(`🔄 Aplicando filtro de generación: ${this.currentGenFilter}`);
                try {
                    const genPokemon = await this.getPokemonByGeneration(this.currentGenFilter);
                    filtered = filtered.filter(pokemon =>
                        genPokemon.some(p => p.name === pokemon.name)
                    );
                } catch (error) {
                    console.error(`❌ Error en filtro de generación ${this.currentGenFilter}:`, error.message);
                }
            }
            
            this.filteredPokemon = filtered;
            this.loadPokemonList();
            
        } catch (error) {
            console.error('💥 Error en applyFilters:', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async getPokemonByType(type) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            if (!response.ok) {
                console.error(`❌ Error en getPokemonByType: Response no OK para tipo ${type}`);
                throw new Error(`Error cargando tipo ${type}`);
            }
            const data = await response.json();
            return data.pokemon;
        } catch (error) {
            console.error(`💥 Error en getPokemonByType para ${type}:`, error.message);
            return [];
        }
    }

    async getPokemonByGeneration(gen) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
            if (!response.ok) {
                console.error(`❌ Error en getPokemonByGeneration: Response no OK para generación ${gen}`);
                throw new Error(`Error cargando generación ${gen}`);
            }
            const data = await response.json();
            return data.pokemon_species;
        } catch (error) {
            console.error(`💥 Error en getPokemonByGeneration para ${gen}:`, error.message);
            return [];
        }
    }

    clearFilters() {
        console.log('🔄 Limpiando filtros...');
        document.getElementById('type-filter').value = 'all';
        document.getElementById('gen-filter').value = 'all';
        this.currentTypeFilter = 'all';
        this.currentGenFilter = 'all';
        this.filteredPokemon = [...this.allPokemon];
        this.currentPage = 0;
        this.loadPokemonList();
    }

    async fetchPokemon(identifier) {
        try {
            console.log(`🔄 Fetching Pokémon: ${identifier}`);
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
            if (!response.ok) {
                console.error(`❌ Error en fetchPokemon: Response no OK para ${identifier}`);
                throw new Error(`Pokémon ${identifier} no encontrado`);
            }
            const data = await response.json();
            console.log(`✅ Pokémon encontrado: ${data.name}`);
            return data;
        } catch (error) {
            console.error(`💥 Error en fetchPokemon para ${identifier}:`, error.message);
            throw error;
        }
    }

    formatPokemonName(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.endsWith('-male') || lowerName.endsWith('-m')) {
            const baseName = name.replace(/[-]?(male|m)$/i, '');
            return `${this.capitalizeFirst(baseName)} <span class="gender-symbol male">♂</span>`;
        }
        
        if (lowerName.endsWith('-female') || lowerName.endsWith('-f')) {
            const baseName = name.replace(/[-]?(female|f)$/i, '');
            return `${this.capitalizeFirst(baseName)} <span class="gender-symbol female">♀</span>`;
        }
        
        return this.capitalizeFirst(name);
    }

    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        const primaryType = pokemon.types[0].type.name;
        card.className = `pokemon-card type-${primaryType}`;
        card.innerHTML = `
            <div class="pokemon-header">
                <span class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</span>
                <button class="fav-btn ${this.isFavorite(pokemon.id) ? 'favorited' : ''}" 
                        onclick="app.toggleFavorite(${pokemon.id}, event)">
                    ${this.isFavorite(pokemon.id) ? '❤️' : '🤍'}
                </button>
            </div>
            <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}" 
                 class="pokemon-img">
            <h3 class="pokemon-name">${this.formatPokemonName(pokemon.name)}</h3>
            <div class="pokemon-types">
                ${pokemon.types.map(type => 
                    `<span class="type type-${type.type.name}">${type.type.name}</span>`
                ).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => this.showPokemonDetail(pokemon.id));
        return card;
    }

    async showPokemonDetail(pokemonId) {
        this.showLoading(true);
        try {
            console.log(`🔄 Cargando detalle del Pokémon ID: ${pokemonId}`);
            const pokemon = await this.fetchPokemon(pokemonId);
            if (pokemon) {
                document.getElementById('pokemon-detail').innerHTML = this.createDetailView(pokemon);
                this.showView('detail');
            }
        } catch (error) {
            console.error(`💥 Error en showPokemonDetail para ID ${pokemonId}:`, error.message);
            this.showSearchError('Error al cargar los detalles del Pokémon');
        } finally {
            this.showLoading(false);
        }
    }

    createDetailView(pokemon) {
        console.log(`🔄 Creando vista detalle para: ${pokemon.name}`);
        
        try {
            const primaryType = pokemon.types[0].type.name;
            console.log(`🎨 Tipo principal: ${primaryType}`);
            
            const html = `
                <div class="pokemon-detail type-${primaryType}">
                    <div class="detail-header">
                        <h2 class="detail-name">${this.formatPokemonName(pokemon.name)}</h2>
                        <span class="detail-number">#${String(pokemon.id).padStart(3, '0')}</span>
                    </div>
                    <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                         alt="${pokemon.name}" 
                         class="detail-img">
                    <div class="detail-types">
                        ${pokemon.types.map(type => 
                            `<span class="type type-${type.type.name}">${type.type.name}</span>`
                        ).join('')}
                    </div>
                    <div class="detail-stats">
                        <div class="stat">
                            <span class="stat-label">Altura</span>
                            <span class="stat-value">${(pokemon.height / 10).toFixed(1)} m</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Peso</span>
                            <span class="stat-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Experiencia</span>
                            <span class="stat-value">${pokemon.base_experience || 'N/A'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Habilidades</span>
                            <span class="stat-value">${pokemon.abilities.slice(0, 2).map(a => a.ability.name).join(', ')}</span>
                        </div>
                    </div>
                    <button class="fav-btn ${this.isFavorite(pokemon.id) ? 'favorited' : ''}" 
                            onclick="app.toggleFavorite(${pokemon.id}, event)"
                            style="font-size: 1.2rem; padding: 10px 20px;">
                        ${this.isFavorite(pokemon.id) ? '❤️ Quitar de Favoritos' : '🤍 Agregar a Favoritos'}
                    </button>
                </div>
            `;
            
            console.log(`✅ Vista detalle creada exitosamente`);
            return html;
            
        } catch (error) {
            console.error(`💥 Error en createDetailView:`, error);
            return `<div class="error">Error al crear la vista de detalle</div>`;
        }
    }

    async searchPokemon() {
    const query = document.getElementById('search-input').value.trim();
    console.log(`🔍 Iniciando búsqueda: "${query}"`);
    
    if (!query) {
        this.showSearchError('Por favor, ingresa un nombre o ID de Pokémon');
        return;
    }

    this.showLoading(true);
    
    try {
        const pokemon = await this.fetchPokemon(query.toLowerCase());

        // ✅ CAMBIO CLAVE: ahora se pinta en el contenedor correcto
        document.getElementById('pokemon-detail').innerHTML =
            this.createDetailView(pokemon);

        // ✅ CAMBIO CLAVE: se muestra directamente la vista de detalle
        this.showView('detail');

    } catch (error) {
        console.error(`💥 Error en searchPokemon para "${query}":`, error.message);
        this.showSearchError(`No se encontró ningún Pokémon con "${query}"`);
    } finally {
        this.showLoading(false);
    }
}

    showSearchError(message) {
        console.log(`📝 Mostrando error al usuario: ${message}`);
        document.getElementById('search-results').innerHTML = `
            <div class="empty" style="text-align: center; padding: 40px;">
                <p style="color: var(--red); font-weight: bold; margin-bottom: 15px;">${message}</p>
                <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <p style="margin-bottom: 8px;"><strong>💡 Tips de búsqueda:</strong></p>
                    <p style="margin: 4px 0;">• Usa nombres completos: <em>"pikachu"</em></p>
                    <p style="margin: 4px 0;">• Usa IDs numéricos: <em>"25"</em></p>
                    <p style="margin: 4px 0;">• Los nombres son en inglés</p>
                </div>
            </div>
        `;
        this.showView('search');
    }

    showView(viewName) {
        console.log(`🔄 Cambiando a vista: ${viewName}`);
        console.log(`📊 Vista actual: ${this.currentView}`);
        
        // Guardar vista anterior
        if (this.currentView !== 'detail') {
            this.previousView = this.currentView;
            console.log(`📋 Vista anterior guardada: ${this.previousView}`);
        }

        // Ocultar todas las vistas
        const allViews = document.querySelectorAll('.view');
        console.log(`👁️  Vistas encontradas: ${allViews.length}`);
        
        allViews.forEach(view => {
            console.log(`👁️  Ocultando vista: ${view.id}`);
            view.classList.remove('active');
        });

        // Actualizar navegación
        const allNavButtons = document.querySelectorAll('.nav-btn');
        console.log(`🧭 Botones de nav: ${allNavButtons.length}`);
        
        allNavButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar nueva vista
        const targetView = document.getElementById(`${viewName}-view`);
        console.log(`🎯 Vista objetivo:`, targetView);
        
        if (targetView) {
            targetView.classList.add('active');
            console.log(`✅ Vista ${viewName} activada`);
        } else {
            console.error(`❌ Vista ${viewName}-view NO encontrada`);
        }
        
        // Actualizar navegación si no es vista de detalle
        if (viewName !== 'detail') {
            const navButton = document.querySelector(`[data-view="${viewName}"]`);
            console.log(`🧭 Botón de nav:`, navButton);
            
            if (navButton) {
                navButton.classList.add('active');
                console.log(`✅ Botón ${viewName} activado`);
            }
        }

        this.currentView = viewName;
        console.log(`✅ Vista cambiada a: ${this.currentView}`);

        // Acciones específicas por vista
        switch (viewName) {
            case 'favorites':
                console.log(`⭐ Ejecutando acción para favoritos`);
                this.showFavorites();
                break;
            case 'search':
                console.log(`🔍 Ejecutando acción para búsqueda`);
                document.getElementById('search-input').focus();
                document.getElementById('search-input').value = '';
                document.getElementById('search-results').innerHTML = '';
                break;
            case 'list':
                console.log(`📋 Ejecutando acción para lista`);
                this.applyFilters();
                break;
            case 'detail':
                console.log(`📖 Ejecutando acción para detalle`);
                // No action needed for detail view
                break;
        }
    }

    toggleFavorite(pokemonId, event) {
        if (event) event.stopPropagation();
        
        console.log(`❤️  Toggle favorite para Pokémon ID: ${pokemonId}`);
        const index = this.favorites.indexOf(pokemonId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            console.log(`➖ Removido de favoritos: ${pokemonId}`);
        } else {
            this.favorites.push(pokemonId);
            console.log(`➕ Agregado a favoritos: ${pokemonId}`);
        }
        
        localStorage.setItem('pokedexFavorites', JSON.stringify(this.favorites));
        
        document.querySelectorAll(`.fav-btn[onclick*="${pokemonId}"]`).forEach(btn => {
            const isFav = this.isFavorite(pokemonId);
            btn.classList.toggle('favorited', isFav);
            btn.innerHTML = isFav ? '❤️' : '🤍';
            if (btn.textContent.includes('Agregar') || btn.textContent.includes('Quitar')) {
                btn.innerHTML = isFav ? '❤️ Quitar de Favoritos' : '🤍 Agregar a Favoritos';
            }
        });

        if (this.currentView === 'favorites') {
            this.showFavorites();
        }
    }

    isFavorite(pokemonId) {
        return this.favorites.includes(pokemonId);
    }

    async showFavorites() {
        console.log('🔄 Cargando vista de favoritos...');
        const container = document.getElementById('favorites-list');
        const empty = document.getElementById('no-favorites');
        
        if (this.favorites.length === 0) {
            console.log('📭 No hay favoritos');
            container.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        
        console.log(`⭐ Cargando ${this.favorites.length} favoritos`);
        empty.classList.add('hidden');
        container.innerHTML = '';
        
        for (const pokemonId of this.favorites) {
            try {
                const pokemon = await this.fetchPokemon(pokemonId);
                if (pokemon) {
                    container.appendChild(this.createPokemonCard(pokemon));
                }
            } catch (error) {
                console.error(`❌ Error cargando favorito ${pokemonId}:`, error.message);
            }
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            console.log(`⬅️  Página anterior: ${this.currentPage}`);
            this.loadPokemonList();
        }
    }

    nextPage() {
        if ((this.currentPage + 1) * this.limit < this.filteredPokemon.length) {
            this.currentPage++;
            console.log(`➡️  Página siguiente: ${this.currentPage}`);
            this.loadPokemonList();
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPokemon.length / this.limit);
        document.getElementById('page-info').textContent = `Página ${this.currentPage + 1} de ${totalPages}`;
        document.getElementById('prev-btn').disabled = this.currentPage === 0;
        document.getElementById('next-btn').disabled = (this.currentPage + 1) * this.limit >= this.filteredPokemon.length;
    }

    async loadFilters() {
        console.log('🔄 Cargando filtros...');
        
        try {
            const response = await fetch('https://pokeapi.co/api/v2/type');
            if (!response.ok) {
                console.error('❌ Error cargando tipos: Response no OK');
                throw new Error('Error cargando tipos');
            }
            const data = await response.json();
            
            const typeSelect = document.getElementById('type-filter');
            while (typeSelect.children.length > 1) {
                typeSelect.removeChild(typeSelect.lastChild);
            }
            
            data.results.forEach(type => {
                if (!['shadow', 'unknown'].includes(type.name)) {
                    const option = document.createElement('option');
                    option.value = type.name;
                    option.textContent = this.capitalizeFirst(type.name);
                    typeSelect.appendChild(option);
                }
            });
            console.log('✅ Filtros de tipo cargados');
        } catch (error) {
            console.error('💥 Error cargando filtros de tipo:', error.message);
        }

        try {
            const response = await fetch('https://pokeapi.co/api/v2/generation');
            if (!response.ok) {
                console.error('❌ Error cargando generaciones: Response no OK');
                throw new Error('Error cargando generaciones');
            }
            const data = await response.json();
            
            const genSelect = document.getElementById('gen-filter');
            while (genSelect.children.length > 1) {
                genSelect.removeChild(genSelect.lastChild);
            }
            
            data.results.forEach(gen => {
                const option = document.createElement('option');
                option.value = gen.name;
                const genNumber = gen.name.split('-')[1];
                option.textContent = `Generación ${genNumber ? genNumber.toUpperCase() : '1'}`;
                genSelect.appendChild(option);
            });
            console.log('✅ Filtros de generación cargados');
        } catch (error) {
            console.error('💥 Error cargando filtros de generación:', error.message);
        }
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        console.log(`🎨 Tema cambiado a: ${isDark ? 'oscuro' : 'claro'}`);
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
        if (show) {
            console.log('⏳ Mostrando loading...');
        } else {
            console.log('✅ Ocultando loading');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Pokédex App...');
    window.app = new PokedexApp();
});