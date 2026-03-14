import CiudadStorage from "../../acceso_datos/CiudadStorage.js";
import ControladorTurno from "../../negocio/ControladorTurno.js";
import { renderizarPanelRecursos } from "./panelRecursos.js";
import renderWidgetClima from "./widgetClima.js";
import { MapaRenderer } from "./MapaRender.js";

function renderizarDatosCiudad(ciudad) {
    const nombreCiudad = document.getElementById("nombre-ciudad");
    const datosCiudad = document.getElementById("datos-ciudad");

    if (nombreCiudad) {
        nombreCiudad.textContent = ciudad.nombre;
    }

    if (datosCiudad) {
        datosCiudad.innerHTML = `
            <p><strong>Alcalde:</strong> ${ciudad.alcalde}</p>
            <p><strong>Región:</strong> ${ciudad.region}</p>
            <p><strong>Tamaño:</strong> ${ciudad.ancho} x ${ciudad.alto}</p>
            <p><strong>Turno actual:</strong> ${ciudad.turnoActual}</p>
            <p><strong>Puntuación:</strong> ${ciudad.puntuacion}</p>
        `;
    }
}

function limpiarSeleccionCelda() {
    document
        .querySelectorAll("#mapa-grid .celda.seleccionada")
        .forEach((el) => el.classList.remove("seleccionada"));
}

function seleccionarCeldaVisual(x, y) {
    limpiarSeleccionCelda();

    const celda = document.querySelector(
        `#mapa-grid .celda[data-x="${x}"][data-y="${y}"]`
    );

    if (celda) {
        celda.classList.add("seleccionada");
    }
}

let mapaRenderer = null;

function renderizarMapa(ciudad) {
    const areaMapa = document.getElementById("contenedor-mapa");

    if (!areaMapa) return;

    areaMapa.innerHTML = `
        <div id="mapa-contenedor">
            <div id="mapa-grid"></div>
        </div>
    `;

    const mapaGrid = document.getElementById("mapa-grid");
    if (!mapaGrid) return;

    const edificiosMap = ciudad.edificios instanceof Map
        ? ciudad.edificios
        : new Map();

    mapaRenderer = new MapaRenderer(
        mapaGrid,
        ciudad.mapa,
        edificiosMap,
        null,
        (x, y, celda, mensajeError) => {
            seleccionarCeldaVisual(x, y);
            console.log("Click en celda:", x, y, celda, mensajeError);
        }
    );

    mapaRenderer.renderizar();
}

function inicializarVistaJuego() {
    const ciudad = CiudadStorage.cargar();

    if (!ciudad) {
        alert("No hay una ciudad guardada. Primero debes crear una ciudad.");
        window.location.href = "../../index.html";
        return;
    }

    renderizarDatosCiudad(ciudad);
    renderizarPanelRecursos(ciudad);
    renderizarMapa(ciudad);
    renderWidgetClima(ciudad.region, ciudad.latitud, ciudad.longitud);

    const controladorTurno = new ControladorTurno((ciudadActualizada) => {
        renderizarDatosCiudad(ciudadActualizada);
        renderizarPanelRecursos(ciudadActualizada);
        renderizarMapa(ciudadActualizada);
    });

    controladorTurno.iniciar();
}

document.addEventListener("DOMContentLoaded", inicializarVistaJuego);
