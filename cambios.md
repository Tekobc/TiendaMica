# cambios.md — Devolución post-MVP

> Requerimientos funcionales derivados de la devolución del cliente tras la entrega del MVP.
> Referencia: `CONTEXT.md` (documento base del proyecto). Estos cambios modifican o amplían
> lo definido ahí. Ante cualquier conflicto entre este documento y `CONTEXT.md`, gana este
> documento por ser más reciente.

---

## RF-01 — Renombrar ruta `/sorteos` → `/dinamica`

**Qué cambiar:**
- Ruta pública: `/sorteos` → `/dinamica`
- Ruta de participante: `/sorteos/mis-numeros/[token]` → `/dinamica/mis-numeros/[token]`
- Cualquier redirect, back_url de Mercado Pago, link compartible y referencia interna que apunte a `/sorteos`.

**Criterio de aceptación:**
- [ ] Ningún enlace activo del sitio apunta a `/sorteos`.
- [ ] Las `back_urls` de la preferencia de Mercado Pago usan `/dinamica/...`.
- [ ] Si existe tráfico o links ya compartidos a `/sorteos`, agregar un redirect 308 de `/sorteos` → `/dinamica` (no dejarlo roto).

---

## RF-02 — Renombrar "Sorteo" → "Dinámica" en toda la UI y textos

**Qué cambiar:**
- Todo texto visible al usuario: "Sorteo" → "Dinámica", "números del sorteo" → "números de la dinámica", "sorteo activo" → "dinámica activa", etc.
- No es necesario renombrar entidades internas del código (tablas, variables) si ya existen como `sorteos` — eso es refactor interno, no un requerimiento funcional. Lo que cambia es el **texto visible**, no el esquema (salvo lo indicado en RF-04 sobre nuevos campos).

**Criterio de aceptación:**
- [ ] Revisión completa de UI (Home, formulario, pantalla de participante, panel admin, mensajes de WhatsApp, emails/notificaciones si existen): cero apariciones de la palabra "Sorteo" de cara al usuario.
- [ ] Metadatos de la página (`<title>`, OG tags) también actualizados.

---

## RF-03 — Formulario de compra visible de inmediato (sin pasos previos)

**Decisión adoptada:** formulario de compra **embebido directamente en la Home**, visible sin scroll al abrir el link. Se descarta el modal automático al cargar, porque los navegadores internos de redes sociales (Instagram, WhatsApp) a veces bloquean o no disparan popups automáticos, y es un patrón asociado a publicidad. El formulario embebido logra el mismo objetivo (cero clics para llegar a él) sin ese riesgo.

**Qué construir:**
- La Home muestra el formulario de compra (nombre, teléfono, cantidad) **arriba**, visible sin scroll, apenas se carga la página.
- El tablero de números y demás contenido secundario quedan debajo del formulario, no antes.
- Se elimina cualquier paso intermedio tipo "ver detalle → botón comprar → formulario".

**Criterio de aceptación:**
- [ ] Al abrir el link en un celular, el formulario de compra es visible sin necesidad de scroll ni de tocar ningún botón previo.
- [ ] El flujo pasa de 3 pasos (ver home → tocar comprar → completar formulario) a 1 paso (completar formulario directamente).

---

## RF-04 — Configuración simple de la dinámica + descripción corta y genérica

**Campos de configuración en el panel admin:**

| Campo | Ejemplo | Tipo |
|---|---|---|
| Título | "Gran Rifa" | Texto corto, editable por el admin |
| Descripción | "Participá comprando tu número" | Texto corto, editable por el admin |
| Premio | "3 BENDECIDAS" | Texto corto, editable por el admin |
| Precio por número | — | Numérico (ya existente) |
| Cantidad de números | — | Numérico (ya existente) |

