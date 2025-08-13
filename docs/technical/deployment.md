---
id: deployment
title: Despliegue
description: Guía para desplegar el bot en producción.
---

## Requisitos
- Node.js LTS (>=18 recomendado)
- MongoDB (Atlas o self‑hosted)
- Supabase project (Postgres + RPC configurada)
- Variables de entorno (.env)

## Variables Clave
| Nombre | Descripción |
|--------|-------------|
| SUPABASE_URL | URL proyecto |
| SUPABASE_SERVICE_ROLE_KEY | Key privilegiada backend |
| MONGO_URI | Cadena conexión Mongo |
| MONGODB_DB | Nombre DB |
| INACTIVITY_TIMEOUT_MS | Timeout sesión usuario |
| ALLOWED_JIDS | Lista JIDs permitidos (opcional) |

## Pasos
1. Instalar dependencias: `npm install`.
2. Configurar `.env`.
3. Crear índices Mongo (se crean on-demand en runtime).
4. Levantar proceso: `node index.js` o PM2 / systemd.
5. Escanear QR inicial si no hay auth state.

## Alta Disponibilidad
Usar 1 réplica activa (lock) + 1 standby caliente que arranca sólo si lock expira. Alternativa: orquestador (Kubernetes) con readiness basado en lock.

## Logging / Métricas
Redirigir stdout a stack centralizado (ELK / Loki). Incorporar contadores (mensajes procesados, errores) en futuro endpoint `/metrics` (Prometheus).

## Actualizaciones
1. Aplicar cambios.
2. `git pull && npm ci`.
3. Reiniciar proceso → lock asegura exclusión.

## Backup
Respaldar colecciones Mongo `_creds` y `_keys` + tablas Postgres críticas. Programar snapshot diario.
