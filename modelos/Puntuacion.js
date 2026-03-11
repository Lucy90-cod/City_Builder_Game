export default class Puntuacion {
    constructor() {
        this.total = 0;
        this.detalle = {
            poblacion: 0,
            felicidad: 0,
            dinero: 0,
            edificios: 0,
            electricidad: 0,
            agua: 0
        };
        this.bonificaciones = 0;
        this.penalizaciones = 0;
    }

    calcular(ciudad) {
        const poblacion = ciudad.poblacion || 0;
        const felicidad = ciudad.felicidadPromedio || 0;
        const dinero = ciudad.recursos.dinero.cantidad || 0;
        const electricidadBalance = ciudad.recursos.electricidad.calcularBalance();
        const aguaBalance = ciudad.recursos.agua.calcularBalance();
        const numeroEdificios = ciudad.totalEdificios || 0;
        const desempleados = ciudad.desempleados || 0;

        this.detalle.poblacion = poblacion * 10;
        this.detalle.felicidad = felicidad * 5;
        this.detalle.dinero = Math.floor(dinero / 100);
        this.detalle.edificios = numeroEdificios * 50;
        this.detalle.electricidad = electricidadBalance * 2;
        this.detalle.agua = aguaBalance * 2;

        this.bonificaciones = 0;
        this.penalizaciones = 0;

        if (desempleados === 0 && poblacion > 0) this.bonificaciones += 500;
        if (felicidad > 80) this.bonificaciones += 300;
        if (
            ciudad.recursos.dinero.cantidad > 0 &&
            ciudad.recursos.electricidad.cantidad > 0 &&
            ciudad.recursos.agua.cantidad > 0
        ) {
            this.bonificaciones += 200;
        }
        if (poblacion > 1000) this.bonificaciones += 1000;

        if (dinero < 0) this.penalizaciones += 500;
        if (ciudad.recursos.electricidad.cantidad < 0) this.penalizaciones += 300;
        if (ciudad.recursos.agua.cantidad < 0) this.penalizaciones += 300;
        if (felicidad < 40) this.penalizaciones += 400;
        this.penalizaciones += desempleados * 10;

        this.total =
            this.detalle.poblacion +
            this.detalle.felicidad +
            this.detalle.dinero +
            this.detalle.edificios +
            this.detalle.electricidad +
            this.detalle.agua +
            this.bonificaciones -
            this.penalizaciones;

        return this.total;
    }

    toJSON() {
        return {
            total: this.total,
            detalle: this.detalle,
            bonificaciones: this.bonificaciones,
            penalizaciones: this.penalizaciones
        };
    }

    static fromJSON(data) {
        const puntuacion = new Puntuacion();
        puntuacion.total = data.total;
        puntuacion.detalle = data.detalle;
        puntuacion.bonificaciones = data.bonificaciones;
        puntuacion.penalizaciones = data.penalizaciones;
        return puntuacion;
    }
}
