import CiudadStorage from "../../acceso_datos/CiudadStorage.js";
import ControladorTurno from "../../negocio/ControladorTurno.js";
import ControladorCiudad from "../../negocio/ControladorCiudad.js";
import ControladorJugador from "../../negocio/ControladorJugador.js";
import { renderizarPanelRecursos } from "./panelRecursos.js";
import renderWidgetClima from "./widgetClima.js";
import { renderWidgetNoticias } from "./widgetNoticias.js";
import { MapaRenderer } from "./MapaRender.js";

// ── Estado global ─────────────────────────────────────────────
let mapaRenderer       = null;
let controladorCiudad  = null;
let controladorTurno   = null;
let controladorJugador = null;
let modoActual         = null;
let intervaloGuardado  = null;

// ── Renderizar datos generales ────────────────────────────────
function renderizarDatosCiudad(ciudad) {
    const nombreCiudad = document.getElementById("nombre-ciudad");
    const datosCiudad  = document.getElementById("datos-ciudad");

    if (nombreCiudad) nombreCiudad.textContent = `🏙️ ${ciudad.nombre}`;

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

// ── Renderizar mapa ───────────────────────────────────────────
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

// ── Refrescar toda la vista ───────────────────────────────────
function refrescarVista(ciudad) {
    renderizarDatosCiudad(ciudad);
    renderizarPanelRecursos(ciudad);
    renderizarMapa(ciudad);
}

// ── Clicks en el mapa ─────────────────────────────────────────
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

// ── Botones de construcción ───────────────────────────────────
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
            mostrarNotificacion(`🏗️ Modo: ${modo}`, "info");
        });
    });

    document.getElementById("btn-cancelar-construccion")
        ?.addEventListener("click", () => {
            modoActual = null;
            limpiarBotonesActivos();
            mostrarNotificacion("Modo cancelado", "info");
        });
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

// ── Panel configurables en tiempo real ───────────────────────
function configurarPanelConfigurables(ciudad) {
    const config = ciudad.configuracion || {};

    const poblar = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    poblar("cfg-turno",          config.duracionTurno         ?? 10);
    poblar("cfg-electricidad",   ciudad.recursos?.electricidad?.cantidad ?? 0);
    poblar("cfg-agua",           ciudad.recursos?.agua?.cantidad         ?? 0);
    poblar("cfg-alimentos",      ciudad.recursos?.alimentos?.cantidad    ?? 0);
    poblar("cfg-consumo-agua",   config.consumoAgua           ?? 1);
    poblar("cfg-consumo-elec",   config.consumoElectricidad   ?? 1);
    poblar("cfg-consumo-comida", config.consumoComida         ?? 1);

    document.getElementById("btn-aplicar-config")
        ?.addEventListener("click", () => {
            const c = controladorCiudad.obtenerCiudadActual();
            if (!c) return;

            const nuevoTurno = parseInt(document.getElementById("cfg-turno").value) || 10;

            c.configuracion = {
                duracionTurno:        nuevoTurno,
                tasaCrecimiento:      c.configuracion?.tasaCrecimiento ?? 2,
                consumoAgua:          parseFloat(document.getElementById("cfg-consumo-agua").value)   || 1,
                consumoElectricidad:  parseFloat(document.getElementById("cfg-consumo-elec").value)   || 1,
                consumoComida:        parseFloat(document.getElementById("cfg-consumo-comida").value) || 1,
            };

            c.recursos.electricidad.cantidad = parseInt(document.getElementById("cfg-electricidad").value) || 0;
            c.recursos.agua.cantidad         = parseInt(document.getElementById("cfg-agua").value)         || 0;
            c.recursos.alimentos.cantidad    = parseInt(document.getElementById("cfg-alimentos").value)    || 0;

            CiudadStorage.guardar(c);
            controladorTurno.reiniciar(nuevoTurno);
            mostrarNotificacion("⚙️ Configuración aplicada", "exito");
            refrescarVista(c);
        });
}

