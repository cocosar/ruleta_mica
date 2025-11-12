// Aplicación principal - Gestión de vistas y lógica

// Estado global
let currentView = 'config';
let editingPrizeId = null;
let wheel = null;
let draggedElement = null;
let touchStartY = 0;
let touchStartX = 0;

// Elementos del DOM
const configView = document.getElementById('config-view');
const gameView = document.getElementById('game-view');
const prizeForm = document.getElementById('prize-form');
const prizeNameInput = document.getElementById('prize-name');
const prizeProbabilityInput = document.getElementById('prize-probability');
const prizeColorInput = document.getElementById('prize-color');
const prizesList = document.getElementById('prizes-list');
const goToGameBtn = document.getElementById('go-to-game-btn');
const backToConfigBtn = document.getElementById('back-to-config-btn');
const spinBtn = document.getElementById('spin-btn');
const formBtnText = document.getElementById('form-btn-text');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const winnerModal = document.getElementById('winner-modal');
const winnerPrizeEl = document.getElementById('winner-prize');
const closeModalBtn = document.getElementById('close-modal-btn');

/**
 * Inicialización de la aplicación
 */
function init() {
    // Cargar premios existentes
    renderPrizesList();
    
    // Event listeners
    prizeForm.addEventListener('submit', handleFormSubmit);
    goToGameBtn.addEventListener('click', goToGameView);
    backToConfigBtn.addEventListener('click', goToConfigView);
    spinBtn.addEventListener('click', handleSpin);
    cancelEditBtn.addEventListener('click', cancelEdit);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Event listeners para sugerencias de color
    const colorSuggestions = document.querySelectorAll('.color-suggestion');
    colorSuggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            prizeColorInput.value = color;
        });
    });
    
    // Cerrar modal al hacer clic fuera
    winnerModal.addEventListener('click', (e) => {
        if (e.target === winnerModal) {
            closeModal();
        }
    });
    
    // Inicializar ruleta
    wheel = new Wheel('wheel-canvas');
}

/**
 * Maneja el envío del formulario (agregar o editar premio)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const prizeData = {
        name: prizeNameInput.value.trim(),
        probability: prizeProbabilityInput.value,
        color: prizeColorInput.value
    };
    
    if (editingPrizeId) {
        // Editar premio existente
        Storage.updatePrize(editingPrizeId, prizeData);
        editingPrizeId = null;
        formBtnText.textContent = 'Agregar Premio';
        cancelEditBtn.style.display = 'none';
    } else {
        // Agregar nuevo premio
        Storage.addPrize(prizeData);
    }
    
    // Limpiar formulario y actualizar lista
    prizeForm.reset();
    prizeColorInput.value = getRandomColor();
    renderPrizesList();
}

/**
 * Renderiza la lista de premios configurados
 */
