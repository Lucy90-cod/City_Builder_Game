import Recurso from "./Recurso.js";
import { Mapa } from "./Mapa.js";

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
        this.felicidadPromedio = 0;

        this.recursos = {
            dinero: new Recurso("Dinero", 50000, 0, 0, "$"),
            electricidad: new Recurso("Electricidad", 0, 0, 0, "u/t"),
            agua: new Recurso("Agua", 0, 0, 0, "u/t"),
            alimentos: new Recurso("Alimentos", 0, 0, 0, "u")
        };

        this.mapa = new Mapa(ancho, alto);
    }

    inicializarMapa() {
        this.mapa = new Mapa(this.ancho, this.alto);
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
            felicidadPromedio: this.felicidadPromedio,
            puntuacion: this.puntuacion,
            recursos: {
                dinero: this.recursos.dinero.toJSON(),
                electricidad: this.recursos.electricidad.toJSON(),
                agua: this.recursos.agua.toJSON(),
                alimentos: this.recursos.alimentos.toJSON()
            },
            mapa: this.mapa.toJSON()
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

        ciudad.turnoActual = data.turnoActual ?? 0;
        ciudad.poblacion = data.poblacion ?? 0;
        ciudad.puntuacion = data.puntuacion ?? 0;
        ciudad.felicidadPromedio = data.felicidadPromedio ?? 0;

        ciudad.recursos.dinero = Recurso.fromJSON(data.recursos.dinero);
        ciudad.recursos.electricidad = Recurso.fromJSON(data.recursos.electricidad);
        ciudad.recursos.agua = Recurso.fromJSON(data.recursos.agua);
        ciudad.recursos.alimentos = Recurso.fromJSON(data.recursos.alimentos);

        ciudad.mapa = data.mapa ? Mapa.fromJSON(data.mapa) : new Mapa(data.ancho, data.alto);

        return ciudad;
    }
}
