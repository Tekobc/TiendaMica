# RF-08 a RF-13 — Mejoras visuales y de marca

> Requerimientos aislados de ajuste visual. No tocan el modelo de datos ni el flujo de
> pago/asignación de números (`CONTEXT.md`, `RF-07`). Son cambios de UI/UX y de identidad
> de marca. Varios dependen de assets que el cliente todavía no entregó — están marcados
> explícitamente como bloqueantes para no inventar un valor (color, archivo, link) que
> después haya que deshacer.

---

## RF-08 — Modo oscuro (dark mode) en la barra de navegación

**Qué construir:**
- Toggle de modo oscuro/claro visible en la navbar (ícono sol/luna, patrón estándar).
- Persistencia de la preferencia del usuario entre visitas (ej. `localStorage` o
  `prefers-color-scheme` como valor por defecto si el usuario no eligió nada todavía).
- Alcance: ¿aplica a todo el sitio (Home pública + panel admin) o solo a uno de los dos?
  **Asunción por defecto: aplica a toda la app** (Home, formulario, pantalla de
  participante y panel admin), ya que no se indicó lo contrario. Confirmar con el cliente
  si se quiere limitar a una sola sección.

**Criterio de aceptación:**
- [ ] El toggle cambia el tema sin recargar la página.
- [ ] La preferencia persiste al cerrar y volver a abrir el sitio.
- [ ] Todos los componentes existentes (tablero, formulario, barra de progreso, panel admin)
      tienen variante oscura legible, sin texto de bajo contraste ni fondos que rompan
      componentes de terceros (ej. el botón de Mercado Pago).
- [ ] El logo (RF-10) tiene una versión o tratamiento visual que se vea bien sobre fondo
      oscuro (no asumir que el SVG actual funciona igual en ambos modos sin revisarlo).

---

## RF-09 — Mejorar contraste usando el rosa del logo como color de fondo

**Qué pide el cliente, tal como está escrito:** usar el color rosa del logo para mejorar el
contraste del fondo de la app.

**Ambigüedad a resolver antes de programar — bloqueante:**
No hay un código de color (`hex`) definido todavía. "El rosa del logo" depende del archivo
real del logo (RF-10), que aún no fue entregado. Implementar esto a ojo desde una captura de
pantalla genera un color que probablemente no coincida con el de marca real.

**Qué hacer en cambio:**
1. Extraer el/los código(s) de color exacto(s) del archivo SVG del logo (RF-10) una vez
   entregado, no aproximarlos a mano.
2. Definir ese color como token de diseño (ej. variable CSS `--brand-rose`), no hardcodeado
   en cada componente, para poder reusarlo también en RF-08 (dark mode) sin duplicar valores.
3. Aplicarlo como fondo/acento de forma que mejore el contraste con el texto existente, no que
   lo empeore: revisar que el contraste texto/fondo cumpla un mínimo legible (apuntar a WCAG
   AA, relación de contraste ≥ 4.5:1 para texto normal) en modo claro y oscuro.

**Criterio de aceptación:**
- [ ] El color usado coincide exactamente con el extraído del logo oficial, no es una
      aproximación visual.
- [ ] El color está centralizado como variable/token reusable (no repetido como valor literal
      en múltiples componentes).
- [ ] El contraste de texto sobre el nuevo fondo es legible tanto en modo claro como oscuro.

**Bloqueante:** no implementar hasta tener el archivo del logo de RF-10.

---

## RF-10 — Agregar logo en formato SVG

**Qué construir:**
- Incorporar el logo del emprendimiento como SVG (no PNG/JPG), para que escale sin perder
  calidad y pueda tener variantes de color fácilmente (útil también para RF-08 y RF-09).
- Ubicarlo en la navbar y como favicon/ícono de la pestaña del navegador.

**Bloqueante:** el cliente debe entregar el archivo del logo en SVG (o un diseñador debe
vectorizarlo si solo existe en PNG/JPG). El agente de código no debe generar un logo propio
ni recrear uno a partir de una imagen rasterizada — no es su tarea y el resultado no sería el
logo real de la marca.

**Criterio de aceptación:**
- [ ] El logo se muestra en SVG, nítido en cualquier tamaño de pantalla (probar en mobile y
      desktop).
- [ ] Existe una versión como favicon.
- [ ] Si RF-08 (dark mode) está implementado, el logo se ve correctamente en ambos temas.

---

## RF-11 — Elementos decorativos de laurel en el fondo de la app (retirados del logo)

**Qué pide el cliente:** actualmente el logo incluye laureles (ramas ornamentales) como parte
del diseño. Se pide sacarlos **del logo** y reubicarlos como elemento decorativo **del fondo**
de la app, separado del isotipo.

**Esto depende de RF-10:** no se puede "sacar los laureles del logo" sin el archivo editable
del logo. Si el cliente entrega el logo ya separado en capas (logo sin laureles + laureles
aparte), se usa directo. Si entrega un único archivo compuesto, hace falta que alguien separe
los elementos antes de dárselo al agente — esto es trabajo de diseño, no algo que el agente de
código deba resolver editando el SVG a ciegas.

