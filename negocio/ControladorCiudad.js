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

        const ancho = Number(datos.ancho);
        const alto = Number(datos.alto);

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
