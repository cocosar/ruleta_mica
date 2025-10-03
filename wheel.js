// Motor de la ruleta: animación y cálculo de ganadores

class Wheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.prizes = [];
        // Iniciar la ruleta con una rotación aleatoria para variedad visual
        this.rotation = Math.random() * Math.PI * 2;
        this.targetRotation = 0;
        this.isSpinning = false;
        this.animationFrame = null;
        
        // Configurar tamaño del canvas
        this.setupCanvas();
        
        // Redimensionar canvas al cambiar tamaño de ventana
        window.addEventListener('resize', () => this.setupCanvas());
    }

    /**
     * Configura el tamaño del canvas para alta resolución
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        
        // Validar que el canvas tenga dimensiones válidas
        if (rect.width === 0 || rect.height === 0) {
            return; // No configurar si el canvas está oculto
        }
        
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        // Asegurar que el radio siempre sea positivo
        this.radius = Math.max(Math.min(this.width, this.height) / 2 - 10, 10);
        
        this.draw();
    }

    /**
     * Establece los premios para la ruleta
     * @param {Array} prizes - Array de premios
     */
    setPrizes(prizes) {
        this.prizes = prizes;
        this.draw();
    }

    /**
     * Dibuja la ruleta
     */
    draw() {
        if (!this.ctx || this.prizes.length === 0 || !this.radius || this.radius <= 0) return;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Guardar contexto
        this.ctx.save();
        
        // Mover al centro y rotar
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.rotation);
        
        // Calcular ángulo de cada sección
        const totalProbability = this.prizes.reduce((sum, p) => sum + p.probability, 0);
        let currentAngle = 0;
        
        // Dibujar cada sección
        this.prizes.forEach((prize, index) => {
            const sliceAngle = (prize.probability / totalProbability) * Math.PI * 2;
            
            // Dibujar segmento
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.lineTo(0, 0);
            this.ctx.fillStyle = prize.color;
            this.ctx.fill();
            
            // Borde del segmento
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Dibujar texto
            this.ctx.save();
            this.ctx.rotate(currentAngle + sliceAngle / 2);
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            // Texto en dos líneas si es muy largo
            const text = prize.name;
            const maxWidth = this.radius * 0.6;
            const words = text.split(' ');
            let line = '';
            const lines = [];
            
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = this.ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            });
            lines.push(line);
            
            const textRadius = this.radius * 0.65;
            const lineHeight = 20;
            const startY = -(lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, i) => {
                this.ctx.fillText(line.trim(), textRadius, startY + i * lineHeight);
            });
            
            this.ctx.restore();
            
            currentAngle += sliceAngle;
        });
        
        // Círculo central
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Restaurar contexto
        this.ctx.restore();
    }

    /**
     * Selecciona un premio ganador basado en probabilidades
     * @returns {Object} Premio ganador
     */
    selectWinner() {
        const totalProbability = this.prizes.reduce((sum, p) => sum + p.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (let prize of this.prizes) {
            random -= prize.probability;
            if (random <= 0) {
                return prize;
            }
        }
        
        return this.prizes[0]; // Fallback
    }

    /**
     * Detecta qué premio está bajo la flecha en una rotación dada
     * @param {number} rotation - Rotación actual
     * @returns {Object} Premio bajo la flecha
     */
    getPrizeAtPointer(rotation) {
        const totalProbability = this.prizes.reduce((sum, p) => sum + p.probability, 0);
        
        // En el canvas, los ángulos empiezan a la derecha (0) y van en sentido horario:
        // 0 = derecha, PI/2 = abajo, PI = izquierda, 3*PI/2 = arriba
        // La flecha está arriba = 3*PI/2 (o -PI/2)
        const pointerAngleInCanvas = -Math.PI / 2;
        
        // Cuando rotamos la ruleta por 'rotation', un punto que estaba en ángulo θ
        // en la ruleta ahora está en el ángulo (θ + rotation) en el canvas
        // Queremos saber qué θ cumple: θ + rotation = pointerAngleInCanvas
        // Por lo tanto: θ = pointerAngleInCanvas - rotation
        let effectiveAngle = pointerAngleInCanvas - rotation;
        
        // Normalizar a rango [0, 2*PI)
        while (effectiveAngle < 0) effectiveAngle += Math.PI * 2;
        while (effectiveAngle >= Math.PI * 2) effectiveAngle -= Math.PI * 2;
        
        // Encontrar qué segmento contiene ese ángulo
        let currentAngle = 0;
        for (let prize of this.prizes) {
            const sliceAngle = (prize.probability / totalProbability) * Math.PI * 2;
            const endAngle = currentAngle + sliceAngle;
            
            if (effectiveAngle >= currentAngle && effectiveAngle < endAngle) {
                return prize;
            }
            
            currentAngle = endAngle;
        }
        
        return this.prizes[0]; // Fallback
    }

    /**
     * Calcula el ángulo necesario para detenerse en un premio específico
     * @param {Object} winner - Premio ganador
     * @returns {number} Ángulo objetivo en el rango de la rotación actual
     */
    calculateTargetAngle(winner) {
        const totalProbability = this.prizes.reduce((sum, p) => sum + p.probability, 0);
        
        // Encontrar el ángulo inicial del segmento ganador en la ruleta
        let currentAngle = 0;
        let winnerStartAngle = 0;
        let winnerSliceAngle = 0;
        
        for (let prize of this.prizes) {
            const sliceAngle = (prize.probability / totalProbability) * Math.PI * 2;
            
            if (prize.id === winner.id) {
                winnerStartAngle = currentAngle;
                winnerSliceAngle = sliceAngle;
                break;
            }
            
            currentAngle += sliceAngle;
        }
        
        // Calcular el ángulo al centro del segmento ganador
        const middleAngle = winnerStartAngle + winnerSliceAngle / 2;
        
        // La flecha está arriba en -PI/2
        // Queremos que el centro del segmento (middleAngle) esté bajo la flecha
        // middleAngle + rotation = -PI/2 (mod 2*PI)
        // rotation = -PI/2 - middleAngle
        const targetRotation = -Math.PI / 2 - middleAngle;
        
        return targetRotation;
    }

    /**
     * Función de easing para desaceleración suave
     * @param {number} t - Tiempo normalizado (0-1)
     * @returns {number} Valor eased
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Gira la ruleta
     * @param {Function} onComplete - Callback cuando termina el giro
     */
    spin(onComplete) {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        
        // Seleccionar ganador
        const winner = this.selectWinner();
        
        // Calcular rotación objetivo
        const extraSpins = 5 + Math.random() * 3; // 5-8 vueltas completas
        const targetAngle = this.calculateTargetAngle(winner);
        
        // Normalizar la rotación actual
        let currentRotationNormalized = this.rotation % (Math.PI * 2);
        if (currentRotationNormalized < 0) currentRotationNormalized += Math.PI * 2;
        
        // Normalizar el ángulo objetivo
        let targetNormalized = targetAngle % (Math.PI * 2);
        if (targetNormalized < 0) targetNormalized += Math.PI * 2;
        
        // Calcular la diferencia más corta
        let angleDiff = targetNormalized - currentRotationNormalized;
        
        // Ajustar para girar siempre en sentido positivo (horario)
        if (angleDiff > 0) {
            angleDiff = angleDiff - (Math.PI * 2);
        }
        
        // Rotación total: posición actual + vueltas extra + diferencia al objetivo
        this.targetRotation = this.rotation + (Math.PI * 2 * extraSpins) + angleDiff;
        
        // Configurar animación
        const duration = 4000; // 4 segundos
        const startRotation = this.rotation;
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Aplicar easing
            const easedProgress = this.easeOutCubic(progress);
            
            // Calcular rotación actual
            this.rotation = startRotation + (this.targetRotation - startRotation) * easedProgress;
            
            // Dibujar
            this.draw();
            
            // Continuar animación o terminar
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.rotation = this.targetRotation;
                this.draw(); // Dibujar frame final
                
                // Detectar el premio real bajo la flecha (verificación)
                const actualWinner = this.getPrizeAtPointer(this.rotation);
                
                if (onComplete) {
                    setTimeout(() => onComplete(actualWinner), 300); // Usar el premio detectado
                }
            }
        };
        
        animate();
    }

    /**
     * Cancela la animación actual
     */
    cancelAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isSpinning = false;
    }
}

