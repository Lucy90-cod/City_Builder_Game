/**
 * Logica de manejo del mapa: cargar layout, colocar y eliminar vias.
 */

export class ControladorMapa {

    #ciudad;

    constructor(ciudad) {
        this.#ciudad = ciudad;
    }

    // ── Carga ────────────────────────────────────────────────

    /**
     * Carga el layout del mapa desde un string de texto plano.
     * Delega al modelo Mapa.
     * @param {string} texto
     */
    cargarDesdeTexto(texto) {
        this.#ciudad.getMapa().cargarDesdeTexto(texto);
    }

    // ── Vias ─────────────────────────────────────────────────

    /**
     * Coloca una via en (x, y) si la celda esta vacia y hay fondos.
     * Costo: $100 por celda.
     * @returns {{ ok: boolean, mensaje: string }}
     */
    colocarVia(x, y) {
        const mapa    = this.#ciudad.getMapa();
        const recurso = this.#ciudad.getRecurso();
        const vias    = this.#ciudad.getVias();
        const COSTO   = vias.getCostoPorCelda();

        if (mapa.estaOcupada(x, y))
            return { ok: false, mensaje: 'La celda ya esta ocupada' };

        if (recurso.getMoney() < COSTO)
            return { ok: false, mensaje: `Fondos insuficientes. Una via cuesta $${COSTO}` };

        // Descontar costo
        recurso.addMoney(-COSTO);

        // Marcar celda
        mapa.getCelda(x, y).setTipo('road');

        // Registrar en Vias
        vias.agregarCelda(x, y);

        return { ok: true, mensaje: `Via colocada en (${x},${y})` };
    }

    /**
     * Elimina una via de (x, y). No devuelve dinero.
     * No se puede eliminar si hay un edificio adyacente que depende de esta via.
     * @returns {{ ok: boolean, mensaje: string }}
     */
    eliminarVia(x, y) {
        const mapa = this.#ciudad.getMapa();
        const celda = mapa.getCelda(x, y);

        if (!celda.isVia())
            return { ok: false, mensaje: `No hay via en (${x},${y})` };

        // Verificar que ningun edificio adyacente quede sin via
        const adyacentes = [
            { x: x,   y: y-1 },
            { x: x,   y: y+1 },
            { x: x-1, y: y   },
            { x: x+1, y: y   },
        ];

        for (const pos of adyacentes) {
            if (pos.x < 0 || pos.x >= mapa.getAncho()) continue;
            if (pos.y < 0 || pos.y >= mapa.getAlto())  continue;

            const vecina = mapa.getCelda(pos.x, pos.y);
            if (!vecina.isEdificio()) continue;

            // Simular eliminacion: ver si el edificio vecino aun tiene otra via
            // Temporalmente marcar como grass para re-evaluar
            celda.setTipo('grass');
            const sigueConVia = mapa.tieneViaAdyacente(pos.x, pos.y);
            celda.setTipo('road'); // restaurar

            if (!sigueConVia) {
                return {
                    ok: false,
                    mensaje: `No se puede eliminar: el edificio en (${pos.x},${pos.y}) perderia su unica via`
                };
            }
        }

        // Eliminar
        celda.setTipo('grass');
        this.#ciudad.getVias().eliminarCelda(x, y);

        return { ok: true, mensaje: `Via eliminada en (${x},${y})` };
    }

    // ── Consultas ────────────────────────────────────────────

    getCelda(x, y) {
        return this.#ciudad.getMapa().getCelda(x, y);
    }

    estaOcupada(x, y) {
        return this.#ciudad.getMapa().estaOcupada(x, y);
    }

    tieneViaAdyacente(x, y) {
        return this.#ciudad.getMapa().tieneViaAdyacente(x, y);
    }

    getMatrizRuta() {
        return this.#ciudad.getMapa().getMatrizRuta();
    }
}