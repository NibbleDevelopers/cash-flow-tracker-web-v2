# Cash Flow Tracker Web

**Frontend de la aplicación Cash Flow Tracker** - Migrado desde el proyecto monolítico original.

## 📋 Descripción

Este es el repositorio frontend de la aplicación Cash Flow Tracker, que ha sido migrado desde el proyecto monolítico original. Mantiene exactamente la misma UI, funcionalidad y estructura de componentes que tenía la aplicación original.

## ✨ Características

- **Gestión de Gastos**: Agregar, editar y visualizar gastos mensuales
- **Categorización**: Sistema de categorías personalizables para organizar gastos
- **Presupuesto Mensual**: Configuración y seguimiento del presupuesto
- **Gastos Fijos**: Automatización de gastos recurrentes mensuales
- **Dashboard**: Vista resumida con estadísticas y gráficos
- **Responsive Design**: Interfaz adaptada para dispositivos móviles y desktop

## 🏗️ Arquitectura

- **Vue.js 3**: Framework frontend con Composition API
- **Pinia**: Gestión de estado global
- **Vue Router**: Navegación entre vistas
- **Tailwind CSS**: Framework de estilos utilitarios
- **Vite**: Herramienta de build y desarrollo

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── AddExpenseForm.vue
│   ├── BudgetForm.vue
│   ├── BudgetProgress.vue
│   ├── ExpensesList.vue
│   └── FixedExpensesManager.vue
├── views/              # Vistas principales
│   ├── ExpensesList.vue
│   ├── BudgetView.vue
│   └── SummaryView.vue
├── stores/             # Estado global (Pinia)
│   └── expenseStore.js
├── services/           # Servicios de API
│   └── googleSheetsBackend.js
├── router/             # Configuración de rutas
│   └── index.js
├── App.vue            # Componente raíz
├── main.js            # Punto de entrada
└── style.css          # Estilos globales
```

## 🚀 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/cash-flow-tracker-web.git
   cd cash-flow-tracker-web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con la URL de tu API:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_API_URL=http://localhost:3001
   ```

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 🔧 Configuración

### Variables de Entorno

- `VITE_API_BASE_URL`: URL base de la API backend
- `VITE_API_URL`: URL completa de la API

### API Backend

Este frontend se comunica con el backend a través de la API REST. Asegúrate de que el backend esté ejecutándose en la URL configurada.

## 📱 Uso

### Navegación

- **Gastos** (`/`): Vista principal para gestionar gastos
- **Presupuesto** (`/budget`): Configuración y seguimiento del presupuesto
- **Resumen** (`/summary`): Dashboard con estadísticas y resumen

### Funcionalidades

1. **Agregar Gasto**:
   - Descripción, monto, categoría y fecha
   - Opción para marcar como gasto fijo
   - Generación automática mensual

2. **Gestionar Categorías**:
   - Crear y editar categorías
   - Colores personalizables
   - Activación/desactivación

3. **Presupuesto**:
   - Configuración mensual
   - Seguimiento del progreso
   - Alertas de exceso

4. **Gastos Fijos**:
   - Configuración de gastos recurrentes
   - Día específico del mes
   - Generación automática

## 🚀 Despliegue

### Build de Producción

```bash
npm run build
```

### Despliegue en GitHub Pages

```bash
npm run deploy
```

## 🔗 Dependencias

### Dependencias Principales

- **Vue.js 3.4.0**: Framework frontend
- **Vue Router 4.2.5**: Enrutamiento
- **Pinia 2.1.7**: Gestión de estado
- **Axios 1.6.2**: Cliente HTTP
- **Date-fns 2.30.0**: Manipulación de fechas

### Dependencias de Desarrollo

- **Vite 5.0.8**: Build tool
- **Tailwind CSS 3.3.6**: Framework CSS
- **PostCSS 8.4.32**: Procesamiento CSS
- **Autoprefixer 10.4.16**: Prefijos CSS automáticos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o problemas:

- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 🔄 Migración

Este proyecto fue migrado desde el proyecto monolítico original `Census` para separar el frontend del backend. La migración mantiene:

- ✅ Toda la funcionalidad original
- ✅ Misma interfaz de usuario
- ✅ Misma estructura de componentes
- ✅ Mismos estilos y diseño
- ✅ Misma lógica de negocio

### Cambios Realizados

- Separación del código frontend del backend
- Adaptación del servicio para comunicarse con API separada
- Mantenimiento de la estructura original de archivos
- Preservación de todos los componentes y vistas

---

**Nota**: Este es el frontend migrado del proyecto original. Para el backend, consulta el repositorio `cash-flow-tracker-api`.
