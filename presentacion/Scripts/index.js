import ControladorCiudad from "../../negocio/ControladorCiudad.js";
import { ColombiaService } from "../../negocio/Servicios/ColombiaService.js";
import CiudadStorage from "../../acceso_datos/CiudadStorage.js";

const controladorCiudad = new ControladorCiudad();

// ── Elementos del DOM ────────────────────────────────────────
const formulario         = document.getElementById("formCrearCiudad");
const mensaje            = document.getElementById("mensaje");
const btnCrear           = document.getElementById("btn-crear");
const selectDepartamento = document.getElementById("selectDepartamento");
const selectMunicipio    = document.getElementById("selectMunicipio");
const latDisplay         = document.getElementById("lat-display");
const lonDisplay         = document.getElementById("lon-display");
const inputRegion        = document.getElementById("region");
const inputLatitud       = document.getElementById("latitud");
const inputLongitud      = document.getElementById("longitud");
const modalContinuar     = document.getElementById("modal-continuar");
const modalInfo          = document.getElementById("modal-info-partida");
const btnContinuar       = document.getElementById("btn-continuar-partida");
const btnNueva           = document.getElementById("btn-nueva-partida");
const inputArchivo       = document.getElementById("inputArchivoMapa");
const areaArchivo        = document.getElementById("carga-archivo-area");
const estadoArchivo      = document.getElementById("estado-archivo");
const previewMapa        = document.getElementById("preview-mapa");
const previewGrid        = document.getElementById("preview-grid");
const inputAncho         = document.getElementById("anchoMapa");
const inputAlto          = document.getElementById("altoMapa");

// ── Estado del mapa cargado ──────────────────────────────────
let mapaDesdeArchivo = null;

// ── Coordenadas por municipio ────────────────────────────────
const coordenadasMunicipios = {
    "Manizales":    { lat: 5.0703,  lon: -75.5138 },
    "Bogotá":       { lat: 4.7110,  lon: -74.0721 },
    "Medellín":     { lat: 6.2518,  lon: -75.5636 },
    "Cali":         { lat: 3.4516,  lon: -76.5320 },
    "Barranquilla": { lat: 10.9685, lon: -74.7813 },
    "Cartagena":    { lat: 10.3910, lon: -75.4794 },
    "Pereira":      { lat: 4.8143,  lon: -75.6946 },
    "Bucaramanga":  { lat: 7.1193,  lon: -73.1227 },
    "Santa Marta":  { lat: 11.2408, lon: -74.1990 },
    "Cúcuta":       { lat: 7.8939,  lon: -72.5078 },
};

// ── Convenciones del mapa ────────────────────────────────────
const CONVENCIONES = new Set([
    "g", "r",
    "R1", "R2",
    "C1", "C2",
    "I1", "I2",
    "S1", "S2", "S3",
    "U1", "U2",
    "P1"
]);

const COLORES_CELDA = {
    g:  "#4a7c59",
    r:  "#8b7355",
    R1: "#4fc3f7", R2: "#0288d1",
    C1: "#ffb74d", C2: "#f57c00",
    I1: "#ef9a9a", I2: "#e53935",
    S1: "#ce93d8", S2: "#ab47bc", S3: "#7b1fa2",
    U1: "#fff176", U2: "#fdd835",
    P1: "#81c784"
};

// ── Detectar partida guardada ────────────────────────────────
function verificarPartidaGuardada() {
    if (!CiudadStorage.existe()) return;
    const ciudad = CiudadStorage.cargar();
    if (!ciudad) return;

    modalInfo.textContent =
        `Ciudad: "${ciudad.nombre}" | Alcalde: ${ciudad.alcalde} | ` +
        `Turno: ${ciudad.turnoActual} | Puntuación: ${ciudad.puntuacion}`;
    modalContinuar.classList.remove("oculto");
}

btnContinuar.addEventListener("click", () => {
    window.location.href = "./presentacion/vistas/juego.html";
});

btnNueva.addEventListener("click", () => {
    CiudadStorage.eliminar();
    modalContinuar.classList.add("oculto");
});

// ── Cargar departamentos ─────────────────────────────────────
async function cargarDepartamentos() {
    const departamentos = await ColombiaService.getDepartamentos();
    selectDepartamento.innerHTML =
        `<option value="">-- Selecciona un departamento --</option>`;

    departamentos.forEach(dep => {
        const opt = document.createElement("option");
        opt.value = dep.id;
        opt.textContent = dep.nombre;
        selectDepartamento.appendChild(opt);
    });
}

// ── Cargar municipios ────────────────────────────────────────
selectDepartamento.addEventListener("change", async () => {
    const depId = selectDepartamento.value;
    selectMunicipio.innerHTML =
        `<option value="">-- Cargando municipios... --</option>`;
    selectMunicipio.disabled = true;
    limpiarCoordenadas();
    btnCrear.disabled = true;

    if (!depId) {
        selectMunicipio.innerHTML =
            `<option value="">-- Selecciona un departamento primero --</option>`;
        return;
    }

    const municipios = await ColombiaService.getMunicipios(depId);
    selectMunicipio.innerHTML =
        `<option value="">-- Selecciona un municipio --</option>`;

    municipios.forEach(mun => {
        const opt = document.createElement("option");
        opt.value = mun.nombre;
        opt.textContent = mun.nombre;
        selectMunicipio.appendChild(opt);
    });

    selectMunicipio.disabled = false;
});

// ── Asignar coordenadas al seleccionar municipio ─────────────
selectMunicipio.addEventListener("change", () => {
    const nombre = selectMunicipio.value;
    if (!nombre) {
        limpiarCoordenadas();
        btnCrear.disabled = true;
        return;
    }

    const coords = coordenadasMunicipios[nombre] ?? { lat: 4.5709, lon: -74.2973 };
    inputLatitud.value  = coords.lat;
    inputLongitud.value = coords.lon;
    inputRegion.value   = nombre;
    latDisplay.textContent = `Lat: ${coords.lat}`;
    lonDisplay.textContent = `Lon: ${coords.lon}`;

    // Habilitar botón solo si el municipio está seleccionado
    btnCrear.disabled = false;
});

function limpiarCoordenadas() {
    inputLatitud.value  = "";
    inputLongitud.value = "";
    inputRegion.value   = "";
    latDisplay.textContent = "Lat: --";
    lonDisplay.textContent = "Lon: --";
}

// ── Carga de archivo .txt ────────────────────────────────────

// Click en el área de carga
areaArchivo.addEventListener("click", () => inputArchivo.click());

// Drag & Drop
areaArchivo.addEventListener("dragover", (e) => {
    e.preventDefault();
    areaArchivo.classList.add("arrastrando");
});

areaArchivo.addEventListener("dragleave", () => {
    areaArchivo.classList.remove("arrastrando");
});

areaArchivo.addEventListener("drop", (e) => {
    e.preventDefault();
    areaArchivo.classList.remove("arrastrando");
    const archivo = e.dataTransfer.files[0];
    if (archivo) procesarArchivo(archivo);
});

// Selección por input
inputArchivo.addEventListener("change", () => {
    const archivo = inputArchivo.files[0];
    if (archivo) procesarArchivo(archivo);
});

function procesarArchivo(archivo) {
    if (!archivo.name.endsWith(".txt")) {
        mostrarEstadoArchivo("❌ Solo se aceptan archivos .txt", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const contenido = e.target.result;
        try {
            const resultado = parsearMapa(contenido);
            mapaDesdeArchivo = resultado.mapa;

            // Actualizar dimensiones automáticamente
            inputAncho.value = resultado.ancho;
            inputAlto.value  = resultado.alto;

            mostrarEstadoArchivo(
                `✅ Mapa cargado: ${resultado.ancho}×${resultado.alto} | ` +
                `Edificios: ${resultado.totalEdificios} | Vías: ${resultado.totalVias}`,
                "exito"
            );

            renderizarPreviewMapa(resultado.mapa, resultado.ancho, resultado.alto);

        } catch (error) {
            mapaDesdeArchivo = null;
            mostrarEstadoArchivo(`❌ Error: ${error.message}`, "error");
            previewMapa.classList.add("oculto");
        }
    };

    reader.readAsText(archivo);
}

function parsearMapa(contenido) {
    const lineas = contenido
        .trim()
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

    if (lineas.length === 0) {
        throw new Error("El archivo está vacío");
    }

    const alto  = lineas.length;
    const filas = lineas.map((linea, indexFila) => {
        const celdas = linea.split(/\s+/);
        return celdas.map((celda, indexCol) => {
            if (!CONVENCIONES.has(celda)) {
                throw new Error(
                    `Valor inválido "${celda}" en fila ${indexFila + 1}, columna ${indexCol + 1}. ` +
                    `Valores válidos: ${Array.from(CONVENCIONES).join(", ")}`
                );
            }
            return celda;
        });
    });

    // Verificar que todas las filas tengan el mismo ancho
    const ancho = filas[0].length;
    filas.forEach((fila, i) => {
        if (fila.length !== ancho) {
            throw new Error(
                `La fila ${i + 1} tiene ${fila.length} columnas, ` +
                `pero se esperaban ${ancho}`
            );
        }
    });

    // Validar dimensiones
    if (ancho < 15 || ancho > 30) {
        throw new Error(`El ancho del mapa debe estar entre 15 y 30 (actual: ${ancho})`);
    }

    if (alto < 15 || alto > 30) {
        throw new Error(`El alto del mapa debe estar entre 15 y 30 (actual: ${alto})`);
    }

    // Contar elementos
    let totalEdificios = 0;
    let totalVias      = 0;

    filas.forEach(fila => {
        fila.forEach(celda => {
            if (celda === "r") totalVias++;
            else if (celda !== "g") totalEdificios++;
        });
    });

    return { mapa: filas, ancho, alto, totalEdificios, totalVias };
}

function renderizarPreviewMapa(mapa, ancho, alto) {
    previewGrid.innerHTML = "";
    previewGrid.style.gridTemplateColumns = `repeat(${ancho}, 1fr)`;

    mapa.forEach(fila => {
        fila.forEach(celda => {
            const div = document.createElement("div");
            div.className    = "preview-celda";
            div.title        = celda;
            div.style.background = COLORES_CELDA[celda] ?? "#555";
            previewGrid.appendChild(div);
        });
    });

    previewMapa.classList.remove("oculto");
}

function mostrarEstadoArchivo(texto, tipo) {
    estadoArchivo.textContent = texto;
    estadoArchivo.className   = `campo-ayuda estado-archivo-${tipo}`;
}

// ── Submit del formulario ────────────────────────────────────
formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    mostrarMensaje("", "");

    const datos = {
        nombre:              document.getElementById("nombreCiudad").value.trim(),
        alcalde:             document.getElementById("nombreAlcalde").value.trim(),
        region:              inputRegion.value.trim(),
        latitud:             parseFloat(inputLatitud.value),
        longitud:            parseFloat(inputLongitud.value),
        ancho:               parseInt(inputAncho.value),
        alto:                parseInt(inputAlto.value),
        duracionTurno:       parseInt(document.getElementById("duracionTurno").value)       || 10,
        tasaCrecimiento:     parseInt(document.getElementById("tasaCrecimiento").value)     || 2,
        electricidadInicial: parseInt(document.getElementById("electricidadInicial").value) || 0,
        aguaInicial:         parseInt(document.getElementById("aguaInicial").value)         || 0,
        alimentosInicial:    parseInt(document.getElementById("alimentosInicial").value)    || 0,
        consumoAgua:         parseFloat(document.getElementById("consumoAgua").value)       || 1,
        consumoElectricidad: parseFloat(document.getElementById("consumoElectricidad").value) || 1,
        consumoComida:       parseFloat(document.getElementById("consumoComida").value)     || 1,
    };

    try {
        const ciudad = controladorCiudad.crearCiudad(datos);

        // Aplicar recursos iniciales configurables
        ciudad.recursos.electricidad.cantidad = datos.electricidadInicial;
        ciudad.recursos.agua.cantidad         = datos.aguaInicial;
        ciudad.recursos.alimentos.cantidad    = datos.alimentosInicial;

        // Guardar configuración
        ciudad.configuracion = {
            duracionTurno:        datos.duracionTurno,
            tasaCrecimiento:      datos.tasaCrecimiento,
            consumoAgua:          datos.consumoAgua,
            consumoElectricidad:  datos.consumoElectricidad,
            consumoComida:        datos.consumoComida,
        };

        // Si hay mapa cargado desde archivo, guardarlo en la ciudad
        if (mapaDesdeArchivo) {
            ciudad.mapaInicial = mapaDesdeArchivo;
        }

        CiudadStorage.guardar(ciudad);

        mostrarMensaje(
            `✅ Ciudad "${ciudad.nombre}" creada correctamente. Redirigiendo...`,
            "exito"
        );

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

// ── Inicializar ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    verificarPartidaGuardada();
    cargarDepartamentos();
});
