import CiudadStorage from "../../acceso_datos/CiudadStorage.js";
import ControladorTurno from "../../negocio/ControladorTurno.js";
import ControladorCiudad from "../../negocio/ControladorCiudad.js";
import ControladorJugador from "../../negocio/ControladorJugador.js";
import { renderizarPanelRecursos } from "./panelRecursos.js";
import renderWidgetClima from "./widgetClima.js";
import { renderWidgetNoticias } from "./widgetNoticias.js";
import { MapaRenderer } from "./MapaRender.js";

// ── Estado global ─────────────────────────────────────────────────
let mapaRenderer        = null;
let controladorCiudad   = null;
let controladorTurno    = null;
let controladorJugador  = null;
let modoActual          = null;
let intervaloGuardado   = null;

// ── Renderizar datos generales de la ciudad ───────────────────────
function renderizarDatosCiudad(ciudad) {
    const nombreCiudad = document.getElementById("nombre-ciudad");
    const datosCiudad  = document.getElementById("datos-ciudad");

    if (nombreCiudad) nombreCiudad.textContent = ciudad.nombre;

    if (datosCiudad) {
        datosCiudad.innerHTML = `
            <p><strong>Alcalde:</strong> ${ciudad.alcalde}</p>
            <p><strong>Región:</strong> ${ciudad.region}</p>
            <p><strong>Tamaño:</strong> ${ciudad.ancho} × ${ciudad.alto}</p>
            <p><strong>Turno:</strong> ${ciudad.turnoActual}</p>
            <p><strong>Puntuación:</strong> ${ciudad.puntuacion}</p>
        `;
    }
}

// ── Renderizar mapa ───────────────────────────────────────────────
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

// ── Refrescar toda la vista ───────────────────────────────────────
function refrescarVista(ciudad) {
    renderizarDatosCiudad(ciudad);
    renderizarPanelRecursos(ciudad);
    renderizarMapa(ciudad);
}

// ── Manejo de clicks en el mapa ───────────────────────────────────
function limpiarSeleccionCelda() {
    document.querySelectorAll("#mapa-grid .celda.seleccionada")
        .forEach(el => el.classList.remove("seleccionada"));
}

function seleccionarCeldaVisual(x, y) {
    limpiarSeleccionCelda();
    const celda = document.querySelector(
        `#mapa-grid .celda[data-x="${x}"][data-y="${y}"]`
    );
    if (celda) celda.classList.add("seleccionada");
}

function manejarClickMapa(x, y) {
    seleccionarCeldaVisual(x, y);
    if (!modoActual) return;

    try {
        if (modoActual === "via") {
            controladorCiudad.construirVia(x, y);
        } else {
            controladorCiudad.construirEdificio(modoActual, x, y);
        }

        const ciudadActualizada = controladorCiudad.obtenerCiudadActual();
        refrescarVista(ciudadActualizada);

    } catch (error) {
        mostrarNotificacion(error.message, "error");
    }
}

// ── Botones de construcción ───────────────────────────────────────
function configurarBotonesConstruccion() {
    const configuraciones = [
        { id: "btn-via",              modo: "via" },
        { id: "btn-casa",             modo: "casa" },
        { id: "btn-apartamento",      modo: "apartamento" },
        { id: "btn-tienda",           modo: "tienda" },
        { id: "btn-centro-comercial", modo: "centroComercial" },
        { id: "btn-fabrica",          modo: "fabrica" },
        { id: "btn-granja",           modo: "granja" },
        { id: "btn-policia",          modo: "policia" },
        { id: "btn-bomberos",         modo: "bomberos" },
        { id: "btn-hospital",         modo: "hospital" },
        { id: "btn-planta-electrica", modo: "electrica" },
        { id: "btn-planta-agua",      modo: "agua" },
        { id: "btn-parque",           modo: "parque" }
    ];

    configuraciones.forEach(({ id, modo }) => {
        const boton = document.getElementById(id);
        if (!boton) return;
        boton.addEventListener("click", () => {
            modoActual = modo;
            marcarBotonActivo(id);
            mostrarNotificacion(`Modo: ${modo}`, "info");
        });
    });

    const btnCancelar = document.getElementById("btn-cancelar-construccion");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            modoActual = null;
            limpiarBotonesActivos();
            mostrarNotificacion("Modo cancelado", "info");
        });
    }
}

function limpiarBotonesActivos() {
    document.querySelectorAll(".boton-construccion.activo")
        .forEach(btn => btn.classList.remove("activo"));
}

function marcarBotonActivo(idBoton) {
    limpiarBotonesActivos();
    const boton = document.getElementById(idBoton);
    if (boton) boton.classList.add("activo");
}

