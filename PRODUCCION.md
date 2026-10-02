# Puesta en producción: Supabase + Vercel

Esta app usa Supabase desde el servidor para lecturas y escrituras; Vercel aloja Next.js. El proyecto queda listo para una base limpia: al iniciar sesión como admin, el panel permite crear la primera dinámica y genera sus números.

## 1. Crear Supabase

1. En Supabase, crea un proyecto nuevo en una región cercana a tus usuarios y conserva la contraseña de base de datos en un gestor seguro.
2. En **Connect** / **Settings > API Keys**, copia la URL del proyecto, la `publishable key` y crea/obtén una `secret key`.
3. En **SQL Editor**, ejecuta estos archivos en este orden, copiando cada archivo completo:
   1. `db/migrations/01_initial_schema.sql`
   2. `db/migrations/02_atomic_reservation_function.sql`
   3. `db/migrations/03_dinamica_public_fields.sql`
4. No ejecutes `db/seed.sql` en producción: agrega una dinámica, historial y números ficticios de demostración.
5. Da de alta el correo real del administrador en `admins_whitelist` desde SQL Editor, reemplazando el correo:

```sql
insert into public.admins_whitelist (email)
values (lower('tu-correo-google@dominio.com'))
on conflict (email) do nothing;
```

6. En **Integrations > Data API**, comprueba que la API de datos esté habilitada y que `public` esté expuesto. Las consultas de la app pasan por el servidor con la clave secreta; las tablas siguen con RLS activado.
7. Revisa **Database > Advisors** y activa SSL. Guarda las credenciales fuera del repositorio.

> Si ya existe una base con ventas, no vuelvas a correr la migración inicial ni borres la dinámica para “empezar de cero”. Primero concilia pagos pendientes y resuelve la dinámica vigente; para un arranque limpio, usa un proyecto Supabase nuevo.

## 2. Configurar autenticación de administrador

1. En **Authentication > Sign In / Providers**, habilita el proveedor de correo y contraseña. No habilites el registro público si solo quieres cuentas administradas.
2. En **Authentication > Users**, crea o invita cada cuenta administradora y confirma su correo según la configuración del proyecto.
3. Inserta el mismo correo, en minúsculas, en `admins_whitelist`. Autenticarse no concede permisos por sí solo; el servidor verifica esta tabla en cada acceso al panel.
4. Guarda contraseñas individuales y únicas. No compartas credenciales entre administradores.

## 3. Conectar Vercel

1. Importa el repositorio GitHub `Tekobc/TiendaMica` en Vercel, con framework Next.js, directorio raíz del proyecto y rama de producción `main`.
2. En **Settings > Environment Variables**, agrega estas variables al entorno **Production**:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`); solo servidor |
| `NEXT_PUBLIC_SITE_URL` | Dominio final, con `https://` y sin `/` final |
| `MP_ACCESS_TOKEN` | Token de prueba inicialmente; token `APP_USR-...` solo al habilitar cobros reales |

No pongas `SUPABASE_SECRET_KEY` bajo un nombre `NEXT_PUBLIC_`, no la compartas por chat y no la guardes en Git. Los nombres heredados `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` también son aceptados por compatibilidad.

3. Para preview, configura variables separadas y preferentemente un proyecto Supabase de staging; usa credenciales de prueba de Mercado Pago. No conectes pruebas de preview a la base de datos que recibe compras reales.
4. Lanza un deployment de producción y revisa los logs de build. El proyecto Vercel se puede enlazar con la integración Supabase desde el marketplace, pero igual verifica los nombres y entornos de las variables de arriba.

## 4. Crear la primera dinámica

1. Abre `https://<dominio>/admin/login` y entra con la cuenta Google incluida en `admins_whitelist`.
2. En el panel vacío, completa título, descripción, premio, precio, cantidad y tope por compra. Usa **Crear y activar dinámica**.
3. Comprueba que `/dinamica` muestre los datos guardados y que el tablero tenga exactamente la cantidad de números configurada.
4. Haz una compra completa en sandbox y verifica en Supabase que la compra quede pagada y que los números solo se asignen al confirmar Mercado Pago.

## 5. Antes de cobrar dinero real

- Configura `NEXT_PUBLIC_SITE_URL` con el dominio definitivo y registra en Mercado Pago el webhook `https://<dominio>/api/mp/webhook`.
- Valida el circuito de pago aprobado, rechazado, repetición del webhook, importe incorrecto, pago tardío y reembolso en sandbox. No cambies a `APP_USR-...` hasta cerrar esas pruebas.
- Revisa Seguridad y Performance Advisors de Supabase, backups y alertas. Activa MFA para las cuentas administradoras.
- Mantén `db/seed.sql` solo como datos de prueba; no lo uses para vaciar ni reiniciar una base con participantes.

## Configuración local

Usa `.env.example` como referencia para un `.env.local` ignorado por Git. No compartas sus valores. Para el primer inicio local, aplica las mismas migraciones a una base de desarrollo y agrega tu propio correo a `admins_whitelist`.
