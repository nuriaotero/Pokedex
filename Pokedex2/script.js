class PokedexIntermedia {
    constructor() {
        this.currentOffset = 0;
        this.limit = 20;
        this.currentView = 'list';
        this.allPokemon = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPokemonList();
    }

    setupEventListeners() {
        // Paginación
        document.getElementById('prev-btn').addEventListener('click', () => this.prevPage());
        document.getElementById('next-btn').addEventListener('click', () => this.nextPage());

        // Búsqueda
        document.getElementById('search-btn').addEventListener('click', () => this.searchPokemon());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPokemon();
        });

        // Volver al listado
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showView('list');
        });
    }

    async loadPokemonList() {
        this.showLoading(true);
        
        try {
            console.log(`🔄 Cargando Pokémon desde offset: ${this.currentOffset}`);
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${this.currentOffset}&limit=${this.limit}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar la lista de Pokémon');
            }
            
            const data = await response.json();
            this.allPokemon = data.results;
            
            console.log(`✅ Lista cargada: ${this.allPokemon.length} Pokémon`);
            await this.renderPokemonGrid();
            this.updatePagination();
            
        } catch (error) {
            console.error('💥 Error cargando lista:', error);
            this.showError('Error al cargar los Pokémon. Intenta nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    async renderPokemonGrid() {
        const grid = document.getElementById('pokemon-grid');
        grid.innerHTML = '';
        
        console.log(`🎨 Renderizando ${this.allPokemon.length} Pokémon...`);

        // Crear tarjetas de loading
        this.allPokemon.forEach(pokemon => {
            const card = this.createLoadingCard();
            grid.appendChild(card);
        });

        // Cargar datos de cada Pokémon
        const pokemonPromises = this.allPokemon.map(async (pokemon, index) => {
            try {
                console.log(`📥 Cargando datos de: ${pokemon.name}`);
                const pokemonData = await this.fetchPokemonData(pokemon.url);
                
                if (pokemonData) {
                    // Reemplazar la tarjeta de loading con la real
                    const realCard = this.createPokemonCard(pokemonData);
                    grid.children[index].replaceWith(realCard);
                    console.log(`✅ ${pokemon.name} renderizado`);
                }
            } catch (error) {
                console.error(`❌ Error cargando ${pokemon.name}:`, error);
                // Mostrar tarjeta de error
                const errorCard = this.createErrorCard(pokemon.name);
                grid.children[index].replaceWith(errorCard);
            }
        });

        await Promise.all(pokemonPromises);
        console.log('✅ Todas las tarjetas renderizadas');
    }

    createLoadingCard() {
        const card = document.createElement('div');
        card.className = 'pokemon-card loading';
        card.innerHTML = `
            <div class="pokemon-image" style="background: #f0f0f0; border-radius: 50%;"></div>
            <div class="pokemon-name" style="background: #f0f0f0; height: 20px; border-radius: 10px; margin: 10px 0;"></div>
            <div class="pokemon-id" style="background: #f0f0f0; height: 15px; border-radius: 8px; width: 60%; margin: 0 auto;"></div>
        `;
        return card;
    }

    createErrorCard(pokemonName) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <div class="pokemon-image">❌</div>
            <div class="pokemon-name">${this.capitalizeFirst(pokemonName)}</div>
            <div class="pokemon-id">Error al cargar</div>
        `;
        return card;
    }

    async fetchPokemonData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error en la respuesta');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            throw error;
        }
    }

    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}" 
                 class="pokemon-image"
                 onerror="this.src='https://via.placeholder.com/120x120/FFDE00/000?text=?'">
            <div class="pokemon-name">${this.capitalizeFirst(pokemon.name)}</div>
            <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        `;
        
        card.addEventListener('click', () => this.showPokemonDetail(pokemon));
        return card;
    }

    async showPokemonDetail(pokemon) {
        console.log(`🔍 Mostrando detalle de: ${pokemon.name}`);
        this.showLoading(true);
        
        try {
            // Si el Pokémon no tiene todos los datos, cargarlos
            if (!pokemon.height || !pokemon.weight) {
                console.log(`📥 Cargando datos completos de: ${pokemon.name}`);
                pokemon = await this.fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
            }
            
            document.getElementById('pokemon-detail').innerHTML = this.createDetailView(pokemon);
            this.showView('detail');
            
        } catch (error) {
            console.error(`💥 Error mostrando detalle de ${pokemon.name}:`, error);
            this.showError('Error al cargar los detalles del Pokémon');
        } finally {
            this.showLoading(false);
        }
    }

    createDetailView(pokemon) {
        return `
            <div class="pokemon-detail">
                <div class="detail-header">
                    <h2 class="detail-name">${this.capitalizeFirst(pokemon.name)}</h2>
                    <span class="detail-id">#${String(pokemon.id).padStart(3, '0')}</span>
                </div>
                <img src="${pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}" 
                     alt="${pokemon.name}" 
                     class="detail-image"
                     onerror="this.src='https://via.placeholder.com/200x200/FFDE00/000?text=?'">
                <div class="detail-stats">
                    <div class="detail-stat">
                        <span class="stat-label">Altura</span>
                        <span class="stat-value">${(pokemon.height / 10).toFixed(1)} m</span>
                    </div>
                    <div class="detail-stat">
                        <span class="stat-label">Peso</span>
                        <span class="stat-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
                    </div>
                    <div class="detail-stat">
                        <span class="stat-label">Experiencia Base</span>
                        <span class="stat-value">${pokemon.base_experience || 'N/A'}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="stat-label">Habilidades</span>
                        <span class="stat-value">${pokemon.abilities.slice(0, 2).map(a => a.ability.name).join(', ')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async searchPokemon() {
        const query = document.getElementById('search-input').value.trim().toLowerCase();
        
        if (!query) {
            this.loadPokemonList();
            return;
        }

        this.showLoading(true);
        
        try {
            console.log(`🔍 Buscando: "${query}"`);
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            
            if (!response.ok) {
                throw new Error('Pokémon no encontrado');
            }
            
            const pokemon = await response.json();
            this.showPokemonDetail(pokemon);
            
        } catch (error) {
            console.error(`❌ Búsqueda fallida: "${query}"`);
            this.showError(`No se encontró ningún Pokémon con "${query}"`);
        } finally {
            this.showLoading(false);
        }
    }

    prevPage() {
        if (this.currentOffset >= this.limit) {
            this.currentOffset -= this.limit;
            console.log(`⬅️  Página anterior. Nuevo offset: ${this.currentOffset}`);
            this.loadPokemonList();
        }
    }

    nextPage() {
        this.currentOffset += this.limit;
        console.log(`➡️  Página siguiente. Nuevo offset: ${this.currentOffset}`);
        this.loadPokemonList();
    }

    updatePagination() {
        const currentPage = Math.floor(this.currentOffset / this.limit) + 1;
        document.getElementById('page-info').textContent = `Página ${currentPage}`;
        
        // Desactivar botón anterior si estamos en la primera página
        document.getElementById('prev-btn').disabled = this.currentOffset < this.limit;
        
        console.log(`📄 Paginación actualizada - Página: ${currentPage}, Offset: ${this.currentOffset}`);
    }

    showView(viewName) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar vista solicitada
        document.getElementById(`${viewName}-view`).classList.add('active');
        this.currentView = viewName;
        
        console.log(`👁️  Vista cambiada a: ${viewName}`);
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showError(message) {
        alert(message); // En una app real, usarías un toast o modal
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Pokédex Intermedia...');
    window.pokedex = new PokedexIntermedia();
});