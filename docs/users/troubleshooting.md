---
id: troubleshooting
title: Solución de Problemas
description: Diagnóstico y acciones sugeridas.
---

| Problema | Causa Posible | Acción |
|----------|---------------|--------|
| No aparece QR | Falta conexión a internet | Revisar red / logs | 
| Sesión caída frecuente | Instancia duplicada | Ver lock en Mongo |
| No reconoce destinatario | Alias faltante | Crear alias o nuevo destinatario |
| Método pago incorrecto | Score fuzzy bajo | Escribir nombre más claro |
| Error guardando | Supabase indisponible | Reintentar luego |

Logs con emojis ayudan a identificar fases (🔍 verificación, ✅ éxito, ❌ error).
