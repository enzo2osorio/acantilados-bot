title: Modelo de Datos
description: Definición de entidades y relaciones principales usadas por el bot.
---
title: Modelo de Datos
description: Definición de entidades y relaciones principales usadas por el bot.
---

Esta sección documenta las tablas / colecciones persistidas en Supabase (Postgres) y MongoDB, así como la semántica de los campos clave.

## Visión General

El sistema mezcla dos almacenes:

| Dominio | Motor | Uso principal |
|---------|-------|---------------|
| Supabase (Postgres) | Relacional | Catálogos, registros financieros, aliases |
| MongoDB | Documento | Estado de autenticación Baileys, llaves, sesiones temporales, locking |

## Tablas en Supabase

### destinatarios
Representa la entidad canónica a la que se asocia un movimiento (persona / comercio).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid/int | PK |
| name | text | Nombre canónico (sin alias) |
| created_at | timestamptz | (opcional) |

### destinatario_aliases
Lista de aliases alternativos para matching flexible.

| Campo | Tipo | Notas |
| id | uuid/int | PK |
| destinatario_id | FK destinatarios.id | Relación |
| alias | text | Texto normalizado al guardar |

Existe una RPC `get_aliases_grouped` que retorna estructura agrupada: `{ destinatario_id, aliases: ["alias1", ...] }` para acelerar construcción del mapa en memoria.

### metodos_pago
| Campo | Tipo | Notas |
| id | uuid/int | PK |
| name | text | Ej: "Efectivo", "Transferencia", etc. |

### categorias / subcategorias
Jerarquía para organizar destinatarios (y potencialmente registros). `subcategorias.categoria_id` referencia la categoría padre.

### registros
Movimientos registrados (flujo principal del bot).

| Campo | Tipo | Notas |
| id | uuid/int | PK |
| destinatario_id | FK | Referencia canónica |
| monto | numeric | Valor económico |
| fecha | timestamptz | Derivado de parsing fecha/hora del mensaje |
| tipo_movimiento | text | Ej: ingreso, egreso |
| metodo_pago_id | FK metodos_pago.id | |
| descripcion | text | Observaciones opcionales |
| created_at | timestamptz | Auditoría |

## Colecciones en MongoDB

Prefijo configurable por instancia (normalmente `wa_instance`).

### `{prefix}`_creds
Documento único por instancia con el blob serializado de `creds` de Baileys.

| Campo | Descripción |
|-------|-------------|
| instanceId | Identificador lógico (por defecto `default`) |
| data | Objeto serializado con claves binarias codificadas base64 |
| updatedAt | Fecha última persistencia |

### `{prefix}`_keys
Llaves dinámicas / sesiones de Baileys.

| Campo | Descripción |
|-------|-------------|
| instanceId | Id instancia |
| type | Tipo (ej: `session`, `app-state-sync-key`, etc.) |
| id | Identificador específico (jid, device, etc.) |
| value | Objeto serializado (buffers -> base64) |
| updatedAt | Timestamp |

Indices creados por `ensureKeysIndexes` para `{ instanceId, type, id }` y TTL opcional sobre llaves expirátiles.

### wa_instance_locks (por defecto)
Implementa locking de instancia con lease renovable (ver `lock-mongo.js`). Campos: `instanceId`, `ownerId`, `expiresAt`, `meta[...]`.

### temp_sessions
Sesiones temporales de flujo conversacional.

| Campo | Descripción |
|-------|-------------|
| userId | JID del usuario (sin sufijo o completo) |
| structureOutput | Estado estructurado parcial del parsing |
| flowState | Estado de la máquina de flujo |
| lastActivityAt | Actividad última interacción |
| lastUpdated | Para TTL (índice expireAfterSeconds) |

## Relaciones Clave

```
destinatarios 1---* destinatario_aliases
categorias 1---* subcategorias
destinatarios (opcional) -> categorias/subcategorias (por FK fuera de este extracto)
registros *---1 destinatarios
registros *---1 metodos_pago
```

## Normalización y Matching

El matching fuzzy se ejecuta sobre la agregación (nombre canónico + aliases) precargada con la RPC `get_aliases_grouped`. Para evitar colisiones se valida duplicados antes de insertar (util `checkDuplicateAliases`).

## Estrategia de Cache

Taxonomía (categorías / subcategorías) cacheada 5 min en memoria (`categorized-list.js`). Aliases se recalculan al levantar la app o bajo demanda.

## Futuras Extensiones

Posibles tablas: `users`, `roles`, `audit_logs`, `attachments`. Mantener consistencia con naming snake_case y claves foráneas explícitas.
