import ControladorCiudad from "../../negocio/ControladorCiudad.js";
import { ColombiaService } from "../../negocio/Servicios/ColombiaService.js";
import CiudadStorage from "../../acceso_datos/CiudadStorage.js";

const controladorCiudad = new ControladorCiudad();

// ── Elementos del DOM ────────────────────────────────────────────
const formulario          = document.getElementById("formCrearCiudad");
const mensaje             = document.getElementById("mensaje");
const btnCrear            = document.getElementById("btn-crear");
const selectDepartamento  = document.getElementById("selectDepartamento");
const selectMunicipio     = document.getElementById("selectMunicipio");
const latDisplay          = document.getElementById("lat-display");
const lonDisplay          = document.getElementById("lon-display");
const inputRegion         = document.getElementById("region");
const inputLatitud        = document.getElementById("latitud");
const inputLongitud       = document.getElementById("longitud");
const modalContinuar      = document.getElementById("modal-continuar");
const modalInfo           = document.getElementById("modal-info-partida");
const btnContinuar        = document.getElementById("btn-continuar-partida");
const btnNueva            = document.getElementById("btn-nueva-partida");

// ── Coordenadas de municipios (obtenidas de api-colombia) ────────
const coordenadasMunicipios = {
    "Manizales":     { lat: 5.0703,  lon: -75.5138 },
    "Bogotá":        { lat: 4.7110,  lon: -74.0721 },
    "Medellín":      { lat: 6.2518,  lon: -75.5636 },
    "Cali":          { lat: 3.4516,  lon: -76.5320 },
    "Barranquilla":  { lat: 10.9685, lon: -74.7813 },
    "Cartagena":     { lat: 10.3910, lon: -75.4794 },
    "Pereira":       { lat: 4.8143,  lon: -75.6946 },
    "Bucaramanga":   { lat: 7.1193,  lon: -73.1227 },
    "Santa Marta":   { lat: 11.2408, lon: -74.1990 },
    "Cúcuta":        { lat: 7.8939,  lon: -72.5078 },
};

// ── Detectar partida guardada ────────────────────────────────────
function verificarPartidaGuardada() {
    if (!CiudadStorage.existe()) return;

    const ciudad = CiudadStorage.cargar();
    if (!ciudad) return;

    modalInfo.textContent =
        `Ciudad: "${ciudad.nombre}" | Alcalde: ${ciudad.alcalde} | Turno: ${ciudad.turnoActual} | Puntuación: ${ciudad.puntuacion}`;
    modalContinuar.classList.remove("oculto");
}

btnContinuar.addEventListener("click", () => {
    window.location.href = "./presentacion/vistas/juego.html";
});

btnNueva.addEventListener("click", () => {
    CiudadStorage.eliminar();
    modalContinuar.classList.add("oculto");
});

// ── Cargar departamentos ─────────────────────────────────────────
async function cargarDepartamentos() {
    const departamentos = await ColombiaService.getDepartamentos();

    selectDepartamento.innerHTML = `<option value="">-- Selecciona un departamento --</option>`;
    departamentos.forEach(dep => {
        const option = document.createElement("option");
        option.value = dep.id;
        option.textContent = dep.nombre;
        selectDepartamento.appendChild(option);
    });
}

// ── Cargar municipios al cambiar departamento ────────────────────
selectDepartamento.addEventListener("change", async () => {
    const depId = selectDepartamento.value;

    selectMunicipio.innerHTML = `<option value="">-- Cargando municipios... --</option>`;
    selectMunicipio.disabled = true;
    limpiarCoordenadas();
    btnCrear.disabled = true;

    if (!depId) {
        selectMunicipio.innerHTML = `<option value="">-- Selecciona un departamento primero --</option>`;
        return;
    }

    const municipios = await ColombiaService.getMunicipios(depId);

    selectMunicipio.innerHTML = `<option value="">-- Selecciona un municipio --</option>`;
    municipios.forEach(mun => {
        const option = document.createElement("option");
        option.value = mun.nombre;
        option.textContent = mun.nombre;
        selectMunicipio.appendChild(option);
    });

    selectMunicipio.disabled = false;
});

