/**
 * mapaRenderer.js
 * Renderiza el grid del mapa en el DOM y lo mantiene sincronizado
 * con el estado del modelo Mapa.
 *
 * Responsabilidades:
 *  - Crear los elementos .celda en #mapa-grid
 *  - Actualizar colores e imagenes cuando cambia el estado
 *  - Resaltar la ruta Dijkstra
 *  - Mostrar personajes Simpsons en celdas residenciales
 *
 * NO contiene logica de negocio — solo manipula el DOM.
 */

// Mapa de imagenes por tipo/subtipo de edificio
const IMAGENES_EDIFICIO = {
    residencial: {
        casa:           '../../assets/edificios/casa_simpsons.png',
        apartamento:    '../../assets/edificios/apartamento_simpsons.png',
    },
    comercial: {
        tienda:         '../../assets/edificios/kwik_e_mart.png',
        centroComercial:'../../assets/edificios/springfield_mall.png',
    },
    industrial: {
        fabrica:        '../../assets/edificios/planta_nuclear.png',
        granja:         '../../assets/edificios/granja_springfield.png',
    },
    servicio: {
        policia:        '../../assets/edificios/policia_springfield.png',
        bomberos:       '../../assets/edificios/bomberos_springfield.png',
        hospital:       '../../assets/edificios/hospital_springfield.png',
    },
    planta: {
        electrica:      '../../assets/edificios/planta_electrica.png',
        agua:           '../../assets/edificios/planta_agua.png',
    },
    parque: {
        parque:         '../../assets/edificios/parque_springfield.png',
    },
};

// Personajes Simpsons para celdas residenciales (aleatorio)
const PERSONAJES = [
    '../../assets/personajes/bart.png',
    '../../assets/personajes/lisa.png',
    '../../assets/personajes/marge.png',
    '../../assets/personajes/maggie.png',
    '../../assets/personajes/homer_normal.png',
];

export class MapaRenderer {

    #contenedor;    // elemento #mapa-grid
    #mapa;          // instancia del modelo Mapa
    #edificios;     // Map: id → instancia Edificio
    #onCeldaClick;  // callback(x, y, celda)

    /**
     * @param {HTMLElement} contenedor  - El elemento #mapa-grid
     * @param {Mapa}        mapa        - Modelo del mapa
     * @param {Map}         edificios   - Map<id, Edificio>
     * @param {Function}    onCeldaClick - Callback cuando se hace click en una celda
     */
    constructor(contenedor, mapa, edificios, onCeldaClick) {
        this.#contenedor   = contenedor;
        this.#mapa         = mapa;
        this.#edificios    = edificios;
        this.#onCeldaClick = onCeldaClick;
    }

    // ── Render inicial ───────────────────────────────────────

    /**
     * Crea todos los elementos .celda y configura el grid CSS.
     * Llamar una sola vez al iniciar el juego.
     */
    renderizar() {
        const ancho = this.#mapa.getAncho();
        const alto  = this.#mapa.getAlto();

        // Configurar columnas del grid CSS dinamicamente
        this.#contenedor.style.gridTemplateColumns = `repeat(${ancho}, var(--celda-size))`;

        this.#contenedor.innerHTML = '';

        for (let y = 0; y < alto; y++) {
            for (let x = 0; x < ancho; x++) {
                const celda  = this.#mapa.getCelda(x, y);
                const el     = this.#crearElementoCelda(x, y, celda);
                this.#contenedor.appendChild(el);
            }
        }
    }

    // ── Actualizacion parcial ────────────────────────────────

    /**
     * Actualiza una sola celda en el DOM.
     * Llamar despues de construir, demoler o colocar via.
     * @param {number} x
     * @param {number} y
     */
    actualizarCelda(x, y) {
        const celda = this.#mapa.getCelda(x, y);
        const el    = this.#getElemento(x, y);
        if (!el) return;
        this.#aplicarEstado(el, x, y, celda);
    }

    /**
     * Actualiza TODAS las celdas del DOM.
     * Llamar despues de cargar mapa desde archivo.
     */
    actualizarTodo() {
        const ancho = this.#mapa.getAncho();
        const alto  = this.#mapa.getAlto();
        for (let y = 0; y < alto; y++) {
            for (let x = 0; x < ancho; x++) {
                this.actualizarCelda(x, y);
            }
        }
    }

    // ── Ruta Dijkstra ────────────────────────────────────────

    /**
     * Resalta visualmente la ruta calculada.
     * @param {Array<{x, y}>} ruta
     */
    mostrarRuta(ruta) {
        this.limpiarRuta();
        ruta.forEach(({ x, y }) => {
            const el = this.#getElemento(x, y);
            if (el) el.classList.add('ruta');
        });
    }

    limpiarRuta() {
        this.#contenedor.querySelectorAll('.celda.ruta')
            .forEach(el => el.classList.remove('ruta'));
    }

    // ── Modo cursor ──────────────────────────────────────────

    setModoConstruccion(activo) {
        this.#contenedor.classList.toggle('modo-construccion', activo);
        this.#contenedor.classList.remove('modo-via');
    }

    setModoVia(activo) {
        this.#contenedor.classList.toggle('modo-via', activo);
        this.#contenedor.classList.remove('modo-construccion');
    }

    setModoNormal() {
        this.#contenedor.classList.remove('modo-construccion', 'modo-via');
    }

    // ── Privados ─────────────────────────────────────────────

    #crearElementoCelda(x, y, celda) {
        const el = document.createElement('div');
        el.classList.add('celda');
        el.dataset.x = x;
        el.dataset.y = y;

        this.#aplicarEstado(el, x, y, celda);

        el.addEventListener('click', () => {
            this.#onCeldaClick(x, y, celda);
        });

        return el;
    }

    #aplicarEstado(el, x, y, celda) {
        // Limpiar clases de tipo anteriores
        el.classList.remove('grass', 'road', 'building',
            'valida-para-construir', 'invalida-para-construir');
        el.style.backgroundImage = '';
        el.dataset.tipo = '';
        el.dataset.tooltip = '';

        // Quitar personaje anterior si lo habia
        const personajeAnterior = el.querySelector('.personaje-simpsons');
        if (personajeAnterior) personajeAnterior.remove();

        const tipo = celda.getTipo();
        el.classList.add(tipo);

        if (tipo === 'building') {
            const edificioId = celda.getEdificioId();
            const edificio   = this.#edificios.get(edificioId);

            if (edificio) {
                const info   = edificio.getInfo();
                const imagen = IMAGENES_EDIFICIO[info.tipo]?.[info.subtipo];

                if (imagen) {
                    el.style.backgroundImage = `url('${imagen}')`;
                }

                el.dataset.tipo    = info.tipo;
                el.dataset.tooltip = info.descripcion;

                // Personaje Simpsons en residenciales
                if (info.tipo === 'residencial' && info.ocupantes > 0) {
                    this.#agregarPersonaje(el);
                }
            }
        } else if (tipo === 'grass') {
            el.dataset.tooltip = `(${x}, ${y})`;
        } else if (tipo === 'road') {
            el.dataset.tooltip = `Via (${x}, ${y})`;
        }
    }

    #agregarPersonaje(celdaEl) {
        const img = document.createElement('div');
        img.classList.add('personaje-simpsons');
        // Personaje aleatorio
        const random = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
        img.style.backgroundImage = `url('${random}')`;
        celdaEl.appendChild(img);
    }

    /** Obtiene el elemento DOM de la celda (x, y) */
    #getElemento(x, y) {
        return this.#contenedor.querySelector(
            `.celda[data-x="${x}"][data-y="${y}"]`
        );
    }
}