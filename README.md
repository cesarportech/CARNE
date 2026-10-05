# Rifa Carne Asada

Aplicación React para repartir artículos entre participantes, con resultados compartidos mediante Firebase Realtime Database.

## Ejecutar

1. Instalar dependencias: `npm install`.
2. Iniciar: `npm run dev`.
3. Abrir `http://localhost:3000`.

No requiere Gemini. La configuración de Firebase está en `src/firebase.ts`.

## Administración

Agregar `#admin` al final de la dirección: `http://localhost:3000/#admin`. Usa la contraseña de reinicio existente, definida en `CLAVE_REINICIO` en `src/App.tsx`. Al cerrar el panel o recargar se vuelve a pedir. No hay enlace público al panel.

Permite agregar y editar participantes, seleccionar una de las 13 fotos existentes y configurar artículos, cantidades, descripciones, emojis y colores. La ruleta, listas y contadores se adaptan a los datos guardados.

Editar nombres conserva asignaciones. La cantidad de un artículo no puede ser menor que sus cupos ocupados. Cero desactiva un artículo sin asignaciones. Fresco conserva su nombre y admite hasta tres cupos, uno por bebida. El panel avisa si sobran o faltan cupos para las personas pendientes.

El reinicio está dentro del panel, pide confirmación y borra los resultados conservando los participantes y artículos configurados.

Cada participante y artículo tiene un botón **Eliminar** con confirmación. La eliminación es permanente en Firebase y se refleja automáticamente en las vistas conectadas. Al eliminar un participante se libera su cupo y su bebida; al eliminar un artículo se borran sus cupos y asignaciones, y las personas afectadas pueden volver a girar. Un catálogo vacío permanece vacío al recargar o reiniciar. Funciona tanto en el ambiente real como en prueba, siempre sobre el ambiente abierto; no borra el otro ambiente.

**Protección:** el acceso oculto y la contraseña se comprueban en el navegador; no son autorización de servidor. Para restringir realmente las escrituras administrativas se necesitan Firebase Authentication y reglas de base de datos apropiadas. Este cambio no modifica las reglas del proyecto Firebase.

## Datos y pruebas

`?test=1` utiliza el nodo separado `carneAsadaPRUEBA`. Su panel se abre en `http://localhost:3000/?test=1#admin`. También guarda datos en Firebase, pero no en el nodo real `carneAsada`.

Los datos anteriores son compatibles: se reconstruye el catálogo desde los cupos existentes sin reiniciar resultados. Los giros, bebidas y ediciones usan transacciones sobre el nodo completo para evitar asignaciones parciales y preservar operaciones concurrentes.

- `npm run lint`: comprobar TypeScript.
- `npm test`: pruebas locales de compatibilidad, asignaciones, edición, validaciones, bebidas y reinicio. No conecta con Firebase.
- `npm run build`: generar la versión de producción en `dist`.
