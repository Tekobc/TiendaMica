# CONTEXT.md — App Web de Sorteos (Adonai BY TIENDA MICA)

> Documento de contexto para agentes de desarrollo (Claude Code / Antigravity).
> Basado en: "Presupuesto Formal — Cotización #2026-009" y "Plan de Producto v1.0" del cliente.
> Este documento es la fuente de verdad técnica. Si algo en el código contradice esto, gana este documento hasta que se actualice explícitamente.

## 0. Cómo usar este documento (para el agente)

1. Leé completo este archivo antes de escribir la primera línea de código.
2. Empezá por la Fase 1 (sección 14). No implementes funcionalidad de fases posteriores aunque parezca "fácil de agregar ahora": cada fase corresponde a un hito de pago real con el cliente.
3. Las Reglas de Negocio (sección 7) son restricciones duras, no sugerencias. Si una decisión de implementación entra en conflicto con una RN, la RN gana.
4. Sección 15 ("Gaps y decisiones del developer") documenta desviaciones deliberadas respecto al plan original del cliente, con la razón. No las deshagas sin entender por qué están.
5. Ante cualquier ambigüedad no cubierta acá, preferí la opción más simple que no comprometa las reglas de negocio ni la seguridad, y dejala anotada en "Preguntas abiertas" (sección 17) en vez de inventar un comportamiento silenciosamente.

---

## 1. Contexto del proyecto

**Cliente:** Adonai BY TIENDA MICA (emprendimiento, rubro indumentaria/regalos, sin sitio web propio actualmente).
**Dominio final:** `tiendamica.com.ar`, la app se sirve en el subpath `/sorteos`.
**Objetivo de negocio:** reemplazar la gestión manual de rifas/sorteos (anotaciones a mano, transferencias, WhatsApp) por una plataforma que cobra, asigna números y gestiona ganadores de forma automática, sin errores de anotación ni sobreventa.

**Lo que el cliente NO tiene hoy:** dominio (sera servidor en vercel) ni sitio web, base de datos de clientes, proceso de cobro automatizado. Esta app es su primer producto digital, no una migración de un sistema existente.

---

## 2. Objetivo y alcance de esta versión (v1 / Fase 1 del contrato)

### Incluido
- Un único sorteo activo a la vez, configurado por el administrador (premio, precio por número, cantidad total de números).
- Pantalla pública mobile-first con tablero de disponibilidad, barra de progreso e historial de sorteos anteriores.
- Formulario de compra (nombre, teléfono, cantidad) con avance dinámico entre campos.
- Pago único por Mercado Pago (aunque se compren varios números).
- Asignación automática y secuencial de números al confirmarse el pago.
- Pantalla privada del participante ("mis números"), accesible por enlace con token no adivinable.
- Panel de administración con login exclusivo por Google (whitelist verificada en servidor).
- Carga única e inalterable del número ganador, con contacto directo por WhatsApp al ganador.

### Explícitamente fuera de alcance (no lo implementes en esta fase)
- Verificación de teléfono por SMS.
- Múltiples salas/sorteos simultáneos.
- Cupones de descuento.
- Venta de productos físicos / e-commerce (el dominio se diseña escalable a esto, pero no se construye ahora).
- Ruleta o bolillero animado dentro de la app: el resultado del sorteo se determina **fuera** de la app (Lotería Nacional, sorteo físico, etc.) y el admin solo lo **carga**.

---

## 3. Perfiles de usuario

| Perfil | Acceso | Qué puede hacer |
|---|---|---|
| Participante (público) | Enlace directo, sin cuenta ni contraseña | Ver disponibilidad y progreso, comprar números, ver "mis números" vía enlace privado, ver historial de sorteos pasados |
| Administrador | Login con Google, restringido a whitelist verificada en servidor | Configurar el sorteo, ver participantes y recaudación, contactar por WhatsApp, cargar el ganador, abrir un nuevo sorteo |

No hay perfil de "moderador" ni roles intermedios en esta versión: es admin o público.

---

## 4. Decisiones técnicas y stack

