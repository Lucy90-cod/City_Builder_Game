import ControladorCiudad from "../../negocio/ControladorCiudad.js";

const formulario = document.getElementById("formCrearCiudad");
const mensaje = document.getElementById("mensaje");

const controladorCiudad = new ControladorCiudad();

if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const datosFormulario = {
            nombre: document.getElementById("nombreCiudad").value.trim(),
            alcalde: document.getElementById("nombreAlcalde").value.trim(),
            region: document.getElementById("region").value.trim(),
            latitud: parseFloat(document.getElementById("latitud").value),
            longitud: parseFloat(document.getElementById("longitud").value),
            ancho: parseInt(document.getElementById("anchoMapa").value),
            alto: parseInt(document.getElementById("altoMapa").value)
        };

        try {
            const ciudad = controladorCiudad.crearCiudad(datosFormulario);

            mensaje.textContent = `Ciudad "${ciudad.nombre}" creada correctamente.`;
            mensaje.style.color = "green";

            console.log("Ciudad creada:", ciudad);

            setTimeout(() => {
                window.location.href = "./presentacion/vistas/juego.html";
            }, 1000);

        } catch (error) {
            mensaje.textContent = error.message;
            mensaje.style.color = "red";
        }
    });
}

