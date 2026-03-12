import Ciudad from "../modelos/Ciudad.js";
import CiudadStorage from "../acceso_datos/CiudadStorage.js";

export default class ControladorCiudad {
    constructor() {
        this.ciudad = null;
    }

    crearCiudad(datosFormulario) {
        this.validarDatos(datosFormulario);

        this.ciudad = new Ciudad({
            nombre: datosFormulario.nombre,
            alcalde: datosFormulario.alcalde,
            region: datosFormulario.region,
            latitud: Number(datosFormulario.latitud),
            longitud: Number(datosFormulario.longitud),
            ancho: Number(datosFormulario.ancho),
            alto: Number(datosFormulario.alto)
        });

        this.ciudad.inicializarMapa();
        CiudadStorage.guardar(this.ciudad);

        return this.ciudad;
    }

    validarDatos(datos) {
        if (!datos.nombre || !datos.nombre.trim()) {
            throw new Error("El nombre de la ciudad es obligatorio");
        }

        if (!datos.alcalde || !datos.alcalde.trim()) {
            throw new Error("El nombre del alcalde es obligatorio");
        }

        if (!datos.region || !datos.region.trim()) {
            throw new Error("La región es obligatoria");
        }

        const latitud = Number(datos.latitud);
        const longitud = Number(datos.longitud);
        const ancho = Number(datos.ancho);
        const alto = Number(datos.alto);

        if (isNaN(latitud)) {
            throw new Error("La latitud debe ser numérica");
        }

        if (isNaN(longitud)) {
            throw new Error("La longitud debe ser numérica");
        }

        if (latitud < -90 || latitud > 90) {
            throw new Error("La latitud debe estar entre -90 y 90");
        }

        if (longitud < -180 || longitud > 180) {
            throw new Error("La longitud debe estar entre -180 y 180");
        }

        if (isNaN(ancho) || isNaN(alto)) {
            throw new Error("El tamaño del mapa debe ser numérico");
        }

        if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
            throw new Error("El tamaño del mapa debe estar entre 15 y 30");
        }
    }

    cargarCiudad() {
        this.ciudad = CiudadStorage.cargar();
        return this.ciudad;
    }

    obtenerCiudadActual() {
        return this.ciudad;
    }
}
