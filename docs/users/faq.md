---
title: "Preguntas Frecuentes"
description: "Respuestas rápidas a dudas comunes."
---

### ¿Necesito escanear el QR cada día?
No, mientras la sesión persista en Mongo y no caduque o cierres la app móvil. (Se planifica comando `/eliminar ID_DEL_REGISTRO` para invalidar manualmente.)

### ¿Qué pasa si cambio de teléfono?
Puede invalidarse la sesión existente: deberás reescanear el nuevo dispositivo.

### ¿Se guardan mis mensajes completos?
No. Solo se extraen campos estructurados. Los logs de desarrollo pueden contener fragmentos para depuración (se minimizarán en producción).

### ¿Puedo deshacer un registro?
Aún no. Se planifica comando `/eliminar ID_DEL_REGISTRO`.
