# 🎡 Ruleta de Eventos

Aplicación web de ruleta configurable para eventos, optimizada para tablets.

## 🚀 Características

- ✅ Configuración de premios con nombre, probabilidad y color personalizados
- ✅ Sistema de probabilidades configurables por premio
- ✅ Animación fluida con desaceleración realista
- ✅ Persistencia de datos con LocalStorage
- ✅ Diseño responsive optimizado para tablets
- ✅ Interfaz moderna y colorida

## 📱 Cómo Usar

1. Abre `index.html` en tu navegador o tablet
2. **Configurar Premios:**
   - Agrega al menos 2 premios con sus nombres
   - Configura la probabilidad de cada premio (números más altos = mayor chance)
   - Elige un color para cada premio
3. **Jugar:**
   - Haz clic en "Ir a la Ruleta"
   - Presiona el botón "GIRAR" en el centro
   - La ruleta girará y se detendrá en un premio aleatorio basado en las probabilidades
   - El premio que queda bajo la flecha (▼) es el ganador

## 🧪 Cómo Probar la Precisión

Para verificar que el premio mostrado coincide con la flecha:

1. Configura exactamente 2 premios con 50/50 de probabilidad
2. Asigna colores muy distintos (ej: rojo y azul)
3. Gira la ruleta varias veces
4. Verifica que el premio en el modal coincida con el color del segmento bajo la flecha ▼

## 🎯 Sistema de Probabilidades

Las probabilidades son relativas. Ejemplos:

- Premio A (peso 50), Premio B (peso 50) → 50% cada uno
- Premio A (peso 30), Premio B (peso 20), Premio C (peso 50) → 30%, 20%, 50%
- Premio A (peso 1), Premio B (peso 99) → 1%, 99%

## 📂 Estructura del Proyecto

```
proyecto-ruleta-mica/
├── index.html      # Estructura HTML principal
├── styles.css      # Estilos responsive
├── app.js          # Lógica de la aplicación
├── wheel.js        # Motor de animación de la ruleta
├── storage.js      # Gestión de LocalStorage
└── README.md       # Documentación
```

## 🔧 Detalles Técnicos

- **Canvas HTML5** para renderizado de la ruleta
- **requestAnimationFrame** para animaciones a 60fps
- **LocalStorage** para persistencia de datos
- **Vanilla JavaScript** (sin dependencias)
- **CSS3** con degradados y animaciones

## 💡 Consejos

- La configuración se guarda automáticamente
- Puedes editar o eliminar premios en cualquier momento
- Los datos persisten incluso si cierras el navegador
- La ruleta comienza en una posición aleatoria cada vez para mayor variedad visual

---

Desarrollado para eventos con ❤️

