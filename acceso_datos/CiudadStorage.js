import Ciudad from "../modelos/Ciudad.js";

export default class CiudadStorage {
    static KEY = "city_builder_ciudad";

    static guardar(ciudad) {
        localStorage.setItem(this.KEY, JSON.stringify(ciudad.toJSON()));
    }

    static cargar() {
        const data = localStorage.getItem(this.KEY);

        if (!data) {
            return null;
        }

        return Ciudad.fromJSON(JSON.parse(data));
    }

    static existe() {
        return localStorage.getItem(this.KEY) !== null;
    }

    static eliminar() {
        localStorage.removeItem(this.KEY);
    }
}
