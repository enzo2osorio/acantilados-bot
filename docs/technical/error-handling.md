---
id: error-handling
title: Manejo de Errores
description: Estrategia de captura, clasificación y recuperación de errores.
---

## Categorías
| Tipo | Ejemplos | Acción |
|------|----------|--------|
| Validación Entrada | Fecha inválida, monto no numérico | Reintento mismo estado |
| Matching | No se encontró destinatario | Sugerir crear / pedir repetición |
| Infraestructura | Fallo Supabase/Mongo | Retry exponencial / fallback cache |
| Autenticación WA | DisconnectReason (replaced, badSession) | Regenerar o forzar re-login |
| Lógica Interna | Excepciones inesperadas | Log crítico + fallback genérico |

## Patrón General
Funciones utilitarias envuelven llamadas a Supabase y retornan `[]` ante error para no abortar flujo (ej: `getCategorias`, `getMetodosPago`).

## Reintentos
Parsing crítico (fecha/hora/monto) ofrece máximo N reintentos antes de cancelar sesión.

## Logging
Se emplea `pino` (o console) con emojis para legibilidad en desarrollo. Recomendado configurar nivel vía `LOG_LEVEL` y desactivar verbose en producción.

## Alertas Futuras
Integrar Webhook / Slack en bloque `catch` de errores severos (auth state corruption, múltiples desconexiones consecutivas).
