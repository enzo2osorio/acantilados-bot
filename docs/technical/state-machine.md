---
id: state-machine
title: Máquina de Estados Conversacional
description: Flujo de diálogo y control de sesiones temporales.
---

La interacción con el usuario se modela como una máquina de estados simple, persistiendo progreso mínimo en `temp_sessions` (Mongo) para tolerar reinicios.

## Objetivos
1. Guiar al usuario en captura estructurada (destinatario, monto, fecha, método de pago, observaciones).
2. Reintentos controlados ante errores de parsing.
3. Cancelación / reinicio rápida.

## Estados Principales (ejemplo)

| Estado | Descripción | Evento de salida |
|--------|-------------|------------------|
| START | Inicio / saludo | mensaje libre detectado como potencial registro |
| WAIT_DESTINATARIO | Necesita confirmar destinatario | match fuzzy >= umbral o confirmación manual |
| WAIT_MONTO | Falta monto | parse numérico aceptado |
| WAIT_FECHA | Falta fecha/hora | parse fecha válido (o default hoy) |
| WAIT_METODO_PAGO | Falta método | match fuzzy método >= 70% |
| WAIT_CONFIRM | Presenta resumen para confirmar | usuario confirma / corrige campo |
| SAVING | Persistiendo `registros` | éxito / error |
| DONE | Flujo exitoso | nueva interacción reinicia |
| ERROR | Error inesperado | se ofrece retry |

## Persistencia Temporal
`saveTempSessionDB(userId, structureOutput, flowState)` guarda incrementalmente cada paso.

TTL automático: índice expire (24h) limpia sesiones inactivas.

## Recuperación
Al reconectar el bot (reinicio) se puede leer `temp_sessions` y continuar si el `lastActivityAt` < umbral de inactividad (< INACTIVITY_TIMEOUT_MS ).

## Diagrama Simplificado

```
START -> WAIT_DESTINATARIO -> WAIT_MONTO -> WAIT_FECHA -> WAIT_METODO_PAGO -> WAIT_CONFIRM -> SAVING -> DONE
                   ^ (corrección) <--------------------------------------------|
```

## Reglas de Transición Dinámicas
Si el mensaje inicial trae suficientes slots (ej: destinatario + monto + fecha + método) se salta directamente a `WAIT_CONFIRM` tras validaciones.

## Manejo de Errores
Errores de parsing colocan el estado en la misma etapa con contador de reintentos. Errores internos -> `ERROR` con opción /reiniciar.

## Futuras Mejores
Integrar motor declarativo (e.g. JSON state charts) para facilitar pruebas y visualización.
