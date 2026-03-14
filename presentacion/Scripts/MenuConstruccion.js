/**
 * Maneja el menu lateral de construccion:
 *  - Selector de tipo y subtipo de edificio
 *  - Modo cursor (construccion / via / normal)
 *  - Delega la construccion a ControladorEdificio
 *  - Delega la via a ControladorMapa
 *
 * NO contiene logica de negocio — solo escucha eventos del DOM
 * y llama a los controladores.
 */

export class MenuConstruccion {

    #ctrlEdificio;
    #ctrlMapa;
    #renderer;
    #notificaciones;

    // Estado del menu
    #modoActual;    // 'normal' | 'construccion' | 'via'
    #tipoSeleccionado;
    #subtipoSeleccionado;

    // Elementos del DOM
    #btnVia;
    #btnCancelar;
    #selectTipo;
    #selectSubtipo;
    #panelSubtipo;
    #infoCosto;

    // Configuracion de subtipos y costos
    static #SUBTIPOS = {
        residencial: ['casa', 'apartamento'],
        comercial:   ['tienda', 'centroComercial'],
        industrial:  ['fabrica', 'granja'],
        servicio:    ['policia', 'bomberos', 'hospital'],
        planta:      ['electrica', 'agua'],
        parque:      [],
    };

    static #COSTOS = {
        residencial: { casa: 1000,  apartamento: 3000 },
        comercial:   { tienda: 2000, centroComercial: 8000 },
        industrial:  { fabrica: 5000, granja: 3000 },
        servicio:    { policia: 4000, bomberos: 4000, hospital: 6000 },
        planta:      { electrica: 10000, agua: 8000 },
        parque:      { parque: 1500 },
    };

    /**
     * @param {ControladorEdificio} ctrlEdificio
     * @param {ControladorMapa}     ctrlMapa
     * @param {MapaRenderer}        renderer
     * @param {Object}              notificaciones
     */
    constructor(ctrlEdificio, ctrlMapa, renderer, notificaciones) {
        this.#ctrlEdificio   = ctrlEdificio;
        this.#ctrlMapa       = ctrlMapa;
        this.#renderer       = renderer;
        this.#notificaciones = notificaciones;
        this.#modoActual     = 'normal';
    }

    // ── Inicializacion ───────────────────────────────────────

    /**
     * Conecta el menu con los elementos del DOM.
     * Llamar una vez cuando el HTML este listo.
     */
    init() {
        this.#btnVia       = document.getElementById('btn-construir-via');
        this.#btnCancelar  = document.getElementById('btn-cancelar');
        this.#selectTipo   = document.getElementById('select-tipo-edificio');
        this.#selectSubtipo= document.getElementById('select-subtipo-edificio');
        this.#panelSubtipo = document.getElementById('panel-subtipo');
        this.#infoCosto    = document.getElementById('info-costo-edificio');

        this.#registrarEventos();
    }

    // ── Eventos DOM ──────────────────────────────────────────

    #registrarEventos() {
        // Boton via
        this.#btnVia.addEventListener('click', () => this.#activarModoVia());

        // Boton cancelar
        this.#btnCancelar.addEventListener('click', () => this.#cancelar());

        // Cambio de tipo de edificio
        this.#selectTipo.addEventListener('change', () => {
            this.#tipoSeleccionado = this.#selectTipo.value;
            this.#actualizarSubtipos();
            if (this.#tipoSeleccionado) this.#activarModoConstruccion();
        });

        // Cambio de subtipo
        this.#selectSubtipo.addEventListener('change', () => {
            this.#subtipoSeleccionado = this.#selectSubtipo.value;
            this.#mostrarCosto();
        });
    }

    // ── Modos ────────────────────────────────────────────────

    #activarModoConstruccion() {
        this.#modoActual = 'construccion';
        this.#renderer.setModoConstruccion(true);
        this.#btnCancelar.style.display = 'block';
    }

    #activarModoVia() {
        this.#modoActual = 'via';
        this.#renderer.setModoVia(true);
        this.#btnCancelar.style.display = 'block';
        this.#notificaciones.mostrarAlerta('Haz click en una celda para colocar una via ($100)');
    }

    #cancelar() {
        this.#modoActual           = 'normal';
        this.#tipoSeleccionado     = null;
        this.#subtipoSeleccionado  = null;
        this.#selectTipo.value     = '';
        this.#selectSubtipo.value  = '';
        this.#panelSubtipo.style.display = 'none';
        this.#infoCosto.textContent = '';
        this.#btnCancelar.style.display  = 'none';
        this.#renderer.setModoNormal();
    }

    // ── Click en celda (llamado desde juego.js) ──────────────

    /**
     * Maneja el click en una celda del mapa.
     * juego.js llama este metodo pasando las coordenadas.
     * @param {number} x
     * @param {number} y
     */
    manejarClickCelda(x, y) {
        if (this.#modoActual === 'via') {
            this.#colocarVia(x, y);
        } else if (this.#modoActual === 'construccion') {
            this.#construir(x, y);
        }
        // Si modo normal, lo maneja modalEdificio.js
    }

    // ── Acciones ─────────────────────────────────────────────

    #construir(x, y) {
        const tipo    = this.#tipoSeleccionado;
        const subtipo = this.#subtipoSeleccionado || tipo;

        if (!tipo) {
            this.#notificaciones.mostrarError('Selecciona un tipo de edificio primero');
            return;
        }

        const resultado = this.#ctrlEdificio.construir(tipo, subtipo, x, y);

        if (resultado.ok) {
            this.#renderer.actualizarCelda(x, y);
            this.#notificaciones.mostrarExito(resultado.mensaje);
        } else {
            this.#notificaciones.mostrarError(resultado.mensaje);
        }
    }

    #colocarVia(x, y) {
        const resultado = this.#ctrlMapa.colocarVia(x, y);

        if (resultado.ok) {
            this.#renderer.actualizarCelda(x, y);
            this.#notificaciones.mostrarExito(resultado.mensaje);
        } else {
            this.#notificaciones.mostrarError(resultado.mensaje);
        }
    }

    // ── UI helpers ───────────────────────────────────────────

    #actualizarSubtipos() {
        const tipo     = this.#tipoSeleccionado;
        const subtipos = MenuConstruccion.#SUBTIPOS[tipo] || [];

        this.#selectSubtipo.innerHTML = '';

        if (subtipos.length === 0) {
            // Parque no tiene subtipo
            this.#panelSubtipo.style.display  = 'none';
            this.#subtipoSeleccionado         = tipo;
            this.#mostrarCosto();
            return;
        }

        this.#panelSubtipo.style.display = 'block';
        subtipos.forEach(sub => {
            const opt   = document.createElement('option');
            opt.value   = sub;
            opt.textContent = this.#formatearNombre(sub);
            this.#selectSubtipo.appendChild(opt);
        });

        this.#subtipoSeleccionado = subtipos[0];
        this.#mostrarCosto();
    }

    #mostrarCosto() {
        const tipo    = this.#tipoSeleccionado;
        const subtipo = this.#subtipoSeleccionado;
        if (!tipo) return;
        const costo = MenuConstruccion.#COSTOS[tipo]?.[subtipo]
                   ?? MenuConstruccion.#COSTOS[tipo]?.[tipo]
                   ?? 0;
        this.#infoCosto.textContent = `Costo: $${costo.toLocaleString()}`;
    }

    #formatearNombre(str) {
        // 'centroComercial' → 'Centro Comercial'
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, c => c.toUpperCase());
    }

    getModoActual() { return this.#modoActual; }
}