import Jugador from "../modelos/Jugador.js";
import JugadorStorage from "../acceso_datos/JugadorStorage.js";

export default class ControladorJugador {

    constructor() {
        this.jugador = null;
    }

    // ── Crear nuevo jugador ───────────────────────────────────────
    crearJugador(nombre) {
        if (!nombre || !nombre.trim()) {
            throw new Error("El nombre del jugador es obligatorio");
        }

        const id = `jugador_${Date.now()}`;
        this.jugador = new Jugador(id, nombre.trim());
        JugadorStorage.guardar(this.jugador);
        return this.jugador;
    }

    // ── Cargar jugador desde LocalStorage ────────────────────────
    cargarJugador() {
        this.jugador = JugadorStorage.cargar();
        return this.jugador;
    }

    // ── Obtener jugador actual ────────────────────────────────────
    obtenerJugador() {
        if (!this.jugador) {
            this.cargarJugador();
        }
        return this.jugador;
    }

    // ── Actualizar datos del jugador tras un turno ────────────────
    actualizarTrasturno(ciudad) {
        const jugador = this.obtenerJugador();
        if (!jugador || !ciudad) return;

        jugador.actualizarMejorPuntuacion(ciudad.puntuacion);
        jugador.actualizarFechaUltimaPartida();
        jugador.asignarCiudad(ciudad);
        JugadorStorage.guardar(jugador);
    }

    // ── Vincular jugador a ciudad ─────────────────────────────────
    vincularCiudad(ciudad) {
        const jugador = this.obtenerJugador();
        if (!jugador || !ciudad) return;

        jugador.asignarCiudad(ciudad);
        JugadorStorage.guardar(jugador);
    }

    // ── Eliminar jugador ──────────────────────────────────────────
    eliminarJugador() {
        JugadorStorage.eliminar();
        this.jugador = null;
    }

    // ── Verificar si existe jugador guardado ──────────────────────
    existeJugador() {
        return JugadorStorage.existe();
    }
}
