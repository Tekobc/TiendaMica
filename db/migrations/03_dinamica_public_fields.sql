-- ==============================================================================
-- 03_dinamica_public_fields.sql
-- Agrega el titulo y la descripcion visible de la dinámica al modelo de sorteos.
-- ==============================================================================

alter table sorteos
  add column if not exists titulo text,
  add column if not exists descripcion text;

update sorteos
set titulo = coalesce(titulo, premio),
    descripcion = coalesce(descripcion, 'Participá comprando tu número')
where titulo is null or descripcion is null;
