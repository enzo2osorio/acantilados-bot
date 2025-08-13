
### 6. docs/technical/openai-parsing.md

```markdown
---
id: openai-parsing
title: Procesamiento con OpenAI
sidebar_position: 6
---

# Procesamiento con OpenAI

Una vez que el texto ha sido extraído de las imágenes o documentos (o recibido directamente como mensaje), el bot utiliza OpenAI para procesar y estructurar la información en un formato JSON que puede ser manipulado fácilmente.

## Estrategia de Prompt

El prompt enviado a OpenAI está cuidadosamente diseñado para extraer información específica de comprobantes de pago con alta precisión. Se utiliza el modo "sistema + usuario" para dar instrucciones claras y luego enviar el contenido a analizar.

### Estructura del Prompt

```javascript
const systemPrompt = `
Eres un asistente especializado en interpretar comprobantes de pago y extractos bancarios. 
Tu tarea es analizar el texto e identificar la siguiente información:
- nombre: Nombre o razón social del destinatario/remitente (a quién se pagó o de quién se recibió).
- monto: Valor numérico de la transacción (sin símbolos de moneda, usar punto como separador decimal).
- fecha: En formato DD/MM/YYYY (si está disponible).
- hora: En formato HH:MM (si está disponible).
- tipo_movimiento: "egreso" si es un pago realizado, "ingreso" si es dinero recibido.
- medio_pago: Método utilizado (ej. "Efectivo", "Mercado Pago", "Transferencia Bancaria").
- referencia: Número o código que identifica la operación (si está disponible).
- numero_operacion: Similar a referencia pero prioriza números de recibo o comprobante.
- observacion: Información adicional relevante, detalles del pago/cobro.

INSTRUCCIONES IMPORTANTES:
1. Si un campo no está disponible en el texto, déjalo vacío (no inventes información).
2. Para "nombre", extrae el negocio, empresa o persona a quien se realizó el pago o de quien se recibió.
3. Para "monto", asegúrate de extraer solo el valor numérico principal.
4. Para "tipo_movimiento", usa contexto para determinar si es egreso o ingreso.
5. Para "medio_pago", identifica método como "Efectivo", "Transferencia", "Mercado Pago", etc.
6. Si hay varios montos, usa el contexto para identificar el monto principal.

Responde ÚNICAMENTE con un objeto JSON que contenga estos campos.`;

// En la función processInitialMessage
const response = await client.chat.completions.create({
  model: process.env.OPENAI_MODEL || "gpt-4o",
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: captureMessage }
  ]
});
```

Ejemplo de Entrada (captureMessage)

Comprobante de pago
#121321662397
Pagaste a
Union Del Sud
Total pagado
$ 15.084,64
Detalle de operación
Valor de la factura$ 15.084,64
Total pagado$ 15.084,64
Código de barras
04001493529252160000000017028320015084642


Ejemplo de Salida (JSON Estructurado)

```javascript
{
  "nombre": "Union Del Sud",
  "monto": 15084.64,
  "fecha": "11/08/2025",
  "hora": "09:19",
  "tipo_movimiento": "egreso",
  "medio_pago": "Pago Fácil",
  "referencia": "76407115",
  "numero_operacion": "121321662397",
  "observacion": "Pagador: ERICA, Código de barras: 04001493529252160000000017028320015084642"
}
```

Función de Procesamiento
La función processInitialMessage es la encargada de orquestar el flujo de procesamiento con OpenAI:
```javascript
const processInitialMessage = async (jid, captureMessage, caption, quotedMsg) => {
  try {
    // Inicializar cliente OpenAI
    const client = new openAI({ apiKey: process.env.OPENAI_API_KEY });

    // Realizar llamada a OpenAI
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: captureMessage }
      ]
    });

    // Extraer y parsear respuesta
    const jsonString = response.choices[0].message.content.trim();
    console.log("🤖 Respuesta OpenAI estructurada:", jsonString);

    let data;
    try { 
      data = JSON.parse(jsonString); 
    } catch (err) { 
      console.error("Error parse JSON:", err); 
      data = {}; 
    }

    // Guardar sesión temporal base
    await saveTempSession(jid, data, 'STRUCTURED_READY');
    const entry = tempSessionCache.get(jid);
    if (entry) entry.lastActivityAt = Date.now();

    // Resolver destinatarioconst processInitialMessage = async (jid, captureMessage, caption, quotedMsg) => {
  try {
    // Inicializar cliente OpenAI
    const client = new openAI({ apiKey: process.env.OPENAI_API_KEY });

    // Realizar llamada a OpenAI
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: captureMessage }
      ]
    });

    // Extraer y parsear respuesta
    const jsonString = response.choices[0].message.content.trim();
    console.log("🤖 Respuesta OpenAI estructurada:", jsonString);

    let data;
    try { 
      data = JSON.parse(jsonString); 
    } catch (err) { 
      console.error("Error parse JSON:", err); 
      data = {}; 
    }

    // Guardar sesión temporal base
    await saveTempSession(jid, data, 'STRUCTURED_READY');
    const entry
```