| Componente | Elección | Por qué | Alternativa descartada |
|---|---|---|---|
| Frontend + backend | Next.js (App Router), TypeScript | Server Actions permiten mantener cálculo de precios y reglas críticas en servidor sin levantar un backend aparte; despliegue directo a Vercel | Backend separado (Express/NestJS): peso innecesario para este volumen y alcance |
| Hosting | Vercel, dominio propio del cliente en `/sorteos` | Ya definido en el contrato con el cliente | — |
| Base de datos | Supabase (Postgres) con Row Level Security | Auth integrada, Postgres real (permite funciones transaccionales para la reserva de números), RLS para que el frontend público nunca pueda leer datos de otros participantes | Firebase: peor ajuste para relaciones y transacciones atómicas que necesitamos en la reserva de números |
| Autenticación admin | Supabase Auth con proveedor Google, whitelist de emails validada en servidor | Sin manejo de contraseñas propio; pero el login de Google por sí solo NO autoriza — ver sección 10 | — |
| Pagos | Mercado Pago Checkout Pro (Preference API) + Webhooks | Estándar en Argentina, acredita medios inmediatos | Checkout API transparente: más superficie de PCI/seguridad sin necesidad real acá |
| Estilos | Tailwind CSS | Mobile-first rápido de iterar | — |

---

## 5. Arquitectura (vista general)

[Participante, celular]
│ enlace público /sorteos
▼
[Next.js — páginas públicas] ──Server Action──▶ [Postgres: función reserva atómica]
│
▼ (redirect)
[Mercado Pago Checkout Pro]
│ webhook (pago aprobado)
▼
[Next.js — route handler /api/mp/webhook] ──valida contra API de MP──▶ [Postgres: confirmar pago + asignar números]
│
▼ (redirect post-pago)
[Pantalla privada del participante] (token no adivinable en la URL)

[Administrador, Google Auth] ──▶ [Panel /admin, protegido server-side] ──▶ [Postgres, mismas tablas, con service role]


---

## 6. Modelo de datos

```sql
-- Un sorteo. Solo puede existir UNO con estado != 'finalizado'/'cancelado' (RN-01).
create table sorteos (
  id uuid primary key default gen_random_uuid(),
  premio text not null,
  precio_numero numeric(12,2) not null check (precio_numero > 0),
  cantidad_numeros integer not null check (cantidad_numeros > 0),
  descripcion_auto text, -- generada, no editable a mano
  estado text not null default 'activo' check (estado in ('activo','completo','sorteado','cancelado')),
  bloqueado boolean not null default false, -- true tras la primera venta aprobada (RN-02)
  numero_ganador integer,
  ganador_cargado_at timestamptz,
  ganador_cargado_por text, -- email del admin
  created_at timestamptz not null default now()
);

-- Máximo un sorteo activo/completo a la vez (RN-01)
create unique index un_sorteo_activo on sorteos ((true))
  where estado in ('activo','completo');

-- Una compra = un pago = uno o más números
create table compras (
  id uuid primary key default gen_random_uuid(),
  sorteo_id uuid not null references sorteos(id),
  nombre_completo text not null,
  telefono text not null,
  cantidad integer not null check (cantidad > 0),
  monto_total numeric(12,2) not null,
  estado_pago text not null default 'reservado'
    check (estado_pago in ('reservado','pagado','vencido','fallido','reembolsado')),
  mp_preference_id text,
  mp_payment_id text unique, -- unicidad = idempotencia del webhook (ver sección 11)
  token_acceso text not null unique, -- para la pantalla privada del participante
  reservado_hasta timestamptz not null, -- ahora() + 10 min al crear (RN-05)
  created_at timestamptz not null default now()
);

-- Números individuales. Se pre-generan al crear el sorteo (1..cantidad_numeros)
create table numeros (
  id uuid primary key default gen_random_uuid(),
  sorteo_id uuid not null references sorteos(id),
  numero integer not null,
  compra_id uuid references compras(id), -- null = disponible
  unique (sorteo_id, numero)
);

-- Índice único PARCIAL: un número solo puede estar "tomado" por una compra
-- activa (reservada o pagada) a la vez. Esto es lo que evita la doble venta,
-- no una unique constraint simple (ver sección 15, gap #1).
create unique index un_numero_activo on numeros (sorteo_id, numero)
  where compra_id is not null;

create table admins_whitelist (
  email text primary key
);
```

RLS (resumen, ajustar sintaxis exacta al implementar):
- `sorteos`, `numeros`: lectura pública permitida solo de columnas no sensibles (nunca se expone `compras` completa al público).
- `compras`: **sin** acceso público de lectura directa. La pantalla del participante se sirve vía Server Action que valida el `token_acceso` y devuelve solo los campos necesarios (no expone teléfono de otros).
- Todo `insert`/`update` de `compras` y `numeros` pasa por Server Actions o el webhook, nunca directo desde el cliente con la anon key.
- El panel admin usa la `service_role` key **solo en servidor** (Server Actions / route handlers), nunca en un componente cliente.

