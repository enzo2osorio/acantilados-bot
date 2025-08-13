---
id: basic-flow
title: Flujo Básico
description: Pasos principales para registrar un movimiento.
---

1. Envía mensaje con al menos destinatario y monto.
2. El bot responde con interpretación y solicita datos faltantes.
3. Confirmas el resumen.
4. Recibes confirmación de guardado.

Ejemplo:
```
Usuario: Pagué 3200 a Comercio Azul con tarjeta

(Flujo esperando confirmación del usuario)
📋 Datos del comprobante:

👤 Destinatario: Comercio Azul
💰 Monto: $3200
📅 Fecha: 12/08/2025 --> (si no se incluye fecha, se toma la fecha de la actualidad)
📊 Tipo: egreso --> solo puede ser ingreso / egreso , se detecta palabras clave como "pagué" para asimilar que es egreso.
💳 Método de pago: Tarjeta de débito --> (se hace match al más
 parecido, con esto podríamos ver que no se especifica qué tipo de
 tarjeta es, y si es tarjeta de crédito, se tiene que cambiar manualmente)

¿Deseas guardar estos datos?

1. 💾 Guardar
2. ✏️ Modificar
3. ❌ Cancelar

Escribe el número de tu opción:
...
```
