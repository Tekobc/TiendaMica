# RF-07 — Eliminar el concepto de "reserva": el pago es único y directo

> Requerimiento aislado. Modifica directamente `CONTEXT.md` (sección 8 — flujo crítico de
> reserva/pago/asignación — y la regla RN-05). Leer `CONTEXT.md` antes de implementar esto:
> este documento no repite todo ese contexto, solo especifica qué cambia y por qué.
> Ante cualquier conflicto entre este documento y `CONTEXT.md`, gana este documento.

## Qué pide el cliente

No debe existir ningún estado intermedio de "número reservado por 10 minutos" mientras se
espera el pago. El flujo es: la persona completa el formulario → paga → si el pago se aprueba,
recién ahí se le asignan números. No hay bloqueo previo de nada.

## Qué se elimina de `CONTEXT.md`

- **RN-05 ("Reserva de 10 Minutos") queda derogada.** Ya no aplica.
- El estado `reservado` y la columna `reservado_hasta` de la tabla `compras` dejan de existir.
- Se elimina cualquier job/cron de limpieza de reservas vencidas (liberar números al expirar
  la reserva), porque ya no hay nada que expire.
- Se elimina de la UI cualquier mención a "tu número queda reservado X minutos" (formulario
  de compra, mensajes de estado, pantalla del participante).
- Se elimina del índice único parcial sobre `numeros` cualquier lógica que dependa del estado
  `reservado` (ver nuevo modelo de datos más abajo).

## Cómo queda el flujo (reemplaza al de la sección 8 de `CONTEXT.md`)

1. La persona completa nombre, teléfono y cantidad.
2. Se calcula el monto en servidor (RN-03 se mantiene sin cambios: nunca se confía en un
   monto enviado desde el cliente).
3. Se crea la fila en `compras` con estado `pendiente` — **sin tocar la tabla `numeros`
   todavía**. No se reserva, no se bloquea, no se asigna nada en este paso.
4. Se la redirige a Mercado Pago (Checkout Pro), con `external_reference = compras.id`.
5. Webhook de Mercado Pago (esto **no cambia** respecto a `CONTEXT.md` sección 8, paso 3):
   - Re-consultar el pago contra la API de MP con el `payment_id`, nunca confiar solo en el
     payload del webhook.
   - Verificar idempotencia (`mp_payment_id unique` en `compras`, igual que antes).
   - Si `status = approved`: **recién en este momento** se asignan los números disponibles,
     de forma automática y secuencial (RN-04 se mantiene sin cambios), usando el mismo
     mecanismo de locking atómico (`for update skip locked` dentro de una transacción) ya
     definido en `CONTEXT.md` sección 8.
   - Si no hay stock suficiente al momento de la asignación → ver RN-06 más abajo.
   - Si `status = rejected`: la compra queda en `fallido`. No hay nada que liberar, porque
     nunca se tomó ningún número.

## Cambios al modelo de datos (sección 6 de `CONTEXT.md`)

```sql
-- ANTES (MVP actual, a modificar):
-- estado_pago in ('reservado','pagado','vencido','fallido','reembolsado')
-- reservado_hasta timestamptz not null

-- DESPUÉS:
alter table compras drop column reservado_hasta;

alter table compras drop constraint if exists compras_estado_pago_check;
alter table compras add constraint compras_estado_pago_check
  check (estado_pago in ('pendiente','pagado','fallido','reembolsado'));

-- Ajustar el valor por defecto:
alter table compras alter column estado_pago set default 'pendiente';
```

El índice único parcial sobre `numeros` (sección 6 de `CONTEXT.md`) se mantiene igual en su
estructura (`where compra_id is not null`), porque sigue siendo necesario: ahora protege la
asignación atómica en el momento del webhook, no en el momento de la reserva. La diferencia
es que `numeros.compra_id` solo se completa cuando el pago ya está aprobado, nunca antes.

## Impacto directo sobre RN-06 (anti-sobreventa) — leer con atención

