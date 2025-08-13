---
id: architecture
title: Arquitectura
sidebar_position: 2
---

# Arquitectura

El bot de WhatsApp para procesamiento de comprobantes sigue una arquitectura en capas que facilita el procesamiento de mensajes, extracción de información y persistencia de datos.

## Capas de la Aplicación
Capa de Transporte │ │ (Baileys - conexión WebSocket a WhatsApp)  

Capa de Ingesta │ │ (Descarga y procesamiento de media/mensajes)  

Capa de Extracción │ │ (OCR Google Vision + OpenAI Parsing)  

Capa de Matching │ │ (Fuzzy matching entidades existentes)  

Capa de Estado Conversacional │ │ (Máquina de estados FSM + gestión de timeouts) 

Capa de Persistencia │ │ (Supabase + MongoDB + Storage) 



## Tecnologías Principales

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| Cliente WhatsApp | Baileys | Librería para comunicarse con la API de WhatsApp sin interfaz web |
| Persistencia Auth | MongoDB | Almacenamiento de credenciales y llaves E2E de WhatsApp |
| Base de Datos Principal | Supabase | Almacenamiento de entidades de negocio y registros |
| OCR | Google Vision | Reconocimiento óptico de caracteres para imágenes y PDFs |
| Procesamiento Semántico | OpenAI | Extracción de información estructurada |
| Matching Fuzzy | Fuzzball | Comparación de strings para identificar destinatarios y métodos de pago |
| Media Storage | Supabase Storage | Almacenamiento de imágenes y documentos procesados |


## Características Destacadas

- **Persistencia de sesión**: Reutiliza la sesión de WhatsApp sin necesidad de escanear QR en cada reinicio.
- **Control de instancias**: Implementa un lock distribuido para garantizar una sola instancia activa.
- **Matching inteligente**: Utiliza algoritmos de comparación fuzzy para identificar entidades similares.
- **Listas categorizadas**: Presenta destinatarios organizados por categoría y subcategoría.
- **Reanudación tras desconexión**: Recupera sesiones activas tras errores de conexión o reinicio.
- **Media ingestion pipeline**: Procesa y extrae texto de distintos formatos de forma unificada.
- **Máquina de estados**: Gestiona el flujo de conversación de forma estructurada con timeout.


## Flujos Secuenciales Principales

### 1. Procesamiento de Mensaje con Media

Usuario → mensaje con imagen → Baileys ↓ downloadImageMessage (almacenamiento temporal + Supabase) ↓ extractTextFromImage (OCR Google Vision) ↓ processInitialMessage (envío a OpenAI para parsing) ↓ matchDestinatario / matchMetodoPago (fuzzy matching) ↓ setUserState (establece estado en FSM para confirmar/modificar) ↓ Respuesta al usuario (confirmación o solicitud acción)



### 2. Flujo de Estado y Transiciones

IDLE → recepción comprobante ↓ (Basado en detección y scores) ↓ AWAITING_DESTINATARIO_FUZZY_CONFIRMATION | AWAITING_DESTINATARIO_CHOOSING_IN_LIST ↓ [Creación opcional] → AWAITING_CATEGORY_SELECTION → AWAITING_SUBCATEGORY_SELECTION ↓ AWAITING_MEDIO_PAGO_CONFIRMATION | AWAITING_METODO_PAGO_LIST_SELECTION ↓ [Creación opcional de método de pago] ↓ AWAITING_SAVE_CONFIRMATION ↓ [Modificación opcional] → AWAITING_MODIFICATION_SELECTION ↓ Guardado final → IDLE



### 3. Recuperación de Errores

Error 428 detectado ↓ recoverFrom428 ↓ closeClient (Mongo) → cierra socket Baileys ↓ reAcquireLock (garantiza instancia única) ↓ connectToWhatsApp (reinicia conexión) ↓ resumeAllSessionsAfter428 (recupera estados de usuarios)


### 4. Guardado de Registro

Estado AWAITING_SAVE_CONFIRMATION + "guardar" ↓ saveComprobante ↓ normalizeDateTime (estandariza formatos) ↓ saveDataFirstFlow (persistencia en Supabase) ↓ Notificación de éxito/error ↓ clearUserState + clearTempSession

----------

## Componentes Clave

### Transporte Baileys

- **Propósito**: Establecer y mantener conexión con WhatsApp.
- **Componentes**: Gestión de eventos (`messages.upsert`, `connection.update`), manejo de credenciales, administración QR.

### Pipeline de Media

- **Propósito**: Descargar y procesar distintos tipos de media.
- **Componentes**: `downloadImageMessage`, `downloadDocumentMessage`, almacenamiento temporal, subida a Supabase Storage.

### Extracción de Información

- **Propósito**: Convertir media/texto en datos estructurados.
- **Componentes**: OCR con Vision, parsing estructurado con OpenAI, normalización de fechas/horas.

### Matching Fuzzy

- **Propósito**: Identificar entidades existentes a partir de texto extraído.
- **Componentes**: `matchDestinatario`, `matchMetodoPago`, determinación de score para flujo automático o asistido.

### Máquina de Estados (FSM)

- **Propósito**: Gestionar el flujo conversacional y mantener contexto.
- **Componentes**: `setUserState`, `getUserState`, `clearUserState`, timeout por inactividad.

### Persistencia

- **Propósito**: Almacenar datos permanentes y temporales.
- **Componentes**: MongoDB para auth/lock, Supabase para entidades de negocio, sesiones temporales para reanudación.

### Recuperación y Resiliencia

- **Propósito**: Mantener servicio ante desconexiones o errores.
- **Componentes**: `recoverFrom428`, `ensureSingleInstanceLock`, retry mechanisms.

## Interacción entre Componentes

El diseño modular permite que cada capa tenga responsabilidades bien definidas y se comuniquen a través de interfaces claras. Las funciones core como `processInitialMessage` orquestan la interacción entre capas.

La persistencia temporal con `saveTempSession` asegura que el estado conversacional se pueda recuperar incluso tras reinicio del servicio, mientras que el lock distribuido garantiza que solo una instancia del bot esté activa en un momento dado.