// Manejo de LocalStorage para persistencia de datos

const STORAGE_KEY = 'ruletaEventos_prizes';

/**
 * Objeto Storage para manejar operaciones con LocalStorage
 */
const Storage = {
    /**
     * Obtiene todos los premios guardados
     * @returns {Array} Array de premios
     */
    getPrizes() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar premios:', error);
            return [];
        }
    },

    /**
     * Guarda los premios en LocalStorage
     * @param {Array} prizes - Array de premios a guardar
     * @returns {boolean} True si se guardó correctamente
     */
    savePrizes(prizes) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
            return true;
        } catch (error) {
            console.error('Error al guardar premios:', error);
            return false;
        }
    },

    /**
     * Agrega un nuevo premio
     * @param {Object} prize - Premio a agregar
     * @returns {Object} Premio agregado con ID
     */
    addPrize(prize) {
        const prizes = this.getPrizes();
        const newPrize = {
            id: Date.now(), // ID único basado en timestamp
            name: prize.name,
            probability: parseInt(prize.probability),
            color: prize.color
        };
        prizes.push(newPrize);
        this.savePrizes(prizes);
        return newPrize;
    },

    /**
     * Actualiza un premio existente
     * @param {number} id - ID del premio a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {boolean} True si se actualizó correctamente
     */
    updatePrize(id, updatedData) {
        const prizes = this.getPrizes();
        const index = prizes.findIndex(p => p.id === id);
        
        if (index !== -1) {
            prizes[index] = {
                ...prizes[index],
                name: updatedData.name,
                probability: parseInt(updatedData.probability),
                color: updatedData.color
            };
            this.savePrizes(prizes);
            return true;
        }
        return false;
    },

    /**
     * Elimina un premio
     * @param {number} id - ID del premio a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    deletePrize(id) {
        const prizes = this.getPrizes();
        const filtered = prizes.filter(p => p.id !== id);
        
        if (filtered.length !== prizes.length) {
            this.savePrizes(filtered);
            return true;
        }
        return false;
    },

    /**
     * Obtiene un premio por ID
     * @param {number} id - ID del premio
     * @returns {Object|null} Premio encontrado o null
     */
    getPrizeById(id) {
        const prizes = this.getPrizes();
        return prizes.find(p => p.id === id) || null;
    },

    /**
     * Limpia todos los premios (útil para testing)
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Mueve un premio una posición hacia arriba
     * @param {number} id - ID del premio a mover
     * @returns {boolean} True si se movió correctamente
     */
    movePrizeUp(id) {
        const prizes = this.getPrizes();
        const index = prizes.findIndex(p => p.id === id);
        
        if (index > 0) {
            // Intercambiar con el elemento anterior
            [prizes[index - 1], prizes[index]] = [prizes[index], prizes[index - 1]];
            this.savePrizes(prizes);
            return true;
        }
        return false;
    },

    /**
     * Mueve un premio una posición hacia abajo
     * @param {number} id - ID del premio a mover
     * @returns {boolean} True si se movió correctamente
     */
    movePrizeDown(id) {
        const prizes = this.getPrizes();
        const index = prizes.findIndex(p => p.id === id);
        
        if (index !== -1 && index < prizes.length - 1) {
            // Intercambiar con el elemento siguiente
            [prizes[index], prizes[index + 1]] = [prizes[index + 1], prizes[index]];
            this.savePrizes(prizes);
            return true;
        }
        return false;
    },

};

