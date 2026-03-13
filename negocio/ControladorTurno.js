import CiudadStorage from "../acceso_datos/CiudadStorage.js";

export default class ControladorTurno {
    constructor(onTurnoActualizado = null, intervalo = 10000) {
        this.onTurnoActualizado = onTurnoActualizado;
        this.intervalo = intervalo;
        this.temporizador = null;
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

        ciudad.turnoActual += 1;

        CiudadStorage.guardar(ciudad);

        if (typeof this.onTurnoActualizado === "function") {
            this.onTurnoActualizado(ciudad);
        }
    }
}
