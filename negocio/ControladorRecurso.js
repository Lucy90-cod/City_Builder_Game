// negocio/ControladorRecurso.js
export default class ControladorRecurso {
    procesarTurno(ciudad) {
        this.reiniciarFlujos(ciudad);
        this.calcularProduccion(ciudad);
        this.calcularConsumo(ciudad);
        this.aplicarBalance(ciudad);
    }

    reiniciarFlujos(ciudad) {
        Object.values(ciudad.recursos).forEach((recurso) => {
            recurso.reiniciarFlujo();
        });
    }

    calcularProduccion(ciudad) {
        this.recorrerMapa(ciudad, (celda) => {
            const tipo = this.obtenerTipo(celda);

            switch (tipo) {
                case "tienda":
                    ciudad.recursos.dinero.agregarProduccion(500);
                    break;

                case "centroComercial":
                    ciudad.recursos.dinero.agregarProduccion(2000);
                    break;

                case "fabrica":
                    ciudad.recursos.dinero.agregarProduccion(800);
                    break;

                case "granja":
                    ciudad.recursos.alimentos.agregarProduccion(50);
                    break;

                case "plantaElectrica":
                    ciudad.recursos.electricidad.agregarProduccion(200);
                    break;

                case "plantaAgua":
                    ciudad.recursos.agua.agregarProduccion(150);
                    break;
            }
        });
    }

    calcularConsumo(ciudad) {
        this.recorrerMapa(ciudad, (celda) => {
            const tipo = this.obtenerTipo(celda);

            switch (tipo) {
                case "casa":
                    ciudad.recursos.electricidad.agregarConsumo(5);
                    ciudad.recursos.agua.agregarConsumo(3);
                    break;

                case "apartamento":
                    ciudad.recursos.electricidad.agregarConsumo(15);
                    ciudad.recursos.agua.agregarConsumo(10);
                    break;

                case "tienda":
                    ciudad.recursos.electricidad.agregarConsumo(8);
                    break;

                case "centroComercial":
                    ciudad.recursos.electricidad.agregarConsumo(25);
                    break;

                case "fabrica":
                    ciudad.recursos.electricidad.agregarConsumo(20);
                    ciudad.recursos.agua.agregarConsumo(15);
                    break;

                case "granja":
                    ciudad.recursos.agua.agregarConsumo(10);
                    break;

                case "estacionPolicia":
                    ciudad.recursos.electricidad.agregarConsumo(15);
                    break;

                case "estacionBomberos":
                    ciudad.recursos.electricidad.agregarConsumo(15);
                    break;

                case "hospital":
                    ciudad.recursos.electricidad.agregarConsumo(20);
                    ciudad.recursos.agua.agregarConsumo(10);
                    break;

                case "plantaAgua":
                    ciudad.recursos.electricidad.agregarConsumo(20);
                    break;
            }
        });
    }

    aplicarBalance(ciudad) {
        Object.values(ciudad.recursos).forEach((recurso) => {
            recurso.actualizarCantidad();
        });
    }

    recorrerMapa(ciudad, callback) {
        if (!ciudad.mapa || !Array.isArray(ciudad.mapa)) {
            return;
        }

        for (const fila of ciudad.mapa) {
            if (!Array.isArray(fila)) {
                continue;
            }

            for (const celda of fila) {
                if (celda) {
                    callback(celda);
                }
            }
        }
    }

    obtenerTipo(celda) {
        if (typeof celda === "string") {
            return celda;
        }

        if (typeof celda === "object" && celda.tipo) {
            return celda.tipo;
        }

        if (typeof celda === "object" && celda.type) {
            return celda.type;
        }

        return null;
    }
}