// ── Atajos de teclado (HU-024) ────────────────────────────────────
function configurarAtajosTeclado() {
    document.addEventListener("keydown", (e) => {
        // Ignorar si el foco está en un input
        if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

        switch (e.key.toUpperCase()) {
            case "B":
                document.querySelector(".panel-construccion")
                    ?.scrollIntoView({ behavior: "smooth" });
                break;
            case "R":
                modoActual = "via";
                marcarBotonActivo("btn-via");
                mostrarNotificacion("Modo: construir vía", "info");
                break;
            case "D":
                modoActual = "demoler";
                limpiarBotonesActivos();
                mostrarNotificacion("Modo: demolición", "advertencia");
                break;
            case "ESCAPE":
                modoActual = null;
                limpiarBotonesActivos();
                mostrarNotificacion("Modo cancelado", "info");
                break;
            case " ":
                e.preventDefault();
                if (controladorTurno.estaActivo()) {
                    controladorTurno.detener();
                    mostrarNotificacion("⏸ Juego pausado", "advertencia");
                } else {
                    controladorTurno.iniciar();
                    mostrarNotificacion("▶ Juego reanudado", "exito");
                }
                break;
            case "S":
                guardarPartidaManual();
                break;
        }
    });
}

// ── Guardado automático cada 30 segundos (HU-020) ─────────────────
function iniciarGuardadoAutomatico() {
    if (intervaloGuardado) clearInterval(intervaloGuardado);

    intervaloGuardado = setInterval(() => {
        const ciudad = controladorCiudad?.obtenerCiudadActual();
        if (ciudad) {
            CiudadStorage.guardar(ciudad);
            mostrarNotificacion("💾 Partida guardada", "info");
        }
    }, 30000);
}

function guardarPartidaManual() {
    const ciudad = controladorCiudad?.obtenerCiudadActual();
    if (ciudad) {
        CiudadStorage.guardar(ciudad);
        mostrarNotificacion("💾 Partida guardada manualmente", "exito");
    }
}

// ── Notificaciones ────────────────────────────────────────────────
function mostrarNotificacion(texto, tipo = "info") {
    let contenedor = document.getElementById("contenedor-notificaciones");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-notificaciones";
        document.body.appendChild(contenedor);
    }

    const notif = document.createElement("div");
    notif.className = `notificacion notificacion-${tipo}`;
    notif.textContent = texto;

    contenedor.appendChild(notif);

    setTimeout(() => notif.classList.add("visible"), 10);
    setTimeout(() => {
        notif.classList.remove("visible");
        setTimeout(() => notif.remove(), 400);
    }, 3000);
}

// ── Verificar fin de juego ────────────────────────────────────────
function manejarFinJuego(ciudad, motivo) {
    controladorTurno.detener();
    clearInterval(intervaloGuardado);

    const mensajes = {
        electricidad: "⚡ ¡Te quedaste sin electricidad! La ciudad colapsa.",
        agua:         "💧 ¡Te quedaste sin agua! La ciudad colapsa."
    };

    const mensaje = mensajes[motivo] || "La ciudad ha colapsado.";

    setTimeout(() => {
        alert(`${mensaje}\n\nPuntuación final: ${ciudad.puntuacion}\nTurnos jugados: ${ciudad.turnoActual}`);
        window.location.href = "../../index.html";
    }, 500);
}

// ── Inicializar vista del juego ───────────────────────────────────
function inicializarVistaJuego() {
    const ciudad = CiudadStorage.cargar();

    if (!ciudad) {
        alert("No hay una ciudad guardada. Primero debes crear una ciudad.");
        window.location.href = "../../index.html";
        return;
    }

    // Controladores
    controladorCiudad  = new ControladorCiudad();
    controladorJugador = new ControladorJugador();
    controladorCiudad.ciudad = ciudad;

    // Vincular jugador a ciudad
    controladorJugador.cargarJugador();
    controladorJugador.vincularCiudad(ciudad);

    // Leer configuración guardada en ciudad
    const config = ciudad.configuracion || {};
    const duracionTurno = (config.duracionTurno || 10) * 1000;

    // Renderizar vista inicial
    refrescarVista(ciudad);

    // Widgets externos
    renderWidgetClima(ciudad.region, ciudad.latitud, ciudad.longitud);
    renderWidgetNoticias("co");

    // Configurar interacciones
    configurarBotonesConstruccion();
    configurarAtajosTeclado();

    // Iniciar turno con duración configurada
    controladorTurno = new ControladorTurno((ciudadActualizada, estado) => {
        controladorCiudad.ciudad = ciudadActualizada;
        controladorJugador.actualizarTrasturno(ciudadActualizada);

        if (estado?.finJuego) {
            manejarFinJuego(ciudadActualizada, estado.motivo);
            return;
        }

        refrescarVista(ciudadActualizada);
    }, duracionTurno);

    controladorTurno.iniciar();

    // Guardado automático
    iniciarGuardadoAutomatico();
}

document.addEventListener("DOMContentLoaded", inicializarVistaJuego);
