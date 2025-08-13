
### 5. docs/technical/media-ocr.md

```markdown
---
id: media-ocr
title: Procesamiento de Media y OCR
sidebar_position: 5
---

# Procesamiento de Media y OCR

El bot implementa un pipeline completo para la descarga, almacenamiento y extracción de texto a partir de distintos formatos de medios recibidos por WhatsApp, como imágenes y documentos PDF.


## Descarga de Media

### Imágenes

La función `downloadImageMessage` se encarga de descargar imágenes recibidas a través de WhatsApp:

```javascript
const downloadImageMessage = async (msg, senderName, messageId) => {
  try {
    const imageMessage = msg.message.imageMessage;
    if (!imageMessage) return null;
    
    // Crear directorio por usuario si no existe
    const userDir = `${MEDIA_DIR}/${sanitizeFileName(senderName)}`;
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const filename = `${timestamp}_${messageId.replace(/[^a-zA-Z0-9]/g, '')}.jpg`;
    const imagePath = `${userDir}/${filename}`;
    
    // Descargar buffer y escribir a disco
    const buffer = await downloadMediaByUser(imageMessage);
    fs.writeFileSync(imagePath, buffer);
    
    // Guardar en Supabase Storage si está configurado
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await uploadFileToSupabase(imagePath, buffer, `${senderName}/${filename}`);
    }
    
    console.log(`📄 Imagen guardada: ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error("Error descargando imagen:", error);
    return null;
  }
};
```

Documentos
La función downloadDocumentMessage maneja la descarga de documentos (incluyendo PDFs):

```javascript
const downloadDocumentMessage = async (msg, senderName, messageId) => {
  try {
    // Extraer mensaje de documento (maneja casos de documentWithCaptionMessage)
    const docWrapper = msg.message.documentMessage
      ? { doc: msg.message.documentMessage, caption: msg.message.documentMessage.caption }
      : (msg.message.documentWithCaptionMessage
          ? {
              doc: msg.message.documentWithCaptionMessage.message?.documentMessage,
              caption: msg.message.documentWithCaptionMessage.caption
            }
          : { doc: null, caption: "" });
    
    const docMsg = docWrapper.doc;
    if (!docMsg) return null;
    
    // Crear directorio por usuario
    const userDir = `${MEDIA_DIR}/${sanitizeFileName(senderName)}`;
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // Obtener nombre de archivo o generar uno
    const originalFilename = docMsg.fileName || `document_${messageId}`;
    const timestamp = Date.now();
    const filename = `${timestamp}_${messageId.replace(/[^a-zA-Z0-9]/g, '')}_${sanitizeFileName(originalFilename)}`;
    const docPath = `${userDir}/${filename}`;
    
    // Descargar buffer y escribir a disco
    const buffer = await downloadMediaByUser(docMsg);
    fs.writeFileSync(docPath, buffer);
    
    // Mostrar información del documento
    const mimetype = docMsg.mimetype || 'application/octet-stream';
    const filesize = buffer.length;
    console.log(`📄 Documento guardado: ${docPath}`);
    console.log(`📝 Tipo: ${mimetype}, Tamaño: ${filesize} bytes`);
    
    // Guardar en Supabase Storage
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await uploadFileToSupabase(docPath, buffer, `${senderName}/${filename}`);
    }
    
    return docPath;
  } catch (error) {
    console.error("Error descargando documento:", error);
    return null;
  }
};
```

Función Core de Descarga
Ambas funciones utilizan downloadMediaByUser, que maneja la interacción directa con Baileys:


```javascript
const downloadMediaByUser = async (mediaMessage) => {
  try {
    // Obtener stream desde Baileys
    const stream = await downloadContentFromMessage(
      mediaMessage,
      mediaMessage.mimetype.startsWith('image/') ? 'image' : 'document'
    );
    
    // Convertir stream a buffer
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    return buffer;
  } catch (error) {
    console.error("Error en downloadMediaByUser:", error);
    throw error;
  }
};
```

OCR (Reconocimiento Óptico de Caracteres)
Extracción de Texto de Imágenes
La función extractTextFromImage utiliza Google Vision API para extraer texto de imágenes:

```javascript
const extractTextFromImage = async (imagePath) => {
  try {
    // Inicializar cliente de Vision
    const visionClient = new vision.ImageAnnotatorClient();
    
    // Realizar OCR
    const [result] = await visionClient.textDetection(imagePath);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.log("No se detectó texto en la imagen");
      return "";
    }
    
    // El primer elemento contiene todo el texto detectado
    return detections[0].description;
  } catch (error) {
    console.error("Error en extractTextFromImage:", error);
    
    // Intentar fallback si está configurado
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      return await extractTextFromImageFallback(imagePath);
    }
    
    return "";
  }
};
```

Fallback para Extracción de Texto
En caso de fallo con Vision API, se implementa un fallback utilizando Supabase Storage:

```javascript
const extractTextFromImageFallback = async (imagePath) => {
  try {
    console.log("Intentando extracción de texto fallback...");
    
    // Obtener URL pública de Supabase (si previamente se subió)
    const filename = path.basename(imagePath);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`uploads/${filename}`, 60); // URL válida por 60 segundos
    
    if (error || !data?.signedURL) {
      console.error("Error obteniendo URL firmada:", error);
      return "";
    }
    
    // Usar servicio alternativo con la URL
    // (Implementación específica dependiendo del fallback elegido)
    // ...
    
    return ""; // Si no hay implementación específica
  } catch (error) {
    console.error("Error en fallback:", error);
    return "";
  }
};
```

Extracción de Texto de Documentos PDF
Para PDFs, se utiliza la biblioteca pdf-parse para extraer el texto:
```javascript
const extractTextFromDocument = async (documentPath, filename) => {
  try {
    // Verificar si es PDF
    if (!documentPath.toLowerCase().endsWith('.pdf') && 
        !filename.toLowerCase().endsWith('.pdf')) {
      console.log("Documento no es PDF, no se extraerá texto");
      return "";
    }
    
    console.log(`📄 Intentando extraer texto de documento: ${filename}`);
    
    // Leer archivo
    const dataBuffer = fs.readFileSync(documentPath);
    
    // Usar pdf-parse
    const data = await pdfParse(dataBuffer);
    const extractedText = data.text || "";
    
    console.log(`✅ Texto extraído de PDF (${extractedText.length} caracteres)`);
    
    // Si hay poco texto o está vacío, intentar con Vision
    if (extractedText.trim().length < 100) {
      console.log("Texto extraído es corto, intentando con Vision API");
      return await extractTextFromPdfUsingVision(documentPath);
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error extrayendo texto de documento:", error);
    
    // Fallback a Vision API
    try {
      return await extractTextFromPdfUsingVision(documentPath);
    } catch (visionError) {
      console.error("Error también en fallback Vision:", visionError);
      return `[No se pudo extraer texto del documento: ${filename}]`;
    }
  }
};
```

Fallback para PDFs con Vision API
Cuando pdf-parse no logra extraer suficiente texto, se utiliza Vision API como fallback:

```javascript
const extractTextFromPdfUsingVision = async (pdfPath) => {
  try {
    // Convertir primera página de PDF a imagen
    const pages = await pdf2pic.convertFromPath(
      pdfPath,
      {
        density: 300,
        savePath: path.dirname(pdfPath),
        saveFilename: `${path.basename(pdfPath, '.pdf')}_page`,
        format: 'png',
        width: 2480,
        height: 3508
      }
    );
    
    // Convertir sólo primera página
    const pageOutput = await pages(1);
    
    if (!pageOutput || !pageOutput.path) {
      throw new Error("No se pudo convertir PDF a imagen");
    }
    
    // Usar Vision API en la imagen generada
    const extractedText = await extractTextFromImage(pageOutput.path);
    
    // Limpiar archivo temporal
    try { fs.unlinkSync(pageOutput.path); } catch (e) {}
    
    return extractedText;
  } catch (error) {
    console.error("Error usando Vision para PDF:", error);
    throw error;
  }
};
```

Almacenamiento en Supabase
La función uploadFileToSupabase se encarga de subir los archivos procesados a Supabase Storage:

```javascript
const uploadFileToSupabase = async (localPath, fileBuffer, remotePath) => {
  try {
    if (!supabase) {
      console.log("Supabase no configurado, saltando subida");
      return null;
    }
    
    // Determinar mimetype basado en extensión
    const ext = path.extname(localPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';
    // ... otros tipos según sea necesario
    
    // Subir a Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`uploads/${remotePath}`, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Error subiendo archivo a Supabase:", error);
      return null;
    }
    
    console.log(`✅ Archivo subido a Supabase: ${remotePath}`);
    return data.path;
  } catch (error) {
    console.error("Error en uploadFileToSupabase:", error);
    return null;
  }
};
```

Limpieza de Archivos Temporales
Para evitar acumulación de archivos temporales, se implementa una función de limpieza:

```javascript
const cleanupTempFile = async (filePath, delayMs = 60000) => {
  // Esperar un tiempo antes de eliminar (por si se necesita nuevamente)
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Archivo temporal eliminado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error eliminando archivo temporal ${filePath}:`, error);
    }
  }, delayMs);
};
```

Integración en el Flujo Principal
El resultado de la extracción de texto se combina con el caption del mensaje para formar el captureMessage que será procesado por OpenAI:
```javascript
// Dentro del handler de mensajes
if (messageType === "imageMessage") {
  caption = msg.message.imageMessage.caption || "";
  imagePath = await downloadImageMessage(msg, senderName, messageId);
  console.log(`📥 Imagen descargada en: ${imagePath}`);
  const extractedText = await extractTextFromImage(imagePath);
  captureMessage = [caption, extractedText].filter(Boolean).join("\n\n");
} else if (messageType === "documentMessage") {
  const docMsg = msg.message.documentMessage;
  if (!docMsg) {
    console.log("⚠️ documentMessage sin payload válido");
  } else {
    const fileName = docMsg.fileName || `document_${messageId}`;
    const documentCaption = docMsg.caption || "";
    const mimetype = (docMsg.mimetype || '').toLowerCase();
    console.log(`📄 Documento recibido: name="${fileName}" mime=${mimetype}`);

    const documentPath = await downloadDocumentMessage(msg, senderName, messageId);
    if (documentPath) {
      let extracted = "";
      if (mimetype.startsWith('image/')) {
        console.log("🖼️ Documento es imagen, usando OCR de imagen");
        extracted = await extractTextFromImage(documentPath);
      } else if (mimetype === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        extracted = await extractTextFromDocument(documentPath, fileName);
      } else {
        console.log("⚠️ Tipo de documento no soportado para extracción:", mimetype);
        extracted = `[Documento no soportado: ${fileName}]`;
      }
      captureMessage = [documentCaption, extracted].filter(Boolean).join("\n\n");
    } else {
      console.log("❌ No se pudo descargar el documento");
      captureMessage = documentCaption || `[Documento recibido: ${fileName}]`;
    }
  }
}

// Si hay texto para procesar, enviarlo a OpenAI
if (captureMessage.trim()) {
  await processInitialMessage(jid, captureMessage, caption, msg);
}
```
