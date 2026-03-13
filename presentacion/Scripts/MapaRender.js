/**
**
 * Renderiza el grid del mapa en el DOM y lo mantiene sincronizado
 * con el estado del modelo Mapa.
 *
 * Responsabilidades:
 *  - Crear los elementos .celda en #mapa-grid
 *  - Actualizar colores e imagenes cuando cambia el estado
 *  - Resaltar la ruta Dijkstra
 *  - Mostrar personajes Simpsons en celdas residenciales
 *
 *  solo manipula el DOM.
 */

// Mapa de imagenes por tipo/subtipo de edificio
const IMAGENES_EDIFICIO = {
    residencial: {
        casa:            '../../assets/edificios/casa_simpsons.png',
        apartamento:     '../../assets/edificios/apartamento_simpsons.png',
    },
    comercial: {
        tienda:          '../../assets/edificios/kwik_e_mart.png',
        centroComercial: '../../assets/edificios/springfield_mall.png',
    },
    industrial: {
        fabrica:         '../../assets/edificios/planta_nuclear.png',
        granja:          '../../assets/edificios/granja_springfield.png',
    },
    servicio: {
        policia:         '../../assets/edificios/policia_springfield.png',
        bomberos:        '../../assets/edificios/bomberos_springfield.png',
        hospital:        '../../assets/edificios/hospital_springfield.png',
    },
    planta: {
        electrica:       '../../assets/edificios/planta_electrica.png',
        agua:            '../../assets/edificios/planta_agua.png',
    },
    parque: {
        parque:          '../../assets/edificios/parque_springfield.png',
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

    #contenedor;        // elemento #mapa-grid
    #mapa;              // instancia del modelo Mapa
    #edificios;         // Map: id → instancia Edificio
    #ctrlRuta;          // ControladorRuta — para calcular y mostrar rutas
    #onCeldaClick;      // callback(x, y, celda)

    // Estado de seleccion para ruta
    #celdaOrigenRuta;   // { x, y } | null
    #modoRuta;          // boolean

    /**
     * @param {HTMLElement}     contenedor   - El elemento #mapa-grid
     * @param {Mapa}            mapa         - Modelo del mapa
     * @param {Map}             edificios    - Map<id, Edificio>
     * @param {ControladorRuta} ctrlRuta     - Para calcular rutas Dijkstra
     * @param {Function}        onCeldaClick - Callback cuando se hace click
     */
    constructor(contenedor, mapa, edificios, ctrlRuta, onCeldaClick) {
        this.#contenedor      = contenedor;
        this.#mapa            = mapa;
        this.#edificios       = edificios;
        this.#ctrlRuta        = ctrlRuta;
        this.#onCeldaClick    = onCeldaClick;
        this.#celdaOrigenRuta = null;
        this.#modoRuta        = false;
    }

    // ── Render inicial ───────────────────────────────────────

    /**
     * Crea todos los elementos .celda y configura el grid CSS.
     * Llamar una sola vez al iniciar el juego.
     */
    renderizar() {
        const ancho = this.#mapa.getAncho();
        const alto  = this.#mapa.getAlto();

        this.#contenedor.style.gridTemplateColumns =
            `repeat(${ancho}, var(--celda-size))`;

        this.#contenedor.innerHTML = '';

        for (let y = 0; y < alto; y++) {
            for (let x = 0; x < ancho; x++) {
                const celda = this.#mapa.getCelda(x, y);
                const el    = this.#crearElementoCelda(x, y, celda);
                this.#contenedor.appendChild(el);
            }
        }
    }

    // ── Actualizacion ────────────────────────────────────────

    /** Actualiza una sola celda en el DOM */
    actualizarCelda(x, y) {
        const celda = this.#mapa.getCelda(x, y);
        const el    = this.#getElemento(x, y);
        if (!el) return;
        this.#aplicarEstado(el, x, y, celda);
    }

    /** Actualiza TODAS las celdas — usar despues de cargar mapa desde archivo */
    actualizarTodo() {
        for (let y = 0; y < this.#mapa.getAlto(); y++) {
            for (let x = 0; x < this.#mapa.getAncho(); x++) {
                this.actualizarCelda(x, y);
            }
        }
    }

    // ── Ruta Dijkstra ────────────────────────────────────────

    /**
     * Activa el modo ruta: el usuario hace click en origen,
     * luego en destino, y se llama al microservicio del profe.
     */
    activarModoRuta() {
        this.#modoRuta        = true;
        this.#celdaOrigenRuta = null;
        this.limpiarRuta();
        this.#contenedor.classList.add('modo-ruta');
    }

    desactivarModoRuta() {
        this.#modoRuta        = false;
        this.#celdaOrigenRuta = null;
        this.#contenedor.classList.remove('modo-ruta');
        this.limpiarRuta();
    }

    /**
     * Resalta visualmente la ruta calculada por el microservicio.
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
        this.#contenedor
            .querySelectorAll('.celda.ruta')
            .forEach(el => el.classList.remove('ruta'));
        // Limpiar origen seleccionado
        this.#contenedor
            .querySelectorAll('.celda.origen-ruta')
            .forEach(el => el.classList.remove('origen-ruta'));
    }

    // ── Click en celda con ruta ──────────────────────────────

    /**
     * Maneja la seleccion de origen y destino para la ruta.
     * Llamado internamente cuando modoRuta esta activo.
     * @param {number} x
     * @param {number} y
     */
    async #manejarClickRuta(x, y) {
        if (!this.#celdaOrigenRuta) {
            // Primer click → seleccionar origen
            this.#celdaOrigenRuta = { x, y };
            const el = this.#getElemento(x, y);
            if (el) el.classList.add('origen-ruta');
        } else {
            // Segundo click → calcular ruta al destino
            const origen  = this.#celdaOrigenRuta;
            const destino = { x, y };

            const resultado = await this.#ctrlRuta.calcularRuta(origen, destino);

            if (resultado.ok) {
                this.mostrarRuta(resultado.ruta);
            } else {
                // Limpiar seleccion y mostrar error via callback
                this.limpiarRuta();
                this.#onCeldaClick(x, y, null, resultado.mensaje);
            }

            // Resetear origen para la proxima seleccion
            this.#celdaOrigenRuta = null;
        }
    }

    // ── Modos de cursor ──────────────────────────────────────

    setModoConstruccion(activo) {
        this.#contenedor.classList.toggle('modo-construccion', activo);
        this.#contenedor.classList.remove('modo-via', 'modo-ruta');
    }

    setModoVia(activo) {
        this.#contenedor.classList.toggle('modo-via', activo);
        this.#contenedor.classList.remove('modo-construccion', 'modo-ruta');
    }

    setModoNormal() {
        this.#contenedor.classList.remove('modo-construccion', 'modo-via', 'modo-ruta');
        this.#modoRuta        = false;
        this.#celdaOrigenRuta = null;
    }

    // ── Privados ─────────────────────────────────────────────

    #crearElementoCelda(x, y, celda) {
        const el = document.createElement('div');
        el.classList.add('celda');
        el.dataset.x = x;
        el.dataset.y = y;

        this.#aplicarEstado(el, x, y, celda);

        el.addEventListener('click', async () => {
            if (this.#modoRuta) {
                await this.#manejarClickRuta(x, y);
            } else {
                this.#onCeldaClick(x, y, celda);
            }
        });

        return el;
    }

    #aplicarEstado(el, x, y, celda) {
        el.classList.remove('grass', 'road', 'building',
            'valida-para-construir', 'invalida-para-construir');
        el.style.backgroundImage = '';
        el.dataset.tipo    = '';
        el.dataset.tooltip = '';

        // Quitar personaje anterior
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

                if (imagen) el.style.backgroundImage = `url('${imagen}')`;

                el.dataset.tipo    = info.tipo;
                el.dataset.tooltip = info.descripcion;

                // Personaje en residenciales con ocupantes
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
        const div = document.createElement('div');
        div.classList.add('personaje-simpsons');
        const random = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
        div.style.backgroundImage = `url('${random}')`;
        celdaEl.appendChild(div);
    }

    #getElemento(x, y) {
        return this.#contenedor.querySelector(
            `.celda[data-x="${x}"][data-y="${y}"]`
        );
    }
}