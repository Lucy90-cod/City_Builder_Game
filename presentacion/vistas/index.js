import ControladorCiudad from "../../negocio/ControladorCiudad.js";

const formulario = document.getElementById("formCrearCiudad");
const mensaje = document.getElementById("mensaje");

const controladorCiudad = new ControladorCiudad();

if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const datosFormulario = {
            nombre: document.getElementById("nombreCiudad").value,
            alcalde: document.getElementById("nombreAlcalde").value,
            region: document.getElementById("region").value,
            ancho: document.getElementById("anchoMapa").value,
            alto: document.getElementById("altoMapa").value
        };

        try {
            const ciudad = controladorCiudad.crearCiudad(datosFormulario);

            mensaje.textContent = `Ciudad "${ciudad.nombre}" creada correctamente.`;
            mensaje.style.color = "green";

            console.log("Ciudad creada:", ciudad);
        } catch (error) {
            mensaje.textContent = error.message;
            mensaje.style.color = "red";
        }
    });
}
