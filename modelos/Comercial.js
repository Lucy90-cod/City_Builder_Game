// modelos/Comercial.js
// Tipos: 'tienda' (6 empleos, $500/t) | 'centroComercial' (20 empleos, $2.000/t)
// Sin electricidad no genera ingresos.

import { Edificio } from './Edificio.js';

export class Comercial extends Edificio {

    #subtipo;               // 'tienda' | 'centroComercial'
    #empleos;               // capacidad maxima de empleados
    #empleados;             // Ciudadano[]
    #ingresosPorTurno;      // dinero generado si hay electricidad

    constructor(id, subtipo, posicion) {
        const config = subtipo === 'tienda'
            ? { costo: 2000, mantenimiento: 100, empleos: 6,  ingresos: 500  }
            : { costo: 8000, mantenimiento: 400, empleos: 20, ingresos: 2000 };

        super(id, 'comercial', config.costo, posicion, config.mantenimiento);

        this.#subtipo           = subtipo;
        this.#empleos           = config.empleos;
        this.#empleados         = [];
        this.#ingresosPorTurno  = config.ingresos;
    }

    // ── Getters propios ──────────────────────────────────────────────────────

    getSubtipo()            { return this.#subtipo; }
    getEmpleos()            { return this.#empleos; }
    getEmpleados()          { return [...this.#empleados]; }
    getEmpleosDisponibles() { return this.#empleos - this.#empleados.length; }
    getIngresosPorTurno()   { return this.#ingresosPorTurno; }

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

    // Retorna los ingresos reales del turno (0 si no hay electricidad)
    generarIngresos(hayElectricidad = true) {
        return (this.isActivo() && hayElectricidad) ? this.#ingresosPorTurno : 0;
    }

    // ── @override metodos abstractos ─────────────────────────────────────────

    calcularConsumo() {
        // Tienda: 8 elec  |  Centro Comercial: 25 elec
        return this.#subtipo === 'tienda'
            ? { electricidad: 8  }
            : { electricidad: 25 };
    }

    calcularProduccion() {
        // Solo produce si esta activo (la verificacion de electricidad
        // la hace ControladorRecurso al llamar generarIngresos())
        return this.isActivo()
            ? { money: this.#ingresosPorTurno }
            : {};
    }

    getInfo() {
        return {
            ...super.toJSON(),
            subtipo:            this.#subtipo,
            empleos:            this.#empleos,
            empleados:          this.#empleados.length,
            empleosDisponibles: this.getEmpleosDisponibles(),
            ingresosPorTurno:   this.#ingresosPorTurno,
            consumo:            this.calcularConsumo(),
        };
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ...super.toJSON(),
            subtipo:          this.#subtipo,
            empleos:          this.#empleos,
            ingresosPorTurno: this.#ingresosPorTurno,
            empleados:        this.#empleados.map(c => c.getId()),
        };
    }
}