export default class Jugador {
    constructor(id, nombre, ciudadActual = null) {
        this.id = id;
        this.nombre = nombre;
        this.ciudadActual = ciudadActual;
    }

    asignarCiudad(ciudad) {
        this.ciudadActual = ciudad;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            ciudadActual: this.ciudadActual ? this.ciudadActual.nombre : null
        };
    }

    static fromJSON(data) {
        return new Jugador(data.id, data.nombre, data.ciudadActual);
    }
}