---

## 7. Reglas de negocio

Numeración original del cliente (RN-01 a RN-07) + ampliaciones necesarias marcadas con 🔧.

| Código | Regla |
|---|---|
| RN-01 | Un único sorteo activo o completo a la vez. Al finalizar (sorteado/cancelado), pasa a historial y se habilita crear uno nuevo. |
| RN-02 | Al registrarse el **primer pago aprobado**, `precio_numero`, `premio` y `cantidad_numeros` quedan inmutables (`bloqueado = true`). |
| RN-03 | El monto a pagar se calcula siempre en el servidor (`cantidad * precio_numero`), nunca se confía en un monto enviado desde el cliente. |
| RN-04 | Los números se asignan de forma automática y secuencial (los siguientes disponibles en orden), al confirmarse el pago. |
| RN-05 | Reserva de 10 minutos: al iniciar el checkout, los números elegidos quedan en estado `reservado`. Si no se paga en ese plazo, se liberan. |
| RN-06 | Anti-sobreventa: si un pago se aprobara sin números disponibles, se ejecuta reembolso automático vía API de Mercado Pago y se notifica al admin. |
| RN-07 | El número ganador se carga **una sola vez**, queda inalterable, y se registra quién y cuándo lo cargó. |
| 🔧 RN-08 | Tope máximo de números por compra, configurable por el admin al crear el sorteo (evita que una sola persona reserve el sorteo completo por error o abuso). |
| 🔧 RN-09 | Solo se aceptan medios de pago de acreditación inmediata en Mercado Pago (tarjeta, dinero en cuenta). Se excluyen medios que acreditan en días (rapipago/pagofácil), porque bloquearían números por tiempo indefinido. |
| 🔧 RN-10 | Límite de reservas activas simultáneas por IP/dispositivo (protección anti-abuso, ver sección 15 gap #3, ya que no hay verificación por SMS). |
| 🔧 RN-11 | El teléfono se valida por formato (celular argentino) pero no se verifica su titularidad. El admin puede corregirlo manualmente desde el panel si detecta un error evidente. |

---

## 8. Flujo crítico: reserva → pago → asignación

Esto es lo más delicado técnicamente del proyecto. Implementarlo mal produce doble venta o números fantasma.

**Paso 1 — Reserva (Server Action, transaccional):**

función reservar_numeros(sorteo_id, cantidad):
dentro de una transacción:
- liberar reservas vencidas de ESTE sorteo (reservado_hasta < ahora())
→ poner compra.estado_pago = 'vencido' y numeros.compra_id = null
- contar números disponibles (compra_id is null)
- si disponibles < cantidad: error "no hay stock suficiente"
- crear fila en compras (estado_pago='reservado', reservado_hasta=ahora()+10min,
monto_total = cantidad * sorteo.precio_numero ← calculado acá, no recibido del cliente)
- tomar los cantidad números de menor numeración con compra_id is null
y asignarles compra_id (esto es lo que el índice único parcial protege
de condiciones de carrera entre dos requests simultáneos)
- devolver token_acceso y preference_id a crear en MP

Todo esto debe ocurrir en una única función de Postgres (`plpgsql`) o con locking explícito (`select ... for update skip locked` sobre los números candidatos) para que dos compras simultáneas no tomen el mismo número. **No implementar esto como varias queries separadas desde Next.js.**

**Paso 2 — Checkout:** se crea la preferencia de Mercado Pago con `external_reference = compra.id` y `back_urls` apuntando a la pantalla del participante con el token.

**Paso 3 — Webhook (route handler):**

al recibir notificación de MP:

NO confiar en el payload del webhook por sí solo
re-consultar el pago contra la API de Mercado Pago usando el payment_id recibido
verificar que mp_payment_id no exista ya en compras (idempotencia: el
webhook puede llegar duplicado)
verificar que el monto pagado coincida con compra.monto_total
si status = approved:
si la reserva sigue vigente (reservado_hasta no venció) y los números
siguen asignados a esta compra → marcar compra.estado_pago='pagado',
guardar mp_payment_id
si la reserva venció y los números fueron liberados/re-tomados por
otra compra (RN-06, caso borde) → ejecutar reembolso automático vía
API de MP y notificar al admin
si status = rejected → compra.estado_pago='fallido', liberar números

**Paso 4 — Bloqueo de configuración (RN-02):** al pasar la primera compra a `estado_pago='pagado'`, un trigger o la misma transacción del webhook pone `sorteos.bloqueado = true`.

---

## 9. Especificación de pantallas (mobile-first)

### 9.1 Home pública (`/sorteos`)
- Identidad visual del cliente (paleta a definir con el cliente — el PDF menciona "rosa/botánica" como referencia, confirmar antes de fijar tokens de diseño).
- Encabezado con descripción autogenerada: `"Sorteo de {premio} — {precio_numero} por número"`.
- Barra de progreso: `"Faltan {disponibles} números para el sorteo"`.
- Tablero de números: grilla simple, dos estados visuales únicamente (disponible / ocupado). **Nunca mostrar quién ocupó cada número.**
- Bloque de historial: sorteos pasados con fecha, premio y número ganador. Sin nombres.
- Link a bases y condiciones.
- CTA "Comprar números" → abre el formulario.

### 9.2 Formulario de compra
- Campos en este orden: nombre completo → teléfono (teclado numérico) → cantidad.
- Avance automático de foco al completar cada campo (no solo con el botón "Siguiente" del teclado: also on valid blur/length).
- Validación en vivo: formato de teléfono, cantidad entre 1 y el tope RN-08, y no mayor a los disponibles.
- Total calculado y mostrado en tiempo real (`cantidad * precio_numero`), pero el valor real que se cobra se recalcula en servidor al reservar (RN-03).
- Checkbox único: mayoría de edad + aceptación de bases y condiciones (obligatorio para habilitar "Pagar").
- Botón "Pagar con Mercado Pago" → dispara la reserva (sección 8, paso 1) y redirige al checkout.

### 9.3 Pantalla del participante (post-pago, `/sorteos/mis-numeros/[token]`)
- Misma disposición visual que la Home, pero con los números de esta compra resaltados como "Tus números".
- Estados: pago confirmado / en procesamiento / fallido con botón de reintentar.
- Barra de progreso igual que en Home.
- Mensaje sugiriendo guardar el enlace (no hay login, el token en la URL es el único acceso).

### 9.4 Panel admin (`/admin`, protegido)
- Configuración inicial del sorteo: premio, precio, cantidad, tope por compra. Deshabilitado para edición si `bloqueado = true` (mostrar por qué).
- Métricas: vendidos / disponibles, recaudación total, pagos pendientes/vencidos.
- Tabla de participantes: nombre, teléfono, cantidad, números asignados (ordenados), fecha, estado de pago. Buscador por nombre/teléfono/número. Exportar CSV.
- Ícono de WhatsApp por fila → `https://wa.me/{telefono}?text={mensaje_predefinido}`.
- Módulo de carga del ganador: input de número + confirmación (una sola vez, sin edición posterior — RN-07). Al cargarlo, resalta a la persona correspondiente con su botón de WhatsApp.
- Botón "Abrir nuevo sorteo" (solo visible si el actual está en estado `sorteado` o `cancelado`).

---

## 10. Autenticación y seguridad del admin

**Importante:** "iniciar sesión con Google" no es, por sí solo, una autorización. Cualquiera con cuenta de Google puede loguearse. La autorización real es la whitelist:

al entrar a cualquier ruta /admin/*:

verificar sesión de Supabase Auth válida
verificar que el email de la sesión existe en admins_whitelist
esta verificación se hace en middleware/Server Component del servidor,
NUNCA solo en el cliente (un check solo en el cliente se bypassea
editando el JS)
si no está en la whitelist → 403, sin importar que el login de Google
haya sido exitoso

Otras medidas:
- La `service_role` key de Supabase solo se usa en Server Actions/route handlers, nunca llega al navegador.
- El token de acceso del participante (`token_acceso`) se genera con suficiente entropía (ej. `crypto.randomUUID()` o equivalente), no es secuencial ni derivable del teléfono.
- No existe endpoint que permita buscar una compra por teléfono desde el lado público (evita exponer datos de otra persona).

---

## 11. Integración con Mercado Pago

- Usar el SDK oficial de Mercado Pago para Node.
- Crear la preferencia con `external_reference = compras.id`.
- El webhook debe:
  - Responder rápido (Vercel tiene límite de tiempo de ejecución en funciones) — hacer el trabajo pesado async si hace falta, pero confirmar recepción rápido.
  - Volver a consultar el pago contra la API de MP con el `payment_id`, nunca confiar ciegamente en el cuerpo de la notificación (los webhooks pueden ser spoofeados si no se valida el origen/firma).
  - Ser idempotente: `mp_payment_id` es `unique` en la tabla `compras`; si el webhook llega dos veces, el segundo intento debe ser un no-op seguro.
- Filtrar métodos de pago habilitados en la preferencia para excluir los de acreditación diferida (RN-09).
- Manejar y loguear explícitamente los estados: `approved`, `rejected`, `in_process`, `refunded`.

---

## 12. Variables de entorno (referencia)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # solo servidor
MP_ACCESS_TOKEN= # solo servidor
MP_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=https://tiendamica.com.ar
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

No commitear ninguna de estas. `.env.local` en `.gitignore`.

---

## 13. Estructura de carpetas propuesta

/app
/sorteos
page.tsx # Home pública
/mis-numeros/[token]/page.tsx
/admin
layout.tsx # chequeo de whitelist acá
page.tsx # dashboard/config
/participantes/page.tsx
/api
/mp/webhook/route.ts
/lib
/supabase (server.ts, client.ts, admin.ts)
/mercadopago.ts
/actions (reservar-numeros.ts, confirmar-ganador.ts, ...) # Server Actions
/db
/migrations (SQL de la sección 6)


---

## 14. Plan de construcción por fases (mapeado a los hitos del contrato)

**Fase 1 — corresponde al Hito 1 (Seña):**
- Setup del repo Next.js + Supabase, migraciones de la sección 6.
- Identidad visual básica (colores/tipografía a confirmar con el cliente).
- Home pública: tablero, barra de progreso, historial (con datos mock/seed).
- Bases y condiciones (contenido a definir con el cliente).

**Fase 2 — corresponde al Hito 2 (MVP funcional):**
- Formulario de compra completo con avance dinámico y validaciones.
- Función de reserva atómica (sección 8, paso 1).
- Integración Mercado Pago en modo sandbox/test.
- Webhook con validación e idempotencia (sección 8, pasos 3 y 4).
- Panel admin: login + whitelist, configuración de sorteo, tabla de participantes con WhatsApp.
- **Entregable de este hito: circuito completo funcionando con credenciales de prueba de MP, no con dinero real.**

**Fase 3 — corresponde al Hito 3 (Entrega final):**
- Pasaje a credenciales reales de Mercado Pago.
- Deploy final en Vercel con dominio `tiendamica.com.ar/sorteos`.
- Módulo de carga de ganador (RN-07).
- Pruebas de anti-sobreventa y reembolso automático (RN-06) con casos simulados.
- Checklist de QA (sección 16) antes de considerar el hito cerrado.

---

## 15. Gaps y decisiones del developer respecto al plan del cliente

El plan de producto y el presupuesto del cliente son sólidos como especificación funcional, pero como especificación **técnica** dejan sin resolver algunos puntos que, si se implementan de forma ingenua, generan bugs reales de producción. Documento acá las decisiones tomadas y por qué:

1. **"Asignación secuencial" (RN-04) no alcanza para evitar doble venta.** Una unique constraint simple sobre `(sorteo_id, numero)` fallaría si una reserva vence y el número debería volver a estar disponible sin violar la constraint. Se resuelve con el índice único **parcial** de la sección 6 (`where compra_id is not null`) más locking (`for update skip locked`) dentro de una única transacción. Esto es lo que de verdad implementa RN-05 y RN-06 sin condiciones de carrera.

2. **El webhook de Mercado Pago no debe ser la fuente de verdad por sí solo.** El plan dice "validación de cobros contra la API de Mercado Pago", que es correcto, pero hay que ser explícito: el payload del webhook es una notificación de "andá a mirar", no el dato en sí. Siempre se re-consulta el pago por su ID antes de dar nada por confirmado. Además, se agregó idempotencia explícita vía `mp_payment_id unique`, porque los webhooks de MP pueden reintentar la misma notificación.

3. **Sin verificación por SMS, el formulario público es un vector de abuso.** Cualquiera puede iniciar reservas repetidas de 10 minutos sin intención de pagar, bloqueando números para otros. Se agregó RN-10 (límite de reservas activas por IP/dispositivo) como mitigación mínima para esta versión. No se implementó reCAPTCHA en esta fase por simplicidad, pero queda como mejora de Fase 2 si se detecta abuso real.

4. **Falta un tope máximo por compra en el plan original.** Se agregó como RN-08: sin él, una sola persona (o un error de tipeo) podría absorber todo el sorteo en una compra, lo cual además complica la lógica de reembolso si falla el pago.

5. **RN-09 (medios de pago) estaba mencionado como "prevención estricta de sobreventa" en el presupuesto pero no como regla explícita en el plan de producto.** Se formalizó: sin restringir a medios de acreditación inmediata, un pago en efectivo (Rapipago/Pago Fácil) mantendría números "reservados" por días, rompiendo la promesa de la reserva de 10 minutos.

6. **El plan no especifica qué pasa si el admin necesita corregir un teléfono mal cargado.** Como no hay verificación, es inevitable que ocurra. Se previó edición manual del teléfono desde el panel (sin tocar números ni montos, que están bloqueados por RN-02).

7. **Ambiente de pruebas vs producción no estaba explícito en el cronograma.** El Hito 2 dice "MVP funcional con checkout de Mercado Pago"; se interpretó como MVP en modo sandbox, y el pasaje a credenciales reales como parte explícita del Hito 3, para no cobrar dinero real durante la etapa de pruebas del cliente.

---

## 16. Checklist de QA antes de pasar a producción (Fase 3)

- [ ] Dos compras simultáneas por el mismo número no pueden ambas tener éxito (probar con requests concurrentes reales, no solo secuenciales).
- [ ] Una reserva vencida efectivamente libera el número y permite que otra persona lo compre.
- [ ] El webhook duplicado (mismo `payment_id` recibido dos veces) no duplica la asignación de números ni el registro de la compra.
- [ ] Un monto manipulado desde el cliente (DevTools) no afecta lo que efectivamente se cobra.
- [ ] Un usuario sin email en la whitelist no puede acceder a `/admin` aunque inicie sesión con Google correctamente.
- [ ] La configuración del sorteo queda bloqueada apenas se aprueba el primer pago.
- [ ] El número ganador, una vez cargado, no tiene ningún camino de UI ni de API que permita editarlo.
- [ ] Los datos de otros participantes nunca son accesibles desde la pantalla pública ni desde la pantalla de un participante distinto.
- [ ] Probar el caso de reembolso automático simulando una aprobación de pago sin stock disponible.

---

## 17. Preguntas abiertas (confirmar con el cliente antes o durante la Fase 1)

- Paleta de colores y tipografía definitivas (el plan menciona "rosa/botánica" como referencia, no como especificación final).
- Texto definitivo de bases y condiciones.
- Tope máximo de números por compra (RN-08): valor a definir según la cantidad total del primer sorteo.
- Mensaje predefinido del botón de WhatsApp hacia compradores y hacia el ganador invitando al grupo de wsp que ya tiene la comunidad.
- Confirmación de que la cuenta de Mercado Pago del cliente acepta esta actividad (rifas/sorteos) sin restricciones.
- Autorización legal para operar el sorteo (fuera del alcance técnico, pero condiciona el go-live).

---

## 18. Cómo usar esto con Claude Code / Antigravity

- **Claude Code:** guardá este archivo como `CLAUDE.md` en la raíz del repo. Se carga automáticamente como contexto persistente en cada sesión.
- **Antigravity:** pegalo como contexto inicial del workspace o como primer mensaje del agente antes de pedir la implementación de la Fase 1.
- En ambos casos, arrancá pidiendo explícitamente: *"Implementá la Fase 1 según CONTEXT.md, sección 14. No avances a Fase 2 sin confirmación."* — así evitás que el agente intente resolver todo de una vez.

Eso es todo el documento. Un par de notas rápidas

El gap más importante que agregué es el del índice único parcial + locking para la reserva de números (sección 15, punto 1). Es el tipo de bug que no aparece en pruebas manuales pero sí el día que hay tráfico real simultáneo — y para este proyecto, con venta de rifas donde varias personas pueden entrar a la vez, es justamente el escenario esperable.
Dejé la sección 17 con las preguntas que el cliente todavía no cerró en sus propios documentos (colores exactos, tope por compra, mensaje de WhatsApp)