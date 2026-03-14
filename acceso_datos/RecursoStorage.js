import Recurso from "../modelos/Recurso.js";

const CLAVE_RECURSOS = "city_builder_recursos";

export default class RecursoStorage {

    static guardar(recursos) {
        if (!recursos) throw new Error("Recursos inválidos");

        const data = {
            dinero:        recursos.dinero?.toJSON()        ?? null,
            electricidad:  recursos.electricidad?.toJSON()  ?? null,
            agua:          recursos.agua?.toJSON()          ?? null,
            alimentos:     recursos.alimentos?.toJSON()     ?? null,
        };

        localStorage.setItem(CLAVE_RECURSOS, JSON.stringify(data));
    }

    static cargar() {
        const raw = localStorage.getItem(CLAVE_RECURSOS);
        if (!raw) return null;

        try {
            const data = JSON.parse(raw);
            return {
                dinero:       data.dinero       ? Recurso.fromJSON(data.dinero)       : null,
                electricidad: data.electricidad ? Recurso.fromJSON(data.electricidad) : null,
                agua:         data.agua         ? Recurso.fromJSON(data.agua)         : null,
                alimentos:    data.alimentos    ? Recurso.fromJSON(data.alimentos)    : null,
            };
        } catch (error) {
            console.error("RecursoStorage.cargar() falló:", error);
            return null;
        }
    }

    static existe() {
        return localStorage.getItem(CLAVE_RECURSOS) !== null;
    }

    static eliminar() {
        localStorage.removeItem(CLAVE_RECURSOS);
    }
}
