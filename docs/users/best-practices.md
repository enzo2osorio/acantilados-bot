---
id: best-practices
title: Mejores Prácticas
description: Consejos para uso eficiente.
---

El bot, según la estructura, es totalmente funcional. Faltan igualmente hacer mejoras de precisión de datos, y demás formas de facilitar el uso de los usuarios. Por el momento, recomiendo seguir estos pasos:

1. Incluir todos los campos establecidos es sumamente necesario para el reflejo correcto de los datos en el sistema de balances. (IMPORTANTE!)
2. Usa método de pago estándar (efectivo, transferencia, tarjeta...).
3. Confirma antes de guardar.

NOTAS:
1. Al momento de ingresar algun comprobante de pago (o texto plano), el bot intentará encontrar al destinatario y método de pago ideal. Según métricas establecidas, puedo asegurar que para la mayoría de comprobantes de pago (donde se encuentren destinatarios recurrentes), se procesará sin tener que hacer más cambios. En los casos donde se detecte un destinatario erróneo o no se encontró una coincidencia casi exacta, se procederá a mostrar la lista de destinatarios al usuario, para que elija manualmente. De igual manera con los métodos de pago, si no existe, se procederá a mostrar la lista de métodos de pago guardados hasta la actualidad, y el usuario puede elegir uno de ellos o crear uno nuevo.


