---
id: fuzzy-matching
title: Matching Difuso
description: Estrategia de fuzzy matching para destinatarios, métodos de pago y prevención de duplicados.
---

Se utiliza la librería `fuzzball` para calcular similitud (ratio Levenshtein) entre la entrada del usuario y valores canónicos.

## Destinatarios

Archivo clave: `utils/findMatchDestinatario.js`.

Pasos:
1. Normalizar input (lowercase, quitar acentos, trim).
2. Obtener lista agrupada de aliases vía `rpc get_aliases_grouped`.
3. Construir mapa `destinatarioId -> { nombreCanonical, aliases[] }`.
4. Aplanar a lista de sinónimos (nombre + cada alias) para primera extracción.
5. `fuzzball.extract` con `ratio` obtiene candidatos (score 0-100).
6. Filtrar por `umbralClave` (default 0.65).
7. Validar variantes dentro de los aliases con `umbralVariante` (default 0.9).

Salida incluye método de resolución: nombre canónico directo o alias variante.

## Métodos de Pago
`utils/findMatchMetodoPago.js` recorre cada nombre y calcula `ratio`, manteniendo mejor score. Se exige umbral >= 70.

## Detección de Similares Previos
`utils/checkSimilarDestinatario.js` busca un único mejor match; distingue coincidencia exacta (score 100) de similar (>=94). Sirve para prevenir creación duplicada.

## Duplicados de Alias
`utils/checkDuplicateAliases.js` carga todos los aliases y separa `validAliases` vs `duplicates` antes de insertar.

## Parámetros Ajustables
- UMBRAL_MINIMO métodos de pago (70).
- umbralClave / umbralVariante destinatarios.
- Rango 'similar' (94-99) para sugerir confirmación al usuario.

## Rendimiento
N para destinatarios + M aliases. Preagrupación reduce queries. Micro‑optimización: Set para detectar duplicados O(1). Futuros: index trigram en Postgres, cache en memoria con invalidación al cambiar alias.

## Errores y Logs
Verbose logging previo a producción; se recomienda nivel configurable (pino logger) para entornos productivos.
