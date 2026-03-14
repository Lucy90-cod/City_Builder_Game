import CiudadStorage from "../acceso_datos/CiudadStorage.js";
import ControladorRecurso from "./ControladorRecurso.js";
import Puntuacion from "../modelos/Puntuacion.js";

export default class ControladorTurno {

    constructor(onTurnoActualizado = null, intervalo = 10000) {
        this.onTurnoActualizado = onTurnoActualizado;
        this.intervalo          = intervalo;
        this.temporizador       = null;
        this.controladorRecurso = new ControladorRecurso();
        this.puntuacion         = new Puntuacion();
    }

    // ── Configurar intervalo dinámicamente ───────────────────────
    setIntervalo(segundos) {
        const ms = (parseInt(segundos) || 10) * 1000;
        this.intervalo = ms;
    }

    // ── Iniciar ciclo de turnos ───────────────────────────────────
    iniciar() {
        if (this.temporizador) return;

        this.temporizador = setInterval(() => {
            this.ejecutarTurno();
        }, this.intervalo);
    }

    // ── Detener ciclo de turnos ───────────────────────────────────
    detener() {
        if (this.temporizador) {
            clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }

    // ── Reiniciar con nuevo intervalo ─────────────────────────────
    reiniciar(nuevoIntervalo = null) {
        this.detener();
        if (nuevoIntervalo) this.setIntervalo(nuevoIntervalo);
        this.iniciar();
    }

    // ── Ejecutar un turno completo ────────────────────────────────
    ejecutarTurno() {
        const ciudad = CiudadStorage.cargar();
        if (!ciudad) {
            this.detener();
            return;
        }

        // 1. Procesar recursos (producción, consumo, balance)
        this.controladorRecurso.procesarTurno(ciudad);

        // 2. Verificar condiciones de fin de juego
        const finJuego = this.verificarFinJuego(ciudad);
        if (finJuego) {
            CiudadStorage.guardar(ciudad);
            if (typeof this.onTurnoActualizado === "function") {
                this.onTurnoActualizado(ciudad, { finJuego: true, motivo: finJuego });
            }
            this.detener();
            return;
        }

        // 3. Avanzar turno
        ciudad.turnoActual += 1;

        // 4. Calcular puntuación con la clase Puntuacion
        ciudad.desempleados   = this.calcularDesempleados(ciudad);
        ciudad.totalEdificios = ciudad.edificios instanceof Map
            ? ciudad.edificios.size
            : 0;

        const totalPuntuacion = this.puntuacion.calcular(ciudad);
        ciudad.actualizarPuntuacion(totalPuntuacion);

        // 5. Guardar en LocalStorage
        CiudadStorage.guardar(ciudad);

        // 6. Notificar a la vista
        if (typeof this.onTurnoActualizado === "function") {
            this.onTurnoActualizado(ciudad, { finJuego: false });
        }
    }

    // ── Verificar fin de juego ────────────────────────────────────
    verificarFinJuego(ciudad) {
        if (!ciudad || !ciudad.recursos) return null;

        const electricidad = ciudad.recursos.electricidad?.cantidad ?? 0;
        const agua         = ciudad.recursos.agua?.cantidad ?? 0;

        if (electricidad < 0) return "electricidad";
        if (agua < 0)         return "agua";

        return null;
    }

    // ── Calcular ciudadanos desempleados ──────────────────────────
    calcularDesempleados(ciudad) {
        if (!ciudad || !ciudad.edificios) return 0;

        let empleosDisponibles = 0;
        const edificios = ciudad.edificios instanceof Map
            ? Array.from(ciudad.edificios.values())
            : [];

        edificios.forEach(edificio => {
            if (typeof edificio.getEmpleos === "function") {
                empleosDisponibles += edificio.getEmpleos();
            }
        });

        const poblacion = ciudad.poblacion ?? 0;
        return Math.max(0, poblacion - empleosDisponibles);
    }

    estaActivo() {
        return this.temporizador !== null;
    }
}
