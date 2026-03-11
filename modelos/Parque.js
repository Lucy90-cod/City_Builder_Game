// modelos/Parque.js
// Costo: $1.500. No consume recursos.
// Otorga +5 felicidad a TODOS los ciudadanos (configurable desde la UI).

import { Edificio } from './Edificio.js';

export class Parque extends Edificio {

    #beneficioFelicidad;    // configurable

    constructor(id, posicion) {
        super(id, 'parque', 1500, posicion, 0);  // sin costo de mantenimiento

        this.#beneficioFelicidad = 5;
    }

    // ── Getters propios ──────────────────────────────────────────────────────

    getBeneficio() { return this.#beneficioFelicidad; }

    // Configurable desde caja de texto en la UI
    setBeneficio(valor) {
        const num = Number(valor);
        if (isNaN(num) || num < 0) {
            throw new Error('El beneficio de felicidad debe ser un numero positivo');
        }
        this.#beneficioFelicidad = num;
    }

    // ── @override metodos abstractos ─────────────────────────────────────────

    calcularConsumo() {
        return {};  // parques no consumen ningun recurso
    }

    calcularProduccion() {
        return {};  // la felicidad la calcula ControladorCiudadano, no el recurso
    }

    getInfo() {
        return {
            ...super.toJSON(),
            beneficioFelicidad: this.#beneficioFelicidad,
            consumo:            {},
        };
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ...super.toJSON(),
            beneficioFelicidad: this.#beneficioFelicidad,
        };
    }
}