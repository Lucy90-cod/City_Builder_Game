import CiudadStorage from "../../acceso_datos/CiudadStorage.js";
import { renderizarPanelRecursos } from "./panelRecursos.js";
import renderWidgetClima from "./widgetClima.js";

function inicializarVistaJuego() {
    const ciudad = CiudadStorage.cargar();

    if (!ciudad) {
        alert("No hay una ciudad guardada. Primero debes crear una ciudad.");
        window.location.href = "../../index.html";
        return;
    }

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

    renderizarPanelRecursos(ciudad);
    renderWidgetClima(ciudad.region, ciudad.latitud, ciudad.longitud);
}

document.addEventListener("DOMContentLoaded", inicializarVistaJuego);
