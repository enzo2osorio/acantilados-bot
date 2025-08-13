---
id: maintenance
title: Mantenimiento
description: Operaciones rutinarias y tareas preventivas.
---

## Tareas Programadas
| Frecuencia | Tarea |
|-----------|-------|
| 30 min | `cleanupSessionFiles()` eliminar claves de grupos y sesiones no permitidas |
| Diario | Verificar tamaño colecciones Mongo y TTL efectivos |
| Semanal | Revisar logs de desconexiones | 
| Mensual | Auditar aliases duplicados |

## Limpieza Manual
`aggressiveCleanup()` para purgar llaves de grupos antiguos.

## Ajustes de Umbrales
Monitor Mongo: SOFT/HARD en variables de entorno para adecuar a pool.

## Salud del Bot
Indicadores:
- Uptime proceso.
- Edad de lock (startedAt vs now).
- Conexiones Mongo actuales.
- Cantidad de sesiones temporales activas.

## Renovación de Dependencias
`npm outdated` + pruebas automatizadas antes de actualizar mayor.
