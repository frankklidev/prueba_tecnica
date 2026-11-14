# Directorio de usuarios

App en React y TypeScript para buscar usuarios de [JSONPlaceholder](https://jsonplaceholder.typicode.com/), consultar sus publicaciones y añadir una nueva al usuario seleccionado.

## Ejecución local

Requiere Node.js 22.12 o superior y conexión a Internet para consultar la API.

```bash
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Usa `npm test` para ejecutar las seis pruebas y `npm run build` para comprobar TypeScript y generar la compilación de producción.

## Decisiones técnicas

- **Búsqueda local.** La API devuelve una lista pequeña de usuarios. Se descarga una vez y se filtra por nombre sin distinguir mayúsculas ni acentos.
- **Lectura por usuario.** Se piden las publicaciones al seleccionar un usuario. Al cambiar de selección se cancela la consulta anterior para evitar que llegue tarde y se muestre en el panel equivocado.
- **Publicación simulada.** Se valida que ambos campos tengan contenido después de recortar espacios. Tras un `POST /posts` exitoso se añade la publicación en memoria al usuario original. Se usa un ID local único porque la API puede devolver el mismo ID en cada alta. Las altas se conservan al cambiar de usuario y se pierden al recargar.
- **Errores recuperables.** Las consultas muestran carga y ofrecen reintento. Si falla un envío, el formulario conserva el texto. Los mensajes de validación están asociados a sus campos y el foco vuelve al primer campo inválido.
- **Pruebas de interacción.** Vitest y Testing Library cubren la búsqueda, la consulta, la validación, la publicación y los reintentos. Se simula `fetch` para que los tests sean reproducibles sin conexión a la API.

## Con más tiempo

Añadiría una prueba E2E con Playwright para recorrer el flujo completo en un navegador, con casos de navegación por teclado y resolución móvil. También probaría cambios rápidos de usuario mientras una consulta sigue en curso.

## Uso de IA

ChatGPT/Codex implementó esta primera versión a partir del enunciado, incluidos los tests y el README.

- **Qué se pidió.** Implementar la app con React y TypeScript, integrar JSONPlaceholder, validar la creación, probar los flujos y hacer commits incrementales.
- **Qué se incorporó.** Vite, estado local de React, un módulo pequeño para la API y pruebas de interacción con respuestas HTTP simuladas.
- **Qué se corrigió durante la implementación.** Se ajustó el flujo de alta para generar IDs locales únicos y mantener las publicaciones por usuario al cambiar de selección. También se añadieron pruebas para comprobar que un fallo de envío conserva el borrador y permite reintentar.

La revisión y las correcciones descritas corresponden a la sesión con Codex.
