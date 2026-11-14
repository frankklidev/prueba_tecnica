# Directorio de usuarios

App en React y TypeScript para buscar usuarios de [JSONPlaceholder](https://jsonplaceholder.typicode.com/), consultar sus publicaciones y añadir una nueva al usuario seleccionado.

## Ejecución local

Requiere Node.js 22.12 o superior y conexión a Internet para consultar la API.

```bash
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Usa `npm test` para ejecutar las pruebas y `npm run build` para comprobar TypeScript y generar la compilación de producción.

## Arquitectura

- **Puerto y adaptador.** `DirectoryGateway` define las operaciones que necesita la app. El adaptador `jsonPlaceholder` concentra las rutas, las opciones HTTP y la validación de las respuestas de lectura antes de entregarlas a React.
- **Inyección de dependencias.** `main.tsx` conecta el adaptador con `App` mediante una prop. Esto permite sustituir la fuente de datos sin modificar los componentes.
- **Composición por funcionalidad.** `features/users` contiene el directorio. `features/posts` contiene el panel, el formulario y el control de paginación. El formulario recibe una operación de publicación y el control de paginación recibe el número de página y el callback de navegación.
- **Estado encapsulado en hooks.** `useResource` modela la carga con una unión discriminada y se ocupa de cancelar y reintentar lecturas. `useLocalPosts` agrupa por usuario únicamente las altas aceptadas por la API.

## Decisiones técnicas

- **Búsqueda local.** La API devuelve una lista pequeña de usuarios. Se descarga una vez y se filtra por nombre sin distinguir mayúsculas ni acentos.
- **Lectura por usuario.** Se piden las publicaciones al seleccionar un usuario. Al cambiar de selección se cancela la consulta anterior para evitar que llegue tarde y se muestre en el panel equivocado.
- **Paginación local.** Se muestran cinco publicaciones por página. La primera página vuelve a mostrarse al cambiar de usuario o al publicar, para que la entrada nueva quede visible.
- **Publicación simulada.** Se valida que ambos campos tengan contenido después de recortar espacios. Tras un `POST /posts` exitoso se añade la publicación en memoria al usuario original. Se usa un ID local único porque la API puede devolver el mismo ID en cada alta. Las altas se conservan al cambiar de usuario y se pierden al recargar.
- **Errores recuperables.** Las consultas muestran carga y ofrecen reintento. Si falla un envío, el formulario conserva el texto. Los mensajes de validación están asociados a sus campos y el foco vuelve al primer campo inválido.
- **Pruebas de interacción.** Vitest y Testing Library cubren la búsqueda, la consulta, la validación, la publicación, la paginación y los reintentos. También verifican que una respuesta inválida muestra un error y que un cambio rápido de usuario cancela e ignora la consulta anterior. Se simula `fetch` para que los tests sean reproducibles sin conexión a la API.

## Con más tiempo

Añadiría una prueba E2E con Playwright para recorrer el flujo completo en un navegador, con casos de navegación por teclado y resolución móvil.

## Uso de IA

ChatGPT/Codex implementó esta primera versión a partir del enunciado, incluidos los tests y el README.

- **Qué se pidió.** Implementar la app con React y TypeScript, integrar JSONPlaceholder, validar la creación, probar los flujos y hacer commits incrementales.
- **Qué se incorporó.** Vite, estado local de React, un módulo pequeño para la API y pruebas de interacción con respuestas HTTP simuladas.
- **Qué se corrigió durante la implementación.** Se ajustó el flujo de alta para generar IDs locales únicos y mantener las publicaciones por usuario al cambiar de selección. También se añadieron pruebas para comprobar que un fallo de envío conserva el borrador y permite reintentar.

La revisión y las correcciones descritas corresponden a la sesión con Codex.

Después de la primera versión, se pidió a Codex agregar la paginación. Se incorporaron controles Anterior y Siguiente y se probó el regreso a la primera página al publicar.

En la refactorización se pidió a Codex aplicar patrones de diseño con una justificación concreta. Se incorporaron el puerto, el adaptador y la inyección por props. Se corrigió la lectura de respuestas: ahora se valida su estructura en ejecución y se verificó el cambio de usuario con una solicitud pendiente.
