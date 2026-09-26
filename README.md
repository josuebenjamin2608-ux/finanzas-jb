# Finanzas JB

App web instalable (PWA) de finanzas personales. Versión 0.1: la interfaz del prototipo con sus 11 pantallas, navegación móvil y datos de ejemplo.

## Estructura

- `index.html`: página de la app.
- `css/app.css`: estilos (claro y oscuro, adaptado a celular).
- `js/app.js`: pantallas, navegación y hoja de captura.
- `js/datos-ejemplo.js`: datos ficticios que usa la interfaz por ahora.
- `js/store.js`: almacenamiento local preparado (todavía no conectado).
- `manifest.webmanifest`, `sw.js`, `icons/`: instalación en la pantalla de inicio y uso sin conexión.
- `docs/prototipo-finanzas-jb.html`: prototipo original de referencia.

## Publicación

Sitio estático en GitHub Pages desde la rama `main` (carpeta raíz). No requiere compilación.
Al publicar cambios, sube `VERSION` en `sw.js` para que los celulares tomen la versión nueva.
