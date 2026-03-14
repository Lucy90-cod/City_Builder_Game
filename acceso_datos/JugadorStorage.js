import Jugador from "../modelos/Jugador.js";

const CLAVE_JUGADOR = "ciudad_virtual_jugador";

export default class JugadorStorage {
    static guardar(jugador) {
        if (!jugador) {
            throw new Error("No se puede guardar un jugador nulo");
        }

        localStorage.setItem(CLAVE_JUGADOR, JSON.stringify(jugador.toJSON()));
    }

    static cargar() {
        const data = localStorage.getItem(CLAVE_JUGADOR);

        if (!data) {
            return null;
        }

        try {
            return Jugador.fromJSON(JSON.parse(data));
        } catch (error) {
            console.error("Error al cargar jugador:", error);
            return null;
        }
    }

    static eliminar() {
        localStorage.removeItem(CLAVE_JUGADOR);
    }

    static existe() {
        return localStorage.getItem(CLAVE_JUGADOR) !== null;
    }
}