Sin reserva previa, RN-06 deja de ser un caso borde raro y pasa a ser **el mecanismo
principal** de control de stock. Ejemplo concreto: dos personas pueden ver "5 disponibles",
ambas iniciar el pago por 5 números cada una, y ambas pagar antes de que el sistema
reaccione. En ese momento, la asignación atómica le da los números a la primera transacción
que llegue (vía el `for update skip locked` dentro de la función de asignación); a la
segunda —que ya pagó, pero ya no hay stock— se le dispara el reembolso automático contra la
API de Mercado Pago, y se notifica al admin.

Esto es una consecuencia esperada de sacar la reserva, **no un bug a corregir después**. La
reserva existía justamente para reducir la ventana en la que esto podía pasar. Al sacarla, el
sistema sigue siendo correcto (nadie se queda con un número que no le corresponde, y a quien
pagó de más se le reembolsa), pero la experiencia de esa segunda persona es peor: paga y
después se entera de que le devuelven la plata. El agente debe implementar el camino de
reembolso automático como parte central de este requerimiento, no como un extra opcional.

## Pregunta abierta — NO resolver por criterio propio, confirmar con el cliente antes de implementar

¿El contador público de "números disponibles" debe descontar los pagos iniciados pero aún
sin confirmar (estado `pendiente`), o solo los efectivamente pagados?

- **Opción A — no descontarlos (más simple):** el contador siempre refleja solo lo
  efectivamente vendido (`estado_pago = 'pagado'`). Puede mostrar más disponibilidad de la
  real mientras otra persona está pagando en paralelo.
- **Opción B — descontarlos mientras el pago está en curso:** evita mostrar disponibilidad
  de más, pero reintroduce una lógica temporal parecida a la reserva (aunque sin bloquear
  números, solo a efectos de cálculo del contador), y requiere definir qué pasa si una compra
  queda en `pendiente` para siempre (pago abandonado sin rechazo explícito de MP).

Esta decisión afecta directamente la barra de progreso (RF-05: "Faltan X números para la
dinámica"). No implementar ninguna de las dos opciones sin que el cliente la haya elegido.

## Criterio de aceptación

- [ ] Ningún número queda en estado "reservado" en ningún momento del flujo.
- [ ] La tabla `compras` ya no tiene la columna `reservado_hasta`, y su `estado_pago` ya no
      incluye `reservado` ni `vencido`.
- [ ] La asignación de números (escritura en `numeros.compra_id`) ocurre únicamente dentro
      del procesamiento del webhook, tras confirmar `status = approved` contra la API de MP.
- [ ] No existe ningún proceso de limpieza/expiración de reservas (eliminar el cron/job si ya
      existía del MVP).
- [ ] La UI no menciona tiempos de reserva en ningún texto (formulario, pantalla de
      participante, mensajes de WhatsApp).
- [ ] Probar el caso de dos pagos simultáneos que en conjunto excedan el stock disponible: el
      pago que no alcanza cupo dispara reembolso automático (RN-06) y el admin queda
      notificado.
- [ ] El comportamiento del contador de disponibles sigue la opción (A o B) que el cliente
      haya confirmado explícitamente.

## Resumen para el agente

| Qué | Antes (MVP) | Ahora (RF-07) |
|---|---|---|
| Al completar el formulario | Se reservan números por 10 min | Se crea la compra en `pendiente`, sin tocar números |
| Momento de asignación de números | Al pagar, si la reserva seguía vigente | Al pagar, siempre (no hay reserva que pueda vencer) |
| Qué pasa si no se paga | Los números se liberan al vencer la reserva | Nunca se tomó ningún número; no hay nada que liberar |
| Rol de RN-06 (anti-sobreventa) | Caso borde excepcional | Mecanismo principal de control de stock |
| Estados posibles de `compras` | `reservado`, `pagado`, `vencido`, `fallido`, `reembolsado` | `pendiente`, `pagado`, `fallido`, `reembolsado` |
