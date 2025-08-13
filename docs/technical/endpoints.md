---
id: endpoints
title: Endpoints y Superficies de Integración
description: Interfaces externas expuestas por el sistema.
---

Actualmente la interacción principal ocurre vía WhatsApp; opcionalmente se sirven endpoints HTTP mínimos (Express) para servir el QR y potencial API futura.

## HTTP (Express)
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/` (estático) | GET | Página con QR (client/index.html) |
| `/upload` (ejemplo) | POST | Subida de archivos (si activado) |

Middleware: `cors`, `bodyParser`, `express-fileupload` para manejo de formularios / media.

## Sockets
Socket.io (cliente en `index.html`) para actualización de QR en tiempo real (no detallado en código mostrado, integrar según necesidad).

## Supabase RPC
`get_aliases_grouped` para optimizar carga de aliases.

## Futuro
- Endpoint `/health` devolviendo estado de lock, conexiones Mongo.
- `/metrics` Prometheus.
- Webhook de eventos (registro creado, error crítico).