function renderPrizesList() {
    const prizes = Storage.getPrizes();
    
    if (prizes.length === 0) {
        prizesList.innerHTML = '<p class="empty-message">No hay premios configurados. Agrega al menos 2 para comenzar.</p>';
        goToGameBtn.disabled = true;
        return;
    }
    
    if (prizes.length < 2) {
        goToGameBtn.disabled = true;
    } else {
        goToGameBtn.disabled = false;
    }
    
    // Calcular probabilidad total para mostrar porcentajes
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    
    prizesList.innerHTML = prizes.map((prize, index) => {
        const percentage = ((prize.probability / totalProbability) * 100).toFixed(1);
        const isFirst = index === 0;
        const isLast = index === prizes.length - 1;
        
        return `
            <div class="prize-item" data-id="${prize.id}" draggable="true">
                <div class="drag-handle" title="Arrastra para reordenar">
                    ⋮⋮
                </div>
                <div class="prize-order-controls">
                    <button class="btn btn-order" onclick="movePrizeUp(${prize.id})" 
                            ${isFirst ? 'disabled' : ''} title="Mover arriba">
                        ↑
                    </button>
                    <button class="btn btn-order" onclick="movePrizeDown(${prize.id})" 
                            ${isLast ? 'disabled' : ''} title="Mover abajo">
                        ↓
                    </button>
                </div>
                <div class="prize-color-preview" style="background-color: ${prize.color}"></div>
                <div class="prize-info">
                    <div class="prize-name">${prize.name}</div>
                    <div class="prize-probability">Probabilidad: ${prize.probability} (${percentage}%)</div>
                </div>
                <div class="prize-actions">
                    <button class="btn btn-primary btn-icon" onclick="editPrize(${prize.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-icon" onclick="deletePrize(${prize.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners de drag and drop
    initDragAndDrop();
}

/**
 * Edita un premio
 */
function editPrize(id) {
    const prize = Storage.getPrizeById(id);
    if (!prize) return;
    
    editingPrizeId = id;
    prizeNameInput.value = prize.name;
    prizeProbabilityInput.value = prize.probability;
    prizeColorInput.value = prize.color;
    
    formBtnText.textContent = 'Guardar Cambios';
    cancelEditBtn.style.display = 'inline-block';
    
    // Scroll al formulario
    prizeForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Cancela la edición de un premio
 */
function cancelEdit() {
    editingPrizeId = null;
    prizeForm.reset();
    prizeColorInput.value = getRandomColor();
    formBtnText.textContent = 'Agregar Premio';
    cancelEditBtn.style.display = 'none';
}

/**
 * Elimina un premio
 */
function deletePrize(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este premio?')) {
        Storage.deletePrize(id);
        renderPrizesList();
        
        // Si estábamos editando este premio, cancelar edición
        if (editingPrizeId === id) {
            cancelEdit();
        }
    }
}

/**
 * Mueve un premio hacia arriba en la lista
 */
function movePrizeUp(id) {
    Storage.movePrizeUp(id);
    renderPrizesList();
}

/**
 * Mueve un premio hacia abajo en la lista
 */
function movePrizeDown(id) {
    Storage.movePrizeDown(id);
    renderPrizesList();
}

/**
 * Inicializa drag and drop para reordenar premios
 */
function initDragAndDrop() {
    const prizeItems = document.querySelectorAll('.prize-item');
    
    prizeItems.forEach(item => {
        // Eventos de mouse (drag and drop HTML5)
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        
        // Eventos táctiles (para tablets y móviles)
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd);
    });
}

/**
 * Maneja el inicio del drag (mouse)
 */
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

/**
 * Maneja el drag over (mouse)
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

/**
 * Maneja cuando el elemento entra en la zona de drop
 */
function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

/**
 * Maneja cuando el elemento sale de la zona de drop
 */
function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

/**
 * Maneja el drop (mouse)
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        // Reordenar elementos
        reorderPrizeItems(draggedElement, this);
    }
    
    return false;
}

/**
 * Maneja el fin del drag (mouse)
 */
function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remover todas las clases de drag-over
    document.querySelectorAll('.prize-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

/**
 * Maneja el inicio del touch (táctil)
 */
function handleTouchStart(e) {
    // Solo permitir drag desde el drag-handle o el elemento principal
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    
    draggedElement = this;
    this.classList.add('dragging');
}

/**
 * Maneja el movimiento del touch (táctil)
 */
function handleTouchMove(e) {
    if (!draggedElement) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    
    // Encontrar elemento bajo el dedo
    const elementBelow = document.elementFromPoint(touch.clientX, currentY);
    const prizeItemBelow = elementBelow?.closest('.prize-item');
    
    // Remover clases previas
    document.querySelectorAll('.prize-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    // Agregar clase al elemento bajo el dedo
    if (prizeItemBelow && prizeItemBelow !== draggedElement) {
        prizeItemBelow.classList.add('drag-over');
    }
}

/**
 * Maneja el fin del touch (táctil)
 */
function handleTouchEnd(e) {
    if (!draggedElement) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const prizeItemBelow = elementBelow?.closest('.prize-item');
    
    if (prizeItemBelow && prizeItemBelow !== draggedElement) {
        reorderPrizeItems(draggedElement, prizeItemBelow);
    }
    
    draggedElement.classList.remove('dragging');
    document.querySelectorAll('.prize-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    draggedElement = null;
}

/**
 * Reordena los premios después de un drag and drop
 */
function reorderPrizeItems(draggedItem, targetItem) {
    const allItems = Array.from(document.querySelectorAll('.prize-item'));
    const draggedId = parseInt(draggedItem.getAttribute('data-id'));
    const targetId = parseInt(targetItem.getAttribute('data-id'));
    
    // Obtener el orden actual de IDs
    const currentOrder = allItems.map(item => parseInt(item.getAttribute('data-id')));
    
    // Encontrar índices
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    
    // Reordenar array
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);
    
    // Guardar nuevo orden
    Storage.reorderPrizes(currentOrder);
    renderPrizesList();
}

/**
 * Cambia a la vista de juego
 */
function goToGameView() {
    const prizes = Storage.getPrizes();
    if (prizes.length < 2) {
        alert('Necesitas al menos 2 premios para jugar.');
        return;
    }
    
    currentView = 'game';
    configView.style.display = 'none';
    gameView.style.display = 'block';
    
    // Esperar un momento para que el canvas sea visible y tenga dimensiones
    setTimeout(() => {
        wheel.setupCanvas();
        wheel.setPrizes(prizes);
    }, 50);
}

/**
 * Cambia a la vista de configuración
 */
function goToConfigView() {
    currentView = 'config';
    gameView.style.display = 'none';
    configView.style.display = 'block';
    
    // Cancelar animación si está girando
    if (wheel) {
        wheel.cancelAnimation();
    }
}

/**
 * Maneja el giro de la ruleta
 */
function handleSpin() {
    if (wheel.isSpinning) return;
    
    spinBtn.disabled = true;
    backToConfigBtn.disabled = true;
    
    wheel.spin((winner) => {
        // Mostrar modal con el ganador
        showWinner(winner);
        spinBtn.disabled = false;
        backToConfigBtn.disabled = false;
    });
}

/**
 * Muestra el modal con el premio ganador
 */
function showWinner(prize) {
    winnerPrizeEl.textContent = prize.name;
    winnerPrizeEl.style.color = prize.color;
    winnerModal.classList.add('show');
}

/**
 * Cierra el modal
 */
function closeModal() {
    winnerModal.classList.remove('show');
}

/**
 * Genera un color aleatorio de la paleta verde oliva
 */
function getRandomColor() {
    const colors = [
        '#6c7d45', // Verde oliva principal
        '#8a9a5c', // Verde oliva claro
        '#4a5530', // Verde oliva oscuro
        '#b8a76d', // Dorado/beige
        '#c97850', // Terracota
        '#d4d8c8'  // Verde claro/beige
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', init);

