// modelos/Servicio.js
// Tipos: 'policia'   (+10 fel, radio 5, $4.000, 15 elec/t)
//        'bomberos'  (+10 fel, radio 5, $4.000, 15 elec/t)
//        'hospital'  (+10 fel, radio 7, $6.000, 20 elec/t + 10 agua/t)
// El beneficio de felicidad es configurable desde la UI.

import { Edificio } from './Edificio.js';

export class Servicio extends Edificio {

    #subtipo;               // 'policia' | 'bomberos' | 'hospital'
    #radio;                 // celdas de influencia
    #beneficioFelicidad;    // puntos de felicidad que otorga
    #consumoAgua;           // solo hospital consume agua

    constructor(id, subtipo, posicion) {
        const config = subtipo === 'hospital'
            ? { costo: 6000, mantenimiento: 300, radio: 7, beneficio: 10 }
            : { costo: 4000, mantenimiento: 200, radio: 5, beneficio: 10 };

        super(id, 'servicio', config.costo, posicion, config.mantenimiento);

        this.#subtipo            = subtipo;
        this.#radio              = config.radio;
        this.#beneficioFelicidad = config.beneficio;
        this.#consumoAgua        = subtipo === 'hospital' ? 10 : 0;
    }

    // ── Getters propios ──────────────────────────────────────────────────────

    getSubtipo()    { return this.#subtipo; }
    getRadio()      { return this.#radio; }
    getBeneficio()  { return this.#beneficioFelicidad; }

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
        // Policia / Bomberos: 15 elec      Hospital: 20 elec + 10 agua
        if (this.#subtipo === 'hospital') {
            return { electricidad: 20, agua: this.#consumoAgua };
        }
        return { electricidad: 15 };
    }

    calcularProduccion() {
        return {};  // los servicios no producen recursos economicos
    }

    getInfo() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            radio:              this.#radio,
            beneficioFelicidad: this.#beneficioFelicidad,
            consumo:            this.calcularConsumo(),
        };
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            radio:              this.#radio,
            beneficioFelicidad: this.#beneficioFelicidad,
        };
    }
}