---
id: extensibility
title: Extensibilidad
description: Puntos de extensión y patrones para nuevas funcionalidades.
---

## Principios
- Separar parsing, validación y persistencia.
- Reutilizar adaptadores (Supabase, Mongo) como capa infra.
- Evitar lógica de negocio dentro de controladores de transporte (Baileys callbacks).

## Puntos de Extensión
| Área | Estrategia |
|------|-----------|
| Nuevos Campos Registro | Extender máquina de estados + tabla `registros` |
| Comandos Admin | Prefijo (ej: `/cmd`) y dispatcher central |
| Integración OCR | Reemplazar / ampliar `media-ocr.md` pipeline |
| Envío de Reportes | Cron + agregaciones Postgres / Supabase Functions |
| API HTTP | Añadir endpoints REST/GraphQL con Express |

## Reutilización de Matching
Crear nuevos matchers replicando patrón: obtener catálogo, normalizar, fuzzball ratio, umbral configurable.

## Hooks de Persistencia
Rodear `saveDataFirstFlow` con validaciones adicionales (ej: límites diarios) sin modificar núcleo.

## Modularización Futuras
- Extraer `state-machine` a paquete independiente.
- Añadir capa de eventos (EventEmitter) para auditoría.
