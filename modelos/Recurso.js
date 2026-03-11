export default class Recurso {
    constructor(nombre, cantidad = 0, produccion = 0, consumo = 0, unidad = "u/t") {
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.produccion = produccion;
        this.consumo = consumo;
        this.unidad = unidad;
    }

    calcularBalance() {
        return this.produccion - this.consumo;
    }

    actualizarCantidad() {
        this.cantidad += this.calcularBalance();
    }

    reiniciarFlujo() {
        this.produccion = 0;
        this.consumo = 0;
    }

    toJSON() {
        return {
            nombre: this.nombre,
            cantidad: this.cantidad,
            produccion: this.produccion,
            consumo: this.consumo,
            unidad: this.unidad
        };
    }

    static fromJSON(data) {
        return new Recurso(
            data.nombre,
            data.cantidad,
            data.produccion,
            data.consumo,
            data.unidad
        );
    }
}
