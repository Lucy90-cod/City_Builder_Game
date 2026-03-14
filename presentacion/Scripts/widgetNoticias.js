import { NoticiasService } from "../../negocio/Servicios/NoticiasService.js";

const TIEMPO_ACTUALIZACION = 30 * 60 * 1000;
const API_KEY_NOTICIAS = "8b1d2bfadc6745dda6085a04a20f302c";

function renderCargando(contenedor) {
    contenedor.innerHTML = `
        <div class="noticias-cargando">
            <p>📰 Cargando noticias...</p>
        </div>
    `;
}

function renderError(contenedor) {
    contenedor.innerHTML = `
        <div class="noticias-error">
            <p>No fue posible cargar las noticias.</p>
        </div>
    `;
}

function renderNoticias(contenedor, noticias) {
    if (!noticias || noticias.length === 0) {
        renderError(contenedor);
        return;
    }

    const items = noticias.map(noticia => `
        <article class="noticia-item">
            ${noticia.imagen
                ? `<img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-imagen" onerror="this.style.display='none'">`
                : ""
            }
            <div class="noticia-contenido">
                <h4 class="noticia-titulo">
                    <a href="${noticia.url}" target="_blank" rel="noopener noreferrer">
                        ${noticia.titulo}
                    </a>
                </h4>
                <span class="noticia-fuente">📌 ${noticia.fuente}</span>
            </div>
        </article>
    `).join("");

    contenedor.innerHTML = `
        <div class="noticias-lista">
            ${items}
        </div>
        <p class="noticias-timestamp">Actualizado: ${new Date().toLocaleTimeString("es-CO")}</p>
    `;
}

export function renderWidgetNoticias(codigoPais = "co") {
    const contenedor = document.getElementById("widget-noticias");
    if (!contenedor) return;

    NoticiasService.setApiKey(API_KEY_NOTICIAS);

    async function cargarNoticias() {
        renderCargando(contenedor);
        try {
            const noticias = await NoticiasService.getNoticias(codigoPais);
            renderNoticias(contenedor, noticias);
        } catch (error) {
            console.error("widgetNoticias:", error);
            renderError(contenedor);
        }
    }

    cargarNoticias();
    setInterval(cargarNoticias, TIEMPO_ACTUALIZACION);
}
