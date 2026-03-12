import Recurso from "./Recurso.js";

export default class Ciudad {
    constructor({ nombre, alcalde, region, latitud, longitud, ancho, alto }) {
        this.nombre = nombre;
        this.alcalde = alcalde;
        this.region = region;
        this.latitud = latitud;
        this.longitud = longitud;
        this.ancho = ancho;
        this.alto = alto;

        this.turnoActual = 0;
        this.poblacion = 0;
        this.puntuacion = 0;

        this.recursos = {
            dinero: new Recurso("Dinero", 50000, "$"),
            electricidad: new Recurso("Electricidad", 0, "u/t"),
            agua: new Recurso("Agua", 0, "u/t"),
            alimentos: new Recurso("Alimentos", 0, "u")
        };

        this.mapa = [];
    }

    inicializarMapa() {
        this.mapa = [];

        for (let fila = 0; fila < this.alto; fila++) {
            const nuevaFila = [];

            for (let columna = 0; columna < this.ancho; columna++) {
                nuevaFila.push(null);
            }

            this.mapa.push(nuevaFila);
        }
    }

    toJSON() {
        return {
            nombre: this.nombre,
            alcalde: this.alcalde,
            region: this.region,
            latitud: this.latitud,
            longitud: this.longitud,
            ancho: this.ancho,
            alto: this.alto,
            turnoActual: this.turnoActual,
            poblacion: this.poblacion,
            puntuacion: this.puntuacion,
            recursos: {
                dinero: this.recursos.dinero.toJSON(),
                electricidad: this.recursos.electricidad.toJSON(),
                agua: this.recursos.agua.toJSON(),
                alimentos: this.recursos.alimentos.toJSON()
            },
            mapa: this.mapa
        };
    }

    static fromJSON(data) {
        const ciudad = new Ciudad({
            nombre: data.nombre,
            alcalde: data.alcalde,
            region: data.region,
            latitud: data.latitud,
            longitud: data.longitud,
            ancho: data.ancho,
            alto: data.alto
        });

        ciudad.turnoActual = data.turnoActual;
        ciudad.poblacion = data.poblacion;
        ciudad.puntuacion = data.puntuacion;
        ciudad.recursos.dinero = Recurso.fromJSON(data.recursos.dinero);
        ciudad.recursos.electricidad = Recurso.fromJSON(data.recursos.electricidad);
        ciudad.recursos.agua = Recurso.fromJSON(data.recursos.agua);
        ciudad.recursos.alimentos = Recurso.fromJSON(data.recursos.alimentos);
        ciudad.mapa = data.mapa || [];

        return ciudad;
    }
}
