---
id: testing
title: Estrategia de Testing
description: Enfoque para pruebas unitarias, integración y E2E.
---

## Objetivos
Validar parsing, matching y persistencia sin requerir sesión real de WhatsApp en cada test.

## Pirámide Propuesta
| Nivel | Targets | Herramientas |
|-------|---------|-------------|
| Unit | Normalizadores, matchers | Jest / Vitest |
| Integración | Supabase (mock / test schema), Mongo adaptador | Docker compose CI |
| E2E | Flujo completo simulando mensajes | Baileys mock socket / sandbox |

## Mocks
- Supabase: usar cliente apuntando a DB test o stub con respuestas controladas.
- Mongo: `mongodb-memory-server` para adaptador auth.

## Casos Clave
1. Matching destinatario exacto / variante.
2. Alias duplicado detectado.
3. Fecha parsing formatos distintos.
4. Método pago por debajo del umbral -> rechazo.
5. Recuperación sesión tras reinicio (temp_sessions persistente).

## Buenas Prácticas
- Tests deterministas (seeding catálogos).
- Limpiar colecciones entre tests.
- Cobertura mínima 70% en utils críticos.

## Futuro
Integrar pipeline CI (GitHub Actions) que ejecute tests + lint + seguridad (npm audit).
