# RF-14 — Pantalla de confirmación post-compra

> Basado en una captura de referencia de otra implementación similar (app "BARI dinámicas").
> Se usa como referencia de estructura y tono, no se copia literal: donde la referencia entra
> en conflicto con reglas ya definidas en `CONTEXT.md`, se marca como pregunta abierta en vez
> de implementarse tal cual.
>
> Esta pantalla **es** la "Pantalla del participante" ya definida en `CONTEXT.md` sección 9.3
> (ruta `/dinamica/mis-numeros/[token]` tras RF-01). Este requerimiento la especifica con más
> detalle de diseño y contenido; no crea una ruta nueva.

## Qué pide el cliente

Tras un pago aprobado, mostrar una pantalla de celebración/confirmación con:
1. Logo de la marca.
2. Mensaje de celebración ("¡Ya estás participando!") + confirmación de que el pago se
   recibió correctamente.
3. Los números asignados, mostrados de forma destacada.
4. Personalización con el nombre de quien compró ("Gracias, {nombre}").
5. Botón para unirse al canal de WhatsApp de la marca.
6. Texto sugiriendo hacer una captura de pantalla para guardar los números.
7. Texto avisando que, al finalizar la dinámica, se publicará el listado de participantes y
   números en el canal de WhatsApp.

## Especificación de contenido y comportamiento

**Encabezado:**
- Logo (el SVG de RF-10, si ya está disponible; si no, placeholder temporal a reemplazar).
- Texto fijo: "🎉 ¡Ya estás participando!"
- Subtítulo fijo: "Tu pago fue recibido correctamente. 💖"

**Bloque de números asignados:**
- Título fijo: "🍀 ¡Estos son tus números!"
- **Diferencia clave respecto a la referencia:** la captura muestra un solo número porque esa
  compra fue de 1 número. El sistema debe soportar **una o más** compras por persona: si
  compró varios, se muestran **todos** los números asignados, como badges individuales,
  **ordenados de menor a mayor**, no solo el primero.
- Debajo o al lado de los números: "💖 Gracias, **{nombre_completo}**" (nombre cargado en el
  formulario de compra, tal como está en la base, sin alterar mayúsculas/minúsculas que haya
  ingresado la persona).

**Botón de canal de WhatsApp:**
- Botón destacado (ej. verde, ícono de chat): "💬 Unirme al canal de WhatsApp".
- Abre el link del canal de WhatsApp de la marca en una pestaña/app nueva.
- **Bloqueante:** falta el link real del canal de WhatsApp de este cliente. No usar un link de
  ejemplo ni `#` — pedirlo antes de cerrar este ítem. Si el cliente no tiene canal de WhatsApp
  (es una función de WhatsApp distinta a un grupo común), confirmar si en su caso debe ser un
  link a un grupo o a un canal, porque cambia el formato del link.

**Textos de cierre (fijos, no configurables por el admin):**
- "✨ Hacé una captura de pantalla para guardar tus númeritos."
- Mantener además lo ya definido en `CONTEXT.md` 9.3: un aviso de que el enlace de esta
  pantalla es privado y conviene guardarlo para volver a consultarlo. La sugerencia de
  captura de pantalla no reemplaza esto, lo complementa (la captura es un respaldo rápido;
  el enlace privado sigue siendo la forma "oficial" de volver a ver los números).

## ⚠️ Pregunta abierta — confirmar con el cliente antes de implementar

El texto "cuando finalice la dinámica, publico el listado completo de participantes y los
números asignados en mi canal de WhatsApp" implica exponer **nombre + número** de cada
participante públicamente. Esto contradice la regla ya definida en `CONTEXT.md` (sección 7):
*"en resultados públicos se muestra solo el número ganador, nunca el teléfono ni otros datos;
los datos de participantes nunca se exponen al público"*.

Dos caminos posibles, hay que elegir uno antes de escribir este texto en la pantalla real:

- **Opción A — el cliente sí quiere publicar el listado completo con nombres.** En ese caso
  es una decisión de negocio válida (es su propio canal, su propia audiencia), pero hay que
  dejar constancia de que cambia la postura de privacidad que veníamos usando en todo el
  proyecto, y conviene que quede aclarado en las bases y condiciones que la persona acepta al
  comprar (consentimiento explícito para publicar su nombre).
- **Opción B — se ajusta el texto para no prometer algo que el sistema no hace.** Por ejemplo:
  "cuando finalice la dinámica, el resultado se publica en el canal de WhatsApp" (sin
  mencionar que se publican nombres de todos los participantes), manteniendo la privacidad ya
  definida.

**No implementar este texto literal en producción sin que el cliente elija una opción.**
Mientras tanto, se puede dejar como placeholder/comentario en el código.

**Nota aparte, no bloqueante:** esta publicación del listado (si se confirma la Opción A) es
una acción manual del admin fuera de la app (publica él mismo en su canal de WhatsApp), no
un feature a construir. El admin ya cuenta con la exportación de participantes del panel
admin (definida en el plan original) para armar ese listado si lo necesita. No hay que
construir un botón de "publicar en WhatsApp" automático salvo que el cliente lo pida
explícitamente como una funcionalidad nueva.

## Criterio de aceptación

- [ ] La pantalla se muestra automáticamente al volver de un pago aprobado (mismo mecanismo
      de redirect ya definido en `CONTEXT.md`/RF-07), y también al reabrir el enlace privado
      más tarde.
- [ ] Si la compra incluyó más de un número, se muestran **todos**, ordenados ascendentemente,
      no solo uno.
- [ ] El nombre mostrado es el cargado en el formulario, sin datos de otros participantes.
- [ ] El botón de WhatsApp usa el link real del canal/grupo del cliente (una vez provisto) y
      abre en una pestaña nueva.
- [ ] El texto sobre la publicación del listado completo refleja la opción (A o B) que el
      cliente haya confirmado explícitamente — no se deja el texto de la referencia "tal cual"
      por defecto.
- [ ] Se mantiene el aviso de guardar el enlace privado, además de la sugerencia de captura de
      pantalla.
- [ ] Mobile-first: todos los elementos visibles y legibles sin scroll horizontal en un
      viewport chico (320–375px de ancho).
- [ ] Si `CONTEXT.md`/RF-08 (dark mode) ya está implementado, esta pantalla también tiene
      variante oscura legible.

## Resumen para el agente

| Elemento | Estado |
|---|---|
| Estructura general de la pantalla (logo, celebración, números, nombre) | Listo para implementar |
| Soporte para múltiples números ordenados | Listo para implementar — ajuste sobre lo que muestra la referencia |
| Botón de canal de WhatsApp | Bloqueante: falta el link real |
| Texto de publicación del listado completo | Bloqueante: falta decisión del cliente (Opción A o B) sobre privacidad |
| Sugerencia de captura de pantalla + aviso de enlace privado | Listo para implementar |
