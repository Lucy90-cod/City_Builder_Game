import Recurso from "./Recurso.js";
import { Mapa } from "./Mapa.js";
import { Residencial } from "./Residencial.js";
import { Comercial } from "./Comercial.js";
import { Industrial } from "./Industrial.js";
import { Servicio } from "./Servicio.js";
import { Planta } from "./Planta.js";
import { Parque } from "./Parque.js";

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
        this.edificios = new Map();
    }

    inicializarMapa() {
        this.mapa = new Mapa(this.ancho, this.alto);
    }

    agregarEdificio(edificio) {
        if (!edificio || typeof edificio.getId !== "function") {
            throw new Error("Edificio inválido");
        }

        this.edificios.set(edificio.getId(), edificio);
    }

    eliminarEdificio(edificioId) {
        this.edificios.delete(edificioId);
    }

    obtenerEdificio(edificioId) {
        return this.edificios.get(edificioId) ?? null;
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
            mapa: this.mapa.toJSON(),
            edificios: Array.from(this.edificios.values()).map((edificio) => ({
                clase: edificio.constructor.name,
                ...edificio.toJSON()
            }))
        };
    }

    actualizarPuntuacion(valor) {
    this.puntuacion = Math.max(0, Number(valor) || 0);
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

        ciudad.mapa = data.mapa
            ? Mapa.fromJSON(data.mapa)
            : new Mapa(data.ancho, data.alto);

        ciudad.edificios = new Map();

        if (Array.isArray(data.edificios)) {
            data.edificios.forEach((edificioData) => {
                const edificio = Ciudad.#reconstruirEdificio(edificioData);
                if (edificio) {
                    ciudad.edificios.set(edificio.getId(), edificio);
                }
            });
        }

        return ciudad;
    }

    static #reconstruirEdificio(data) {
        if (!data || !data.id || !data.tipo || !data.posicion) {
            return null;
        }

        switch (data.tipo) {
            case "residencial":
                return new Residencial(data.id, data.subtipo, data.posicion);

            case "comercial":
                return new Comercial(data.id, data.subtipo, data.posicion);

            case "industrial":
                return new Industrial(data.id, data.subtipo, data.posicion);

            case "servicio":
                return new Servicio(data.id, data.subtipo, data.posicion);

            case "planta":
                return new Planta(data.id, data.subtipo, data.posicion);

            case "parque":
                return new Parque(data.id, data.posicion);

            default:
                return null;
        }
    }
}