// ── Exportar ciudad a JSON ────────────────────────────────────
function configurarExportacion() {
    document.getElementById("btn-exportar-json")
        ?.addEventListener("click", () => {
            const ciudad = controladorCiudad.obtenerCiudadActual();
            if (!ciudad) return;

            const json   = JSON.stringify(ciudad.toJSON(), null, 2);
            const blob   = new Blob([json], { type: "application/json" });
            const url    = URL.createObjectURL(blob);
            const fecha  = new Date().toISOString().slice(0, 10);
            const enlace = document.createElement("a");
            enlace.href     = url;
            enlace.download = `ciudad_${ciudad.nombre}_${fecha}.json`;
            enlace.click();
            URL.revokeObjectURL(url);
            mostrarNotificacion("📤 Ciudad exportada correctamente", "exito");
        });

    document.getElementById("btn-guardar-manual")
        ?.addEventListener("click", () => guardarPartidaManual());
}

// ── Atajos de teclado ─────────────────────────────────────────
function configurarAtajosTeclado() {
    document.addEventListener("keydown", (e) => {
        if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

        switch (e.key.toUpperCase()) {
            case "B":
                document.querySelector(".panel-construccion")
                    ?.scrollIntoView({ behavior: "smooth" });
                mostrarNotificacion("🏗️ Menú de construcción", "info");
                break;
            case "R":
                modoActual = "via";
                marcarBotonActivo("btn-via");
                mostrarNotificacion("🛣️ Modo: construir vía", "info");
                break;
            case "D":
                modoActual = "demoler";
                limpiarBotonesActivos();
                mostrarNotificacion("🔨 Modo: demolición", "advertencia");
                break;
            case "ESCAPE":
                modoActual = null;
                limpiarBotonesActivos();
                mostrarNotificacion("✖ Modo cancelado", "info");
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

// ── Guardado automático cada 30 segundos ─────────────────────
function iniciarGuardadoAutomatico() {
    if (intervaloGuardado) clearInterval(intervaloGuardado);

    intervaloGuardado = setInterval(() => {
        const ciudad = controladorCiudad?.obtenerCiudadActual();
        if (ciudad) {
            CiudadStorage.guardar(ciudad);
            mostrarNotificacion("💾 Guardado automático", "info");
        }
    }, 30000);
}

function guardarPartidaManual() {
    const ciudad = controladorCiudad?.obtenerCiudadActual();
    if (ciudad) {
        CiudadStorage.guardar(ciudad);
        mostrarNotificacion("💾 Partida guardada", "exito");
    }
}

// ── Notificaciones ────────────────────────────────────────────
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

// ── Verificar fin de juego ────────────────────────────────────
function manejarFinJuego(ciudad, motivo) {
    controladorTurno.detener();
    clearInterval(intervaloGuardado);

    const mensajes = {
        electricidad: "⚡ ¡Sin electricidad! La ciudad colapsa.",
        agua:         "💧 ¡Sin agua! La ciudad colapsa."
    };

    setTimeout(() => {
        alert(
            `${mensajes[motivo] || "La ciudad colapsó."}\n\n` +
            `Puntuación final: ${ciudad.puntuacion}\n` +
            `Turnos jugados: ${ciudad.turnoActual}`
        );
        window.location.href = "../../index.html";
    }, 500);
}

// ── Inicializar vista del juego ───────────────────────────────
function inicializarVistaJuego() {
    const ciudad = CiudadStorage.cargar();

    if (!ciudad) {
        alert("No hay ciudad guardada. Crea una primero.");
        window.location.href = "../../index.html";
        return;
    }

    controladorCiudad  = new ControladorCiudad();
    controladorJugador = new ControladorJugador();
    controladorCiudad.ciudad = ciudad;

    controladorJugador.cargarJugador();
    controladorJugador.vincularCiudad(ciudad);

    const duracionTurno = (ciudad.configuracion?.duracionTurno ?? 10) * 1000;

    // Renderizar vista inicial
    refrescarVista(ciudad);

    // Widgets externos
    renderWidgetClima(ciudad.region, ciudad.latitud, ciudad.longitud);
    renderWidgetNoticias("co");

    // Configurar interacciones
    configurarBotonesConstruccion();
    configurarPanelConfigurables(ciudad);
    configurarAtajosTeclado();
    configurarExportacion();

    // Iniciar turnos
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
