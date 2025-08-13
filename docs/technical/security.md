---
id: security
title: Seguridad
description: Prácticas de seguridad aplicadas y recomendaciones futuras.
---

## Claves y Secretos
Supabase Service Role y MONGO_URI se cargan vía variables de entorno (`.env`). Nunca versionar estos valores.

## Acceso a Datos
Service Role se usa únicamente en backend controlado. Para entornos con múltiples clientes considerar RLS (Row Level Security) en Supabase y uso de key `anon`.

## Prevención de Sesiones Duplicadas
`lock-mongo.js` garantiza una sola instancia activa evitando corrupción del auth state.

## Sanitización
Normalización de cadenas elimina acentos/espacios, pero no ejecuta eval ni construye queries dinámicas → riesgo de inyección bajo.

## Permisos de Archivos
Directorio `session_auth_info` debe tener permisos restringidos (no exponer en hosting estático). Evitar servir contenido de esa ruta.

## Transporte
WhatsApp (Baileys) emplea cifrado extremo a extremo. Las claves privadas se guardan cifradas en tránsito (TLS a Mongo) pero reposan en claro serializado (Base64). Opcional: cifrado adicional (AES) antes de persistir.

## Hardening Recomendado
- Rotación periódica de credenciales DB.
- Escaneo dependencias (npm audit / Snyk).
- Limitar orígenes CORS en Express.
- Logging de acceso a endpoints administrativos.

## Datos Sensibles
Evitar loggear `creds`, `advSecretKey` o mensajes completos. Filtrar campos en producción.
