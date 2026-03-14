// negocio/ControladorRecurso.js
export default class ControladorRecurso {
    procesarTurno(ciudad) {
        this.reiniciarFlujos(ciudad);
        this.procesarEdificios(ciudad);
        this.aplicarMantenimiento(ciudad);
        this.aplicarBalance(ciudad);
    }

    reiniciarFlujos(ciudad) {
        if (!ciudad || !ciudad.recursos) return;

        Object.values(ciudad.recursos).forEach((recurso) => {
            if (recurso && typeof recurso.reiniciarFlujo === "function") {
                recurso.reiniciarFlujo();
            }
        });
    }

    procesarEdificios(ciudad) {
        const edificios = this.obtenerEdificios(ciudad);

        for (const edificio of edificios) {
            if (!edificio || typeof edificio.isActivo !== "function") continue;
            if (!edificio.isActivo()) continue;

            this.aplicarConsumoEdificio(ciudad, edificio);
            this.aplicarProduccionEdificio(ciudad, edificio);
        }
    }

    aplicarConsumoEdificio(ciudad, edificio) {
        if (typeof edificio.calcularConsumo !== "function") return;

        const consumo = edificio.calcularConsumo() || {};

        Object.entries(consumo).forEach(([nombre, cantidad]) => {
            const recursoNormalizado = this.normalizarNombreRecurso(nombre);
            const recurso = ciudad.recursos?.[recursoNormalizado];

            if (
                recurso &&
                typeof recurso.agregarConsumo === "function" &&
                typeof cantidad === "number"
            ) {
                recurso.agregarConsumo(cantidad);
            }
        });
    }

    aplicarProduccionEdificio(ciudad, edificio) {
        let produccion = {};

        if (typeof edificio.generarIngresos === "function") {
            const hayElectricidad = this.hayElectricidadDisponible(ciudad);
            produccion = { money: edificio.generarIngresos(hayElectricidad) };
        } else if (typeof edificio.calcularProduccion === "function") {
            produccion = edificio.calcularProduccion() || {};
        }

        Object.entries(produccion).forEach(([nombre, cantidad]) => {
            const recursoNormalizado = this.normalizarNombreRecurso(nombre);
            const recurso = ciudad.recursos?.[recursoNormalizado];

            if (
                recurso &&
                typeof recurso.agregarProduccion === "function" &&
                typeof cantidad === "number"
            ) {
                recurso.agregarProduccion(cantidad);
            }
        });
    }

    aplicarMantenimiento(ciudad) {
        const edificios = this.obtenerEdificios(ciudad);
        const recursoDinero = ciudad.recursos?.dinero;

        if (!recursoDinero || typeof recursoDinero.agregarConsumo !== "function") {
            return;
        }

        for (const edificio of edificios) {
            if (!edificio || typeof edificio.getCostoMantenimiento !== "function") {
                continue;
            }

            const costo = edificio.getCostoMantenimiento();

            if (typeof costo === "number" && costo > 0) {
                recursoDinero.agregarConsumo(costo);
            }
        }
    }

    aplicarBalance(ciudad) {
        if (!ciudad || !ciudad.recursos) return;

        Object.values(ciudad.recursos).forEach((recurso) => {
            if (recurso && typeof recurso.actualizarCantidad === "function") {
                recurso.actualizarCantidad();
            }
        });
    }

    obtenerEdificios(ciudad) {
        if (!ciudad || !ciudad.edificios) {
            return [];
        }

        if (ciudad.edificios instanceof Map) {
            return Array.from(ciudad.edificios.values());
        }

        if (Array.isArray(ciudad.edificios)) {
            return ciudad.edificios;
        }

        if (typeof ciudad.edificios === "object") {
            return Object.values(ciudad.edificios);
        }

        return [];
    }

    normalizarNombreRecurso(nombre) {
        const mapaNombres = {
            money: "dinero",
            electricity: "electricidad",
            water: "agua",
            food: "alimentos"
        };

        return mapaNombres[nombre] || nombre;
    }

    hayElectricidadDisponible(ciudad) {
        const electricidad = ciudad.recursos?.electricidad;

        if (!electricidad) return false;

        return typeof electricidad.cantidad === "number" && electricidad.cantidad > 0;
    }
}
