function obtenerClaseValor(valor, umbralAlto, umbralMedio) {
    if (valor >= umbralAlto) return "alto";
    if (valor >= umbralMedio) return "medio";
    return "bajo";
}

function formatearBalance(balance) {
    if (balance > 0) return `<span class="balance-positivo">+${balance}</span>`;
    if (balance < 0) return `<span class="balance-negativo">${balance}</span>`;
    return `<span class="balance-neutro">0</span>`;
}

function formatearDinero(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

function crearTooltip(produccion, consumo, balance) {
    return `Producción: ${produccion} | Consumo: ${consumo} | Balance: ${balance > 0 ? "+" : ""}${balance}`;
}

export function renderizarPanelRecursos(ciudad) {
    const contenedor = document.getElementById("panel-recursos");
    if (!contenedor) return;

    const dinero               = ciudad.recursos?.dinero?.cantidad ?? 0;
    const electricidad         = ciudad.recursos?.electricidad?.cantidad ?? 0;
    const electricidadProd     = ciudad.recursos?.electricidad?.produccion ?? 0;
    const electricidadCons     = ciudad.recursos?.electricidad?.consumo ?? 0;
    const electricidadBalance  = ciudad.recursos?.electricidad?.calcularBalance?.() ?? (electricidadProd - electricidadCons);
    const agua                 = ciudad.recursos?.agua?.cantidad ?? 0;
    const aguaProd             = ciudad.recursos?.agua?.produccion ?? 0;
    const aguaCons             = ciudad.recursos?.agua?.consumo ?? 0;
    const aguaBalance          = ciudad.recursos?.agua?.calcularBalance?.() ?? (aguaProd - aguaCons);
    const alimentos            = ciudad.recursos?.alimentos?.cantidad ?? 0;
    const alimentosProd        = ciudad.recursos?.alimentos?.produccion ?? 0;
    const alimentosCons        = ciudad.recursos?.alimentos?.consumo ?? 0;
    const poblacion            = ciudad.poblacion ?? 0;
    const felicidad            = Math.round(ciudad.felicidadPromedio ?? 0);

    const claseDinero          = obtenerClaseValor(dinero, 10000, 5000);
    const claseElectricidad    = electricidadBalance >= 0 ? "alto" : "bajo";
    const claseAgua            = aguaBalance >= 0 ? "alto" : "bajo";
    const claseFelicidad       = obtenerClaseValor(felicidad, 80, 50);

    contenedor.innerHTML = `

        <div class="recurso-card dinero ${claseDinero}"
             title="${crearTooltip(ciudad.recursos?.dinero?.produccion ?? 0, ciudad.recursos?.dinero?.consumo ?? 0, (ciudad.recursos?.dinero?.produccion ?? 0) - (ciudad.recursos?.dinero?.consumo ?? 0))}">
            <div class="recurso-header">
                <span class="recurso-icono">💰</span>
                <h3>Dinero</h3>
            </div>
            <p class="recurso-valor">${formatearDinero(dinero)}</p>
            <small class="recurso-detalle">
                ${formatearBalance((ciudad.recursos?.dinero?.produccion ?? 0) - (ciudad.recursos?.dinero?.consumo ?? 0))} /turno
            </small>
        </div>

        <div class="recurso-card electricidad ${claseElectricidad}"
             title="${crearTooltip(electricidadProd, electricidadCons, electricidadBalance)}">
            <div class="recurso-header">
                <span class="recurso-icono">⚡</span>
                <h3>Electricidad</h3>
            </div>
            <p class="recurso-valor">${electricidad} u/t</p>
            <small class="recurso-detalle">
                Prod: ${electricidadProd} | Cons: ${electricidadCons}
            </small>
            <small class="recurso-detalle">
                Balance: ${formatearBalance(electricidadBalance)}
            </small>
        </div>

        <div class="recurso-card agua ${claseAgua}"
             title="${crearTooltip(aguaProd, aguaCons, aguaBalance)}">
            <div class="recurso-header">
                <span class="recurso-icono">💧</span>
                <h3>Agua</h3>
            </div>
            <p class="recurso-valor">${agua} u/t</p>
            <small class="recurso-detalle">
                Prod: ${aguaProd} | Cons: ${aguaCons}
            </small>
            <small class="recurso-detalle">
                Balance: ${formatearBalance(aguaBalance)}
            </small>
        </div>

        <div class="recurso-card alimentos"
             title="${crearTooltip(alimentosProd, alimentosCons, alimentosProd - alimentosCons)}">
            <div class="recurso-header">
                <span class="recurso-icono">🌾</span>
                <h3>Alimentos</h3>
            </div>
            <p class="recurso-valor">${alimentos} u</p>
            <small class="recurso-detalle">
                Balance: ${formatearBalance(alimentosProd - alimentosCons)}
            </small>
        </div>

        <div class="recurso-card poblacion">
            <div class="recurso-header">
                <span class="recurso-icono">👥</span>
                <h3>Población</h3>
            </div>
            <p class="recurso-valor">${poblacion}</p>
            <small class="recurso-detalle">
                Empleados: ${Math.max(0, poblacion - (ciudad.desempleados ?? 0))} |
                Desempleados: ${ciudad.desempleados ?? 0}
            </small>
        </div>

        <div class="recurso-card felicidad ${claseFelicidad}">
            <div class="recurso-header">
                <span class="recurso-icono">😊</span>
                <h3>Felicidad</h3>
            </div>
            <p class="recurso-valor">${felicidad}%</p>
            <div class="barra-felicidad">
                <div class="barra-felicidad-relleno" style="width: ${felicidad}%"></div>
            </div>
        </div>

    `;
}
