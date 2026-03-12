const TIEMPO_ACTUALIZACION_CLIMA = 30 * 60 * 1000;
const API_KEY = "c6b1a6cf379dda5f9ff2cc7fbbc65acc";


function renderCargando(contenedor, region) {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <h3>Clima</h3>
            <p><strong>Región:</strong> ${region}</p>
            <p>Cargando información climática...</p>
        </div>
    `;
}

function renderError(contenedor, region, mensaje = "No fue posible cargar el clima.") {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <h3>Clima</h3>
            <p><strong>Región:</strong> ${region}</p>
            <p>${mensaje}</p>
        </div>
    `;
}

function renderClima(contenedor, region, clima) {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <h3>Clima</h3>
            <p><strong>Región:</strong> ${region}</p>
            <p><strong>Temperatura:</strong> ${clima.temperatura} °C</p>
            <p><strong>Condición:</strong> ${clima.condicion}</p>
            <p><strong>Humedad:</strong> ${clima.humedad}%</p>
            <p><strong>Viento:</strong> ${clima.viento} km/h</p>
        </div>
    `;
}

async function obtenerClima(latitud, longitud) {
    if (!API_KEY || API_KEY === "TU_API_KEY") {
        throw new Error("Debes configurar una API key válida de OpenWeatherMap.");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitud}&lon=${longitud}&appid=${API_KEY}&units=metric&lang=es`;

    const respuesta = await fetch(url);

    if (respuesta.status === 401) {
        throw new Error("La API key de OpenWeatherMap no es válida.");
    }

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el clima.");
    }

    const data = await respuesta.json();

    return {
        temperatura: Math.round(data.main.temp),
        condicion: data.weather[0].description,
        humedad: data.main.humidity,
        viento: Math.round(data.wind.speed * 3.6)
    };
}


export default function renderWidgetClima(region, latitud, longitud) {
    const contenedor = document.getElementById("widget-clima");

    if (!contenedor) return;

    async function cargarClima() {
        try {
            renderCargando(contenedor, region);

            if (latitud == null || longitud == null) {
                throw new Error("Faltan coordenadas para consultar el clima.");
            }

            const clima = await obtenerClima(latitud, longitud);
            renderClima(contenedor, region, clima);
        } catch (error) {
            renderError(contenedor, region, error.message);
            console.error(error);
        }
    }

    cargarClima();
    setInterval(cargarClima, TIEMPO_ACTUALIZACION_CLIMA);
}
