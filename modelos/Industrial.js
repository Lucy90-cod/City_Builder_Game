// modelos/Industrial.js
// Tipos: 'fabrica' (15 empleos, $800/t, consume elec+agua)
//        'granja'  (8 empleos, 50 alimentos/t, consume agua)
// Si faltan recursos, produccion baja al 50%.

import { Edificio } from './Edificio.js';

export class Industrial extends Edificio {

    #subtipo;       // 'fabrica' | 'granja'
    #empleos;
    #empleados;     // Ciudadano[]

    constructor(id, subtipo, posicion) {
        const config = subtipo === 'fabrica'
            ? { costo: 5000, mantenimiento: 250, empleos: 15 }
            : { costo: 3000, mantenimiento: 150, empleos: 8  };

        super(id, 'industrial', config.costo, posicion, config.mantenimiento);

        this.#subtipo   = subtipo;
        this.#empleos   = config.empleos;
        this.#empleados = [];
    }

    // ── Getters propios ──────────────────────────────────────────────────────

    getSubtipo()            { return this.#subtipo; }
    getEmpleos()            { return this.#empleos; }
    getEmpleados()          { return [...this.#empleados]; }
    getEmpleosDisponibles() { return this.#empleos - this.#empleados.length; }

    // ── Gestion de empleados ─────────────────────────────────────────────────

    asignarEmpleado(ciudadano) {
        if (this.getEmpleosDisponibles() <= 0) {
            throw new Error(`Edificio ${this.getId()} no tiene empleos disponibles`);
        }
        this.#empleados.push(ciudadano);
    }

    liberarEmpleado(id) {
        const antes = this.#empleados.length;
        this.#empleados = this.#empleados.filter(c => c.getId() !== id);
        if (this.#empleados.length === antes) {
            throw new Error(`Ciudadano ${id} no trabaja en este edificio`);
        }
    }

    // Produccion con penalizacion si faltan recursos (factor 0.5 o 1)
    producir(recursosCompletos = true) {
        const factor = recursosCompletos ? 1 : 0.5;
        if (this.#subtipo === 'fabrica') {
            return { money: 800 * factor };
        } else {
            return { food: 50 * factor };
        }
    }

    // ── @override metodos abstractos ─────────────────────────────────────────

    calcularConsumo() {
        // Fabrica: 20 elec + 15 agua  |  Granja: 10 agua
        return this.#subtipo === 'fabrica'
            ? { electricidad: 20, agua: 15 }
            : { agua: 10 };
    }

    calcularProduccion() {
        // Produccion base (sin penalizacion); ControladorRecurso aplica el factor
        return this.isActivo() ? this.producir(true) : {};
    }

    getInfo() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            empleos:            this.#empleos,
            empleados:          this.#empleados.length,
            empleosDisponibles: this.getEmpleosDisponibles(),
            produccion:         this.calcularProduccion(),
            consumo:            this.calcularConsumo(),
        };
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ...super.toJSON(),
            subtipo:   this.#subtipo,
            empleos:   this.#empleos,
            empleados: this.#empleados.map(c => c.getId()),
        };
    }
}