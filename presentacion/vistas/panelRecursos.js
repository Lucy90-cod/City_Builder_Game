export function renderizarPanelRecursos(ciudad) {
    const contenedor = document.getElementById("panel-recursos");

    if (!contenedor) {
        return;
    }

    const dinero = ciudad.recursos?.dinero?.cantidad ?? 0;
    const electricidad = ciudad.recursos?.electricidad?.cantidad ?? 0;
    const agua = ciudad.recursos?.agua?.cantidad ?? 0;
    const alimentos = ciudad.recursos?.alimentos?.cantidad ?? 0;
    const poblacion = ciudad.poblacion ?? 0;
    const felicidad = ciudad.felicidadPromedio ?? 0;

    contenedor.innerHTML = `
        <div class="recurso-card dinero">
            <h3>Dinero</h3>
            <p>$${dinero}</p>
        </div>

        <div class="recurso-card electricidad">
            <h3>Electricidad</h3>
            <p>${electricidad}</p>
        </div>

        <div class="recurso-card agua">
            <h3>Agua</h3>
            <p>${agua}</p>
        </div>

        <div class="recurso-card alimentos">
            <h3>Alimentos</h3>
            <p>${alimentos}</p>
        </div>

        <div class="recurso-card poblacion">
            <h3>Población</h3>
            <p>${poblacion}</p>
        </div>

        <div class="recurso-card felicidad">
            <h3>Felicidad promedio</h3>
            <p>${felicidad}</p>
        </div>
    `;
}
