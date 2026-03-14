function obtenerClaseDinero(valor) {
    if (valor >= 10000) return "alto";
    if (valor >= 5000) return "medio";
    return "bajo";
}

function formatearBalance(balance) {
    return balance >= 0 ? `+${balance}` : `${balance}`;
}

export function renderizarPanelRecursos(ciudad) {
    const contenedor = document.getElementById("panel-recursos");

    if (!contenedor) {
        return;
    }

    const dinero = ciudad.recursos?.dinero?.cantidad ?? 0;

    const electricidad = ciudad.recursos?.electricidad?.cantidad ?? 0;
    const electricidadProduccion = ciudad.recursos?.electricidad?.produccion ?? 0;
    const electricidadConsumo = ciudad.recursos?.electricidad?.consumo ?? 0;
    const electricidadBalance =
        (ciudad.recursos?.electricidad?.calcularBalance?.() ??
        (electricidadProduccion - electricidadConsumo));

    const agua = ciudad.recursos?.agua?.cantidad ?? 0;
    const aguaProduccion = ciudad.recursos?.agua?.produccion ?? 0;
    const aguaConsumo = ciudad.recursos?.agua?.consumo ?? 0;
    const aguaBalance =
        (ciudad.recursos?.agua?.calcularBalance?.() ??
        (aguaProduccion - aguaConsumo));

    const alimentos = ciudad.recursos?.alimentos?.cantidad ?? 0;
    const poblacion = ciudad.poblacion ?? 0;
    const felicidad = ciudad.felicidadPromedio ?? 0;

    const claseDinero = obtenerClaseDinero(dinero);

    contenedor.innerHTML = `
        <div class="recurso-card dinero ${claseDinero}">
            <h3>Dinero</h3>
            <p>$${dinero}</p>
        </div>

        <div class="recurso-card electricidad">
            <h3>Electricidad</h3>
            <p>${electricidad} u/t</p>
            <small>Prod: ${electricidadProduccion} | Cons: ${electricidadConsumo}</small>
            <small>Balance: ${formatearBalance(electricidadBalance)}</small>
        </div>

        <div class="recurso-card agua">
            <h3>Agua</h3>
            <p>${agua} u/t</p>
            <small>Prod: ${aguaProduccion} | Cons: ${aguaConsumo}</small>
            <small>Balance: ${formatearBalance(aguaBalance)}</small>
        </div>

        <div class="recurso-card alimentos">
            <h3>Alimentos</h3>
            <p>${alimentos} u</p>
        </div>

        <div class="recurso-card poblacion">
            <h3>Población</h3>
            <p>${poblacion}</p>
        </div>

        <div class="recurso-card felicidad">
            <h3>Felicidad promedio</h3>
            <p>${felicidad}%</p>
        </div>
    `;
}