**Qué construir, una vez separados los elementos:**
- Usar los laureles como elemento gráfico decorativo de fondo (ej. sutil, de baja opacidad,
  en esquinas o como marca de agua), sin que compita visualmente con el contenido ni con el
  formulario de compra (que según RF-03 debe ser lo primero y más visible de la página).
- El logo queda limpio, sin los laureles, en la navbar/favicon (RF-10).

**Criterio de aceptación:**
- [ ] El logo de la navbar ya no incluye los laureles.
- [ ] Los laureles aparecen como elemento de fondo, con opacidad/tamaño que no reduce la
      legibilidad del texto ni distrae del formulario de compra.
- [ ] Se ven correctamente en mobile (no se recortan mal ni generan scroll horizontal).
- [ ] Compatibles con modo claro y oscuro si RF-08 está implementado.

**Bloqueante:** no implementar hasta recibir los elementos gráficos ya separados (logo limpio
+ laureles aparte, ambos en SVG).

---

## RF-12 — Íconos de Instagram y Facebook

**Qué construir:**
- Agregar íconos de Instagram y Facebook, con link a los perfiles oficiales del
  emprendimiento, en un lugar visible pero que no compita con el formulario de compra (ej. en
  el footer o en el header, no interrumpiendo el flujo de RF-03).
- Usar una librería de íconos ya estándar del proyecto si existe (ej. `lucide-react` u otra ya
  instalada), para no sumar una dependencia nueva solo por esto.

**Bloqueante:** faltan las URLs reales de los perfiles de Instagram y Facebook del cliente. No
usar enlaces de ejemplo ni `#` como placeholder permanente — pedirlos antes de cerrar este
ítem.

**Criterio de aceptación:**
- [ ] Los íconos abren los perfiles reales en una pestaña nueva (`target="_blank"`, con
      `rel="noopener noreferrer"`).
- [ ] Tienen un tamaño cómodo para tocar en mobile (mínimo ~40x40px de área táctil).
- [ ] No aparecen por encima ni empujan el formulario de compra fuera del viewport inicial
      (coherencia con RF-03 y RF-13).

---

## RF-13 — Reducir el tamaño de la tarjeta del formulario de compra para que sea visible sin scroll

**Contexto:** esto es la continuación directa de RF-03 (formulario visible de inmediato, sin
scroll). El bloque actual del formulario usa demasiado padding/alto y empuja el contenido
fuera del viewport inicial en mobile.

**Clase actual a modificar** (identificada por el cliente):
```
relative overflow-hidden bg-gradient-to-br from-white via-rose-50/50 to-cream-100
rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100
```

**Qué cambiar:**
- Reducir el padding interno de la tarjeta, especialmente en mobile. Punto de partida sugerido
  (ajustar según cómo quede en pantalla real, no es un valor cerrado):
  - `p-5 sm:p-6` → `p-3 sm:p-4`
- Revisar también, dentro de ese mismo bloque, espaciados verticales entre campos del
  formulario (`space-y-*`, `gap-*`, márgenes de labels) si existieran, ya que reducir solo el
  padding del contenedor puede no ser suficiente si los campos internos también tienen mucho
  aire entre sí.
- Mantener el resto de la clase igual (gradiente, bordes redondeados, sombra) — esto es un
  ajuste de densidad/tamaño, no un rediseño del estilo visual.

**Criterio de aceptación:**
- [ ] En un viewport mobile estándar (ej. 375×667, iPhone SE como referencia mínima), el
      formulario completo (todos los campos + botón de pago) es visible sin necesidad de
      hacer scroll, incluyendo con la navbar y cualquier elemento agregado por RF-12 ya
      presentes en pantalla.
- [ ] El formulario sigue siendo cómodo de tocar/completar (no se achica al punto de que los
      campos queden difíciles de tocar en mobile — mantener un alto mínimo razonable de los
      inputs, no comprometer usabilidad por ganar espacio).
- [ ] Probar también en un viewport más chico (ej. 320px de ancho) para confirmar que no se
      rompe el layout.

---

## Resumen para el agente

| # | Requerimiento | Bloqueante (falta del cliente) |
|---|---|---|
| RF-08 | Dark mode en navbar, aplicado a toda la app | Ninguno — se puede implementar ya |
| RF-09 | Color de fondo con el rosa exacto del logo, centralizado como token | Archivo del logo (RF-10) |
| RF-10 | Logo en SVG en navbar y favicon | Archivo SVG del logo |
| RF-11 | Laureles como fondo decorativo, retirados del logo | Logo y laureles separados en capas, en SVG |
| RF-12 | Íconos de Instagram y Facebook con link | URLs reales de los perfiles |
| RF-13 | Reducir padding de la tarjeta del formulario para que sea visible sin scroll | Ninguno — se puede implementar ya |

**Orden sugerido de implementación:** empezar por RF-13 y RF-08, que no tienen bloqueantes.
RF-09, RF-10 y RF-11 quedan en espera hasta que el cliente entregue el logo (idealmente ya
separado en logo-limpio + laureles). RF-12 espera solo las dos URLs.
