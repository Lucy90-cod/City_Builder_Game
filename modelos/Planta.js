// modelos/Planta.js
// Tipos: 'electrica' (200 elec/t, $10.000, sin consumo)
//        'agua'      (150 agua/t, $8.000, consume 20 elec/t)

import { Edificio } from './Edificio.js';

export class Planta extends Edificio {

    #subtipo;               // 'electrica' | 'agua'
    #produccionPorTurno;    // cantidad del recurso que genera
    #tipoRecurso;           // 'electricity' | 'water'

    constructor(id, subtipo, posicion) {
        const config = subtipo === 'electrica'
            ? { costo: 10000, mantenimiento: 500, produccion: 200, recurso: 'electricity' }
            : { costo: 8000,  mantenimiento: 400, produccion: 150, recurso: 'water'       };

        super(id, 'planta', config.costo, posicion, config.mantenimiento);

        this.#subtipo            = subtipo;
        this.#produccionPorTurno = config.produccion;
        this.#tipoRecurso        = config.recurso;
    }

    // ── Getters propios ──────────────────────────────────────────────────────

    getSubtipo()        { return this.#subtipo; }
    getProduccion()     { return this.#produccionPorTurno; }
    getTipoRecurso()    { return this.#tipoRecurso; }

    // ── @override metodos abstractos ─────────────────────────────────────────

    calcularConsumo() {
        // Electrica: sin consumo  |  Agua: 20 elec/t
        return this.#subtipo === 'electrica'
            ? {}
            : { electricidad: 20 };
    }

    calcularProduccion() {
        if (!this.isActivo()) return {};
        return { [this.#tipoRecurso]: this.#produccionPorTurno };
        // Resultado: { electricity: 200 }  o  { water: 150 }
    }

    getInfo() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            tipoRecurso:        this.#tipoRecurso,
            produccionPorTurno: this.#produccionPorTurno,
            consumo:            this.calcularConsumo(),
        };
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            tipoRecurso:        this.#tipoRecurso,
            produccionPorTurno: this.#produccionPorTurno,
        };
    }
}