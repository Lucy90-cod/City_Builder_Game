import CiudadStorage from "../../acceso_datos/CiudadStorage.js";

function cargarDatosCiudad() {
    const ciudad = CiudadStorage.cargar();
    if (!ciudad) {
        window.location.href = "../../index.html";
        return;
    }

    document.getElementById("ciudad-nombre").textContent      = `🏙️ ${ciudad.nombre}`;
    document.getElementById("ciudad-alcalde").textContent     = `Alcalde: ${ciudad.alcalde}`;
    document.getElementById("ciudad-region").textContent      = ciudad.region ?? "--";
    document.getElementById("ciudad-tamano").textContent      = `${ciudad.ancho} × ${ciudad.alto}`;
    document.getElementById("ciudad-turno").textContent       = ciudad.turnoActual;
    document.getElementById("ciudad-puntuacion").textContent  = ciudad.puntuacion;
    document.getElementById("ciudad-poblacion").textContent   = ciudad.poblacion;
    document.getElementById("ciudad-felicidad").textContent   = `${Math.round(ciudad.felicidadPromedio ?? 0)}%`;

    renderizarRecursos(ciudad);
    cargarParametros(ciudad);
}

function renderizarRecursos(ciudad) {
    const contenedor = document.getElementById("ciudad-recursos");
    if (!contenedor) return;

    const recursos = [
        { nombre: "Dinero",       icono: "💰", valor: `$${ciudad.recursos?.dinero?.cantidad ?? 0}` },
        { nombre: "Electricidad", icono: "⚡", valor: `${ciudad.recursos?.electricidad?.cantidad ?? 0} u/t` },
        { nombre: "Agua",         icono: "💧", valor: `${ciudad.recursos?.agua?.cantidad ?? 0} u/t` },
        { nombre: "Alimentos",    icono: "🌾", valor: `${ciudad.recursos?.alimentos?.cantidad ?? 0} u` },
    ];

    contenedor.innerHTML = recursos.map(r => `
        <div class="recurso-resumen-card">
            <span class="recurso-icono">${r.icono}</span>
            <div>
                <h4>${r.nombre}</h4>
                <p>${r.valor}</p>
            </div>
        </div>
    `).join("");
}

function cargarParametros(ciudad) {
    const config = ciudad.configuracion || {};
    document.getElementById("param-turno").value          = config.duracionTurno      ?? 10;
    document.getElementById("param-crecimiento").value    = config.tasaCrecimiento    ?? 2;
    document.getElementById("param-electricidad").value   = ciudad.recursos?.electricidad?.cantidad ?? 0;
    document.getElementById("param-agua").value           = ciudad.recursos?.agua?.cantidad         ?? 0;
    document.getElementById("param-alimentos").value      = ciudad.recursos?.alimentos?.cantidad    ?? 0;
    document.getElementById("param-consumo-agua").value   = config.consumoAgua        ?? 1;
    document.getElementById("param-consumo-elec").value   = config.consumoElectricidad ?? 1;
    document.getElementById("param-consumo-comida").value = config.consumoComida      ?? 1;
}

// ── Guardar parámetros modificados ───────────────────────────────
document.getElementById("btn-guardar-params").addEventListener("click", () => {
    const ciudad = CiudadStorage.cargar();
    if (!ciudad) return;

    ciudad.configuracion = {
        duracionTurno:        parseInt(document.getElementById("param-turno").value)          || 10,
        tasaCrecimiento:      parseInt(document.getElementById("param-crecimiento").value)    || 2,
        consumoAgua:          parseFloat(document.getElementById("param-consumo-agua").value) || 1,
        consumoElectricidad:  parseFloat(document.getElementById("param-consumo-elec").value) || 1,
        consumoComida:        parseFloat(document.getElementById("param-consumo-comida").value) || 1,
    };

    ciudad.recursos.electricidad.cantidad = parseInt(document.getElementById("param-electricidad").value) || 0;
    ciudad.recursos.agua.cantidad         = parseInt(document.getElementById("param-agua").value)         || 0;
    ciudad.recursos.alimentos.cantidad    = parseInt(document.getElementById("param-alimentos").value)    || 0;

    CiudadStorage.guardar(ciudad);

    const msg = document.getElementById("mensaje-params");
    msg.textContent = "✅ Parámetros guardados correctamente.";
    msg.className   = "mensaje exito";
    setTimeout(() => { msg.textContent = ""; msg.className = "mensaje"; }, 3000);
});

// ── Botones de navegación y acciones ─────────────────────────────
document.getElementById("btn-jugar").addEventListener("click", () => {
    window.location.href = "./juego.html";
});

document.getElementById("btn-exportar").addEventListener("click", () => {
    const ciudad = CiudadStorage.cargar();
    if (!ciudad) return;

    const json     = JSON.stringify(ciudad.toJSON(), null, 2);
    const blob     = new Blob([json], { type: "application/json" });
    const url      = URL.createObjectURL(blob);
    const fecha    = new Date().toISOString().slice(0, 10);
    const enlace   = document.createElement("a");
    enlace.href     = url;
    enlace.download = `ciudad_${ciudad.nombre}_${fecha}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
});

document.getElementById("btn-eliminar").addEventListener("click", () => {
    document.getElementById("modal-eliminar").classList.remove("oculto");
});

document.getElementById("btn-cancelar-eliminar").addEventListener("click", () => {
    document.getElementById("modal-eliminar").classList.add("oculto");
});

document.getElementById("btn-confirmar-eliminar").addEventListener("click", () => {
    CiudadStorage.eliminar();
    window.location.href = "../../index.html";
});

document.addEventListener("DOMContentLoaded", cargarDatosCiudad);
