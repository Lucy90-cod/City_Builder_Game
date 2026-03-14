export default class Jugador {
    constructor(id, nombre, ciudadActual = null, mejorPuntuacion = 0, fechaUltimaPartida = null) {
        this.id = id;
        this.nombre = nombre;
        this.ciudadActual = ciudadActual;
        this.mejorPuntuacion = mejorPuntuacion;
        this.fechaUltimaPartida = fechaUltimaPartida;
    }

    asignarCiudad(ciudad) {
        this.ciudadActual = ciudad;
    }

    actualizarMejorPuntuacion(puntuacion) {
        const valor = Number(puntuacion) || 0;
        if (valor > this.mejorPuntuacion) {
            this.mejorPuntuacion = valor;
        }
    }

    actualizarFechaUltimaPartida() {
        this.fechaUltimaPartida = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            ciudadActual: this.ciudadActual ? this.ciudadActual.nombre ?? this.ciudadActual : null,
            mejorPuntuacion: this.mejorPuntuacion,
            fechaUltimaPartida: this.fechaUltimaPartida
        };
    }

    static fromJSON(data) {
        return new Jugador(
            data.id,
            data.nombre,
            data.ciudadActual ?? null,
            data.mejorPuntuacion ?? 0,
            data.fechaUltimaPartida ?? null
        );
    }
}
