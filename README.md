# App Web de Sorteos — Adonai BY TIENDA MICA

Plataforma oficial para la gestión y asignación automática de números de sorteos y rifas de **Adonai BY TIENDA MICA** (indumentaria femenina, regalos y fragancias).

---

## 🌸 Estado del Proyecto — Fase 1 & Fase 2 (Hito 1 y Hito 2)

Conforme a la especificación técnica en [`CONTEXT.md`](./CONTEXT.md):

### ✅ Fase 1 (Hito 1 — Seña)
- **Setup base:** Next.js 15 (App Router, TypeScript, React 19) + Tailwind CSS.
- **Identidad visual:** Estilo botánica y rosa (`mica` rosado, `sage` verde salvia, blanco cálido).
- **Home pública (`/sorteos`):** Tablero de disponibilidad (disponible / ocupado), barra de progreso (*"Faltan X números"*), historial de sorteos pasados sin nombres personales.
- **Bases y Condiciones (`/sorteos/bases-y-condiciones`):** Documento legal adaptado a normativas argentinas y requisitos de Adonai BY TIENDA MICA.
- **Migraciones SQL & Supabase:**
  - `01_initial_schema.sql`: Tablas `sorteos`, `compras`, `numeros`, `admins_whitelist`, índice parcial anti-sobreventa `un_numero_activo` y RLS.
  - `02_atomic_reservation_function.sql`: Procedimiento `reservar_numeros` en PostgreSQL con locking concurrente `SELECT ... FOR UPDATE SKIP LOCKED`.
  - `seed.sql`: Datos semilla y sorteo activo de muestra.

### ✅ Fase 2 (Hito 2 — MVP Funcional)
- **Formulario de Compra con Avance Dinámico (`FormularioCompra.tsx`):**
  - Campos secuenciales: Nombre completo &rarr; Teléfono celular (teclado numérico, validación argentina en vivo) &rarr; Cantidad.
  - Avance de foco automático al completar cada campo o presionar Enter / longitud válida.
  - Cálculo de total en tiempo real en el frontend con **re-cálculo estricto en el servidor** (RN-03).
  - Límite de reservas activas temporales por IP/dispositivo contra spam (RN-10).
  - Checkbox obligatorio: +18 años y aceptación de Bases y Condiciones.
- **Integración con Mercado Pago Checkout Pro (`lib/mercadopago.ts`):**
  - Creación de preferencia con `external_reference = compra.id`.
  - Exclusión de medios de pago diferidos (efectivo/rapipago) conforme a RN-09.
  - Redirección con `back_urls` apuntando a la pantalla privada del participante con token.
- **Webhook de Mercado Pago con Verificación e Idempotencia (`app/api/mp/webhook/route.ts`):**
  - Re-consulta a la API de MP (`Payment.get`) con `payment_id`, sin confiar ciegamente en el payload (Sección 11).
  - Idempotencia estricta por `mp_payment_id unique` para evitar procesar cobros duplicados.
  - **Bloqueo de configuración (RN-02):** Al acreditarse el primer pago aprobado, `sorteos.bloqueado = true`.
  - **Anti-sobreventa (RN-06):** Reembolso automático vía API de MP si un pago ingresó tras vencer la reserva de 10 minutos y los números fueron reasignados.
  - Liberación inmediata de números ante pagos rechazados o cancelados.
- **Pantalla Privada del Participante (`/sorteos/mis-numeros/[token]`):**
  - Acceso seguro mediante token no adivinable (`crypto.randomUUID()`).
  - Resaltado visual en rosa intenso de los números asignados (*"Tus números"*).
  - Aviso persistente y botón para copiar/guardar el enlace privado.
  - Contacto directo por WhatsApp ante dudas de la compra.
- **Panel de Administración (`/admin`):**
  - **Autenticación & Whitelist en Servidor (Sección 10):** Chequeo de sesión Google OAuth contra `admins_whitelist`. 403 server-side si el email no está autorizado.
  - **Inmutabilidad (RN-02):** Bloqueo automático de edición de premio, valor y cantidad tras la primera venta.
  - **Métricas:** Recaudación acumulada, vendidos vs disponibles, reservas pendientes y vencidas.
  - **Tabla de Participantes:** Buscador en tiempo real por nombre/tel/número, exportación a CSV, botón de WhatsApp directo con mensaje preconfigurado y edición manual de teléfono (RN-11, Gap #6).

---

## 🛠️ Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key # solo servidor

MP_ACCESS_TOKEN=TEST-tu-access-token # Mercado Pago Sandbox / Test
MP_PUBLIC_KEY=TEST-tu-public-key

NEXT_PUBLIC_SITE_URL=http://localhost:3000

GOOGLE_OAUTH_CLIENT_ID=tu-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=tu-google-client-secret
```

---

## 🚀 Cómo Ejecutar en Local

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

> ⏸️ **Fase 3 (Entrega Final):** Pasaje a credenciales reales de Mercado Pago, deploy en Vercel con subpath `/sorteos`, módulo de carga única del ganador (RN-07) y checklist de QA final.
