/**
 * Consume la API de NewsAPI para obtener titulares actuales.
 *
 * Endpoint: GET https://newsapi.org/v2/top-headlines
 *           ?country={code}&apiKey={API_KEY}&pageSize=5
 *
 * NOTA: NewsAPI requiere que las peticiones se hagan desde servidor
 * en produccion. En desarrollo (localhost) funciona desde el browser.
 */

export class NoticiasService {

    static #BASE_URL = 'https://newsapi.org/v2/top-headlines';
    static #API_KEY  = '';

    static setApiKey(key) {
        NoticiasService.#API_KEY = key;
    }

    /**
     * Obtiene los 5 titulares principales del pais indicado.
     * @param {string} countryCode - Codigo ISO 2 letras. Ej: 'co', 'us', 'es'
     * @returns {Promise<Object[]>} Array de noticias formateadas
     */
    static async getNoticias(countryCode = 'co') {
        if (!NoticiasService.#API_KEY) {
            console.warn('NoticiasService: falta PI KEY');
            return NoticiasService.#noticiasFallback();
        }

        try {
            const url = `${NoticiasService.#BASE_URL}?country=${countryCode}&pageSize=5&apiKey=${NoticiasService.#API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return NoticiasService.formatear(data);

        } catch (error) {
            console.error('NoticiasService.getNoticias() fallo:', error.message);
            return NoticiasService.#noticiasFallback();
        }
    }

    /**
     * Transforma la respuesta de NewsAPI en un array limpio.
     * @param {Object} data
     * @returns {Array<{ titulo, fuente, url, imagen }>}
     */
    static formatear(data) {
        if (!data.articles) return [];
        return data.articles.slice(0, 5).map(article => ({
            titulo: article.title    ?? 'Sin titulo',
            fuente: article.source?.name ?? 'Desconocido',
            url:    article.url      ?? '#',
            imagen: article.urlToImage ?? null,
        }));
    }

    static #noticiasFallback() {
        return [
            { titulo: 'Homer pierde su trabajo en la planta nuclear', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Bart vuelve a suspender en la escuela de Springfield', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Lisa gana el concurso de saxofon del estado', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Marge organiza feria de pasteles en el parque', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Maggie protagoniza nuevo incidente con el chupete', fuente: 'Springfield Gazette', url: '#', imagen: null },
        ];
    }
}