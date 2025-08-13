---
id: sessions-recovery
title: Recuperación de Sesiones
description: Estrategias para mantener la sesión de WhatsApp resiliente.
---

## Objetivo
Reducir el downtime por reinicios del proceso / despliegues y minimizar reescaneos de QR.

## Capas de Persistencia
1. MongoDB: Auth state (creds + keys) mediante adaptador `mongo-adapter.js`.
2. Limpieza controlada de archivos locales (si modo híbrido) con `cleanupSessionFiles.js`.
3. Lock distribuido para evitar múltiples instancias compitiendo (`lock-mongo.js`).

## Flujo de Inicio
```
initInstanceLock() -> useMongoAuthState() -> makeWASocket()
```
Si locking falla (ya existe lease válido) se puede abortar o entrar en modo read-only.

## Renovación de Lease
`initInstanceLock` renueva cada `renewEveryMs` (default 30s) actualizando `expiresAt`.

## Monitoreo Mongo
`monitor-mongo.js` inspecciona conexiones actuales y ejecuta acción (pause/restart) si se supera HARD threshold.

## Sesiones Temporales Usuario
`temp_sessions` (Mongo) conserva el avance del flujo conversacional para recuperación tras reinicio.

## Limpieza
TTL índices eliminan sesiones expiradas. Manual `aggressiveCleanup` permite purgar sender keys de grupos inactivos.

## Estrategia Híbrida (Opcional)
`hybrid-auth-solution.js` permite usar archivos locales para conectar rápido y migrar a DB tras conexión.

## Mejores Prácticas
- Evitar múltiples pods escribiendo la misma instancia (usar lock).
- Monitorear tamaño colección keys y aplicar políticas TTL para llaves efímeras.
