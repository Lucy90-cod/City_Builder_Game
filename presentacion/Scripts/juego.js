import CiudadStorage from "../../acceso_datos/CiudadStorage.js";
import ControladorTurno from "../../negocio/ControladorTurno.js";
import ControladorCiudad from "../../negocio/ControladorCiudad.js";
import { renderizarPanelRecursos } from "./panelRecursos.js";
import renderWidgetClima from "./widgetClima.js";
import { MapaRenderer } from "./MapaRender.js";

let mapaRenderer = null;
let controladorCiudad = null;
let controladorTurno = null;
let modoActual = null;

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

function refrescarVista(ciudad) {
    renderizarDatosCiudad(ciudad);
    renderizarPanelRecursos(ciudad);
    renderizarMapa(ciudad);
}

function manejarClickMapa(x, y, celda, mensajeError) {
    seleccionarCeldaVisual(x, y);

    if (!modoActual) {
        return;
    }

    try {
        if (modoActual === "via") {
            controladorCiudad.construirVia(x, y);
        } else {
            controladorCiudad.construirEdificio(modoActual, x, y);
        }

        const ciudadActualizada = controladorCiudad.obtenerCiudadActual();
        refrescarVista(ciudadActualizada);
    } catch (error) {
        alert(error.message);
    }
}

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
        manejarClickMapa
    );

    mapaRenderer.renderizar();
}

function configurarBotonesConstruccion() {
    const configuraciones = [
        { id: "btn-via", modo: "via" },
        { id: "btn-casa", modo: "casa" },
        { id: "btn-apartamento", modo: "apartamento" },
        { id: "btn-tienda", modo: "tienda" },
        { id: "btn-centro-comercial", modo: "centroComercial" },
        { id: "btn-fabrica", modo: "fabrica" },
        { id: "btn-granja", modo: "granja" },
        { id: "btn-policia", modo: "policia" },
        { id: "btn-bomberos", modo: "bomberos" },
        { id: "btn-hospital", modo: "hospital" },
        { id: "btn-planta-electrica", modo: "electrica" },
        { id: "btn-planta-agua", modo: "agua" },
        { id: "btn-parque", modo: "parque" }
    ];

    configuraciones.forEach(({ id, modo }) => {
        const boton = document.getElementById(id);

        if (!boton) return;

        boton.addEventListener("click", () => {
            modoActual = modo;
            marcarBotonActivo(id);
        });
    });

    const btnCancelar = document.getElementById("btn-cancelar-construccion");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            modoActual = null;
            limpiarBotonesActivos();
        });
    }
}

function limpiarBotonesActivos() {
    document
        .querySelectorAll(".boton-construccion.activo")
        .forEach((btn) => btn.classList.remove("activo"));
}

function marcarBotonActivo(idBoton) {
    limpiarBotonesActivos();

    const boton = document.getElementById(idBoton);
    if (boton) {
        boton.classList.add("activo");
    }
}

function inicializarVistaJuego() {
    const ciudad = CiudadStorage.cargar();

    if (!ciudad) {
        alert("No hay una ciudad guardada. Primero debes crear una ciudad.");
        window.location.href = "../../index.html";
        return;
    }

    controladorCiudad = new ControladorCiudad();
    controladorCiudad.ciudad = ciudad;

    refrescarVista(ciudad);
    renderWidgetClima(ciudad.region, ciudad.latitud, ciudad.longitud);
    configurarBotonesConstruccion();

    controladorTurno = new ControladorTurno((ciudadActualizada) => {
        controladorCiudad.ciudad = ciudadActualizada;
        refrescarVista(ciudadActualizada);
    });

    controladorTurno.iniciar();
}

document.addEventListener("DOMContentLoaded", inicializarVistaJuego);