**Qué cambia respecto al MVP:**
- La descripción deja de autogenerarse combinando premio + precio en un párrafo explicativo. Pasa a ser un **campo de texto libre y corto** que carga el admin (ej. "Participá comprando tu número"), pensado como bajada de título, no como instructivo operativo.
- Toda la explicación operativa ("se paga por Mercado Pago", "el número se asigna automáticamente") se saca de la Home, porque ya vive en el formulario de compra, donde es más útil (justo antes de que la persona pague).
- En la Home solo se muestran: **Título**, **Descripción corta**, **Premio** y el precio por número. Nada de párrafo largo ni instructivo.

**Dónde va la explicación operativa ahora:** dentro del formulario de compra, como texto de apoyo breve cerca del botón de pago (ej. nota al pie: "Pago seguro con Mercado Pago · Tu número se asigna automáticamente al confirmarse el pago"). Este texto **no es configurable por el admin** — es texto fijo de la UI del formulario, por ser información operativa del sistema y no contenido editable por dinámica.

**Criterio de aceptación:**
- [ ] El admin puede configurar Título, Descripción corta y Premio como campos de texto independientes al crear/editar la dinámica (mientras no esté bloqueada por RN-02 de `CONTEXT.md`).
- [ ] La Home muestra Título + Descripción corta + Premio + Precio, sin párrafo explicativo adicional.
- [ ] El formulario de compra incluye, de forma fija (no editable por el admin), la mención a pago seguro por Mercado Pago y asignación automática del número.
- [ ] Verificar que esa explicación no quede duplicada en ningún otro lugar de la Home.

**Impacto en el modelo de datos:** la tabla `sorteos` (o `dinamicas`, según el renombre de RF-02) pasa de tener `descripcion_auto` (generada) a tener `titulo` y `descripcion` como campos editables de texto libre, cargados por el admin. Reflejar este cambio en la migración correspondiente.

---

## RF-05 — Barra de progreso dentro del formulario de compra

**Qué cambiar:**
- La barra de progreso ("Faltan X números para la dinámica") se muestra **dentro** del bloque del formulario de compra, no en una sección aparte de la Home.

**Criterio de aceptación:**
- [ ] La barra de progreso es visible en el mismo viewport que el formulario, sin necesidad de scroll adicional.
- [ ] Se sigue actualizando en tiempo real (o al menos al cargar la página) según números vendidos.

---

## RF-06 — Mover el historial de dinámicas anteriores al panel admin

**Qué cambiar:**
- Sacar el bloque de "Historial de sorteos/dinámicas pasadas" de la Home pública.
- Agregarlo como una nueva sección dentro de `/admin` (ej. `/admin/historial`), visible solo para el administrador logueado.

**Nota de alcance:** este cambio modifica un principio del plan original, donde el historial era parte de la transparencia pública (que cualquiera pueda verificar dinámicas anteriores sin pedirle nada a nadie). Al moverlo a admin, esa transparencia deja de ser automática para el público. Es una decisión consciente del cliente, priorizando minimizar todo lo que no sea el formulario de compra (coherente con RF-03).

**Criterio de aceptación:**
- [ ] El historial ya no aparece en `/dinamica` (Home pública).
- [ ] El historial aparece en una sección del panel admin, con los mismos datos que tenía antes (fecha, premio, número ganador).
- [ ] Sigue sin mostrar datos personales de participantes, ni en su ubicación anterior ni en la nueva.

---

## Resumen priorizado para el agente

| # | Requerimiento | Tipo de cambio |
|---|---|---|
| RF-01 | Ruta `/sorteos` → `/dinamica` | Routing |
| RF-02 | "Sorteo" → "Dinámica" en toda la UI | Textos/copy |
| RF-03 | Formulario de compra embebido arriba en la Home, sin pasos previos | UX/estructura de página |
| RF-04 | Título + Descripción corta + Premio configurables; se quita el párrafo autogenerado; explicación operativa pasa al formulario | Contenido + modelo de datos |
| RF-05 | Barra de progreso dentro del bloque del formulario | UX/layout |
| RF-06 | Historial pasa de Home pública a panel admin | Alcance/arquitectura de información |

