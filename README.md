# Finanzas JB

App web instalable (PWA) de finanzas personales. Versión 0.2: las 11 pantallas del prototipo sobre datos reales guardados en el celular. Una instalación nueva empieza vacía y abre "¿Cuánto tienes hoy?".

## Estructura

- `index.html`: página de la app.
- `css/app.css`: estilos (claro y oscuro, adaptado a celular).
- `js/app.js`: pantallas, navegación y hoja de captura.
- `js/store.js`: almacenamiento en el celular (localStorage). Distingue instalación nueva de usuario con datos; nunca borra al abrir o actualizar.
- `dev/datos-ejemplo.js`: datos ficticios del prototipo, solo para desarrollo. La app publicada no lo carga.
- `manifest.webmanifest`, `sw.js`, `icons/`: instalación en la pantalla de inicio y uso sin conexión.
- `docs/prototipo-finanzas-jb.html`: prototipo original de referencia.

## Publicación

URL: https://josuebenjamin2608-ux.github.io/finanzas-jb/

Sitio estático en GitHub Pages, publicado desde la rama `gh-pages` (copia de `main`, carpeta raíz). No requiere compilación.
Para publicar: `git push origin main main:gh-pages`.
Al publicar cambios, sube `VERSION` en `sw.js` para que los celulares tomen la versión nueva.
