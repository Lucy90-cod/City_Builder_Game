import CiudadStorage from "../acceso_datos/CiudadStorage.js";
import ControladorRecurso from "./ControladorRecurso.js";

export default class ControladorTurno {
    constructor(onTurnoActualizado = null, intervalo = 10000) {
        this.onTurnoActualizado = onTurnoActualizado;
        this.intervalo = intervalo;
        this.temporizador = null;
        this.controladorRecurso = new ControladorRecurso();
    }

    calcularPuntuacion(ciudad) {
        const dinero = ciudad.recursos?.dinero?.cantidad ?? 0;
        const electricidad = ciudad.recursos?.electricidad?.cantidad ?? 0;
        const agua = ciudad.recursos?.agua?.cantidad ?? 0;
        const poblacion = ciudad.poblacion ?? 0;
        const felicidad = ciudad.felicidadPromedio ?? 0;
        const edificios = ciudad.edificios?.size ?? 0;

        let puntuacion =
            Math.floor(dinero / 100) +
            (poblacion * 10) +
            felicidad +
            (edificios * 5);

        if (electricidad < 0) {
            puntuacion -= 100;
        }

        if (agua < 0) {
            puntuacion -= 100;
        }

        return Math.max(0, Math.floor(puntuacion));
    }

    iniciar() {
        if (this.temporizador) {
            return;
        }

        this.temporizador = setInterval(() => {
            this.ejecutarTurno();
        }, this.intervalo);
    }

    detener() {
        if (this.temporizador) {
            clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }

    ejecutarTurno() {
        const ciudad = CiudadStorage.cargar();

        if (!ciudad) {
            this.detener();
            return;
        }

        this.controladorRecurso.procesarTurno(ciudad);

        ciudad.turnoActual += 1;
        ciudad.puntuacion = this.calcularPuntuacion(ciudad);

        CiudadStorage.guardar(ciudad);

        if (typeof this.onTurnoActualizado === "function") {
            this.onTurnoActualizado(ciudad);
        }
    }
}