// ── Asignar coordenadas al seleccionar municipio ─────────────────
selectMunicipio.addEventListener("change", () => {
    const nombreMunicipio = selectMunicipio.value;
    if (!nombreMunicipio) {
        limpiarCoordenadas();
        btnCrear.disabled = true;
        return;
    }

    const coords = coordenadasMunicipios[nombreMunicipio];

    if (coords) {
        inputLatitud.value  = coords.lat;
        inputLongitud.value = coords.lon;
        latDisplay.textContent = `Lat: ${coords.lat}`;
        lonDisplay.textContent = `Lon: ${coords.lon}`;
    } else {
        // Coordenadas por defecto centradas en Colombia si no hay datos
        inputLatitud.value  = 4.5709;
        inputLongitud.value = -74.2973;
        latDisplay.textContent = `Lat: 4.5709 (aproximada)`;
        lonDisplay.textContent = `Lon: -74.2973 (aproximada)`;
    }

    inputRegion.value = nombreMunicipio;
    btnCrear.disabled = false;
});

function limpiarCoordenadas() {
    inputLatitud.value  = "";
    inputLongitud.value = "";
    inputRegion.value   = "";
    latDisplay.textContent = "Lat: --";
    lonDisplay.textContent = "Lon: --";
}

// ── Submit del formulario ────────────────────────────────────────
formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    mostrarMensaje("", "");

    const datos = {
        nombre:               document.getElementById("nombreCiudad").value.trim(),
        alcalde:              document.getElementById("nombreAlcalde").value.trim(),
        region:               inputRegion.value.trim(),
        latitud:              parseFloat(inputLatitud.value),
        longitud:             parseFloat(inputLongitud.value),
        ancho:                parseInt(document.getElementById("anchoMapa").value),
        alto:                 parseInt(document.getElementById("altoMapa").value),
        duracionTurno:        parseInt(document.getElementById("duracionTurno").value) || 10,
        tasaCrecimiento:      parseInt(document.getElementById("tasaCrecimiento").value) || 2,
        electricidadInicial:  parseInt(document.getElementById("electricidadInicial").value) || 0,
        aguaInicial:          parseInt(document.getElementById("aguaInicial").value) || 0,
        alimentosInicial:     parseInt(document.getElementById("alimentosInicial").value) || 0,
        consumoAgua:          parseFloat(document.getElementById("consumoAgua").value) || 1,
        consumoElectricidad:  parseFloat(document.getElementById("consumoElectricidad").value) || 1,
        consumoComida:        parseFloat(document.getElementById("consumoComida").value) || 1,
    };

    try {
        const ciudad = controladorCiudad.crearCiudad(datos);

        // Aplicar recursos iniciales configurables
        ciudad.recursos.electricidad.cantidad = datos.electricidadInicial;
        ciudad.recursos.agua.cantidad         = datos.aguaInicial;
        ciudad.recursos.alimentos.cantidad    = datos.alimentosInicial;

        // Guardar parámetros configurables en la ciudad
        ciudad.configuracion = {
            duracionTurno:       datos.duracionTurno,
            tasaCrecimiento:     datos.tasaCrecimiento,
            consumoAgua:         datos.consumoAgua,
            consumoElectricidad: datos.consumoElectricidad,
            consumoComida:       datos.consumoComida,
        };

        // Guardar en LocalStorage
        CiudadStorage.guardar(ciudad);

        mostrarMensaje(`✅ Ciudad "${ciudad.nombre}" creada correctamente. Redirigiendo...`, "exito");

        setTimeout(() => {
            window.location.href = "./presentacion/vistas/juego.html";
        }, 1200);

    } catch (error) {
        mostrarMensaje(`❌ ${error.message}`, "error");
    }
});

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className   = `mensaje ${tipo}`;
}

// ── Inicializar ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    verificarPartidaGuardada();
    cargarDepartamentos();
});
