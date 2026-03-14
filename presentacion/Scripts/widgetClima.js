import { ClimaService } from "../../negocio/Servicios/ClimaService.js";

const TIEMPO_ACTUALIZACION = 30 * 60 * 1000;

function renderCargando(contenedor, region) {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <p class="clima-region">📍 ${region}</p>
            <p class="clima-cargando">Cargando clima...</p>
        </div>
    `;
}

function renderError(contenedor, region, mensaje) {
    contenedor.innerHTML = `
        <div class="tarjeta-clima clima-error">
            <p class="clima-region">📍 ${region}</p>
            <p>${mensaje}</p>
        </div>
    `;
}

function renderClima(contenedor, region, clima) {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <p class="clima-region">📍 ${region}</p>
            <div class="clima-principal">
                <img src="${clima.icono}"
                     alt="${clima.descripcion}"
                     class="clima-icono">
                <span class="clima-temperatura">${clima.temperatura}°C</span>
            </div>
            <p class="clima-descripcion">${clima.descripcion}</p>
            <div class="clima-detalles">
                <span>💧 Humedad: ${clima.humedad}%</span>
                <span>💨 Viento: ${clima.viento} km/h</span>
            </div>
        </div>
    `;
}

export default function renderWidgetClima(region, latitud, longitud) {
    const contenedor = document.getElementById("widget-clima");
    if (!contenedor) return;

    async function cargarClima() {
        renderCargando(contenedor, region);

        if (latitud == null || longitud == null) {
            renderError(contenedor, region, "Faltan coordenadas.");
            return;
        }

        try {
            const clima = await ClimaService.getClima(latitud, longitud);
            renderClima(contenedor, region, clima);
        } catch (error) {
            console.error("widgetClima:", error);
            renderError(contenedor, region, "No fue posible cargar el clima.");
        }
    }

    cargarClima();
    setInterval(cargarClima, TIEMPO_ACTUALIZACION);
}
