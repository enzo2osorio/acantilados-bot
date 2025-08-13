---
id: environment
title: Variables de Entorno
sidebar_position: 3
---

# Variables de Entorno

El bot utiliza diversas variables de entorno para su configuración. A continuación se presenta un listado exhaustivo de todas las variables, su propósito, si contienen información sensible y sus valores por defecto.

> **IMPORTANTE**: Todas las variables marcadas como sensibles deben configurarse en un archivo `.env` que **NO** debe ser versionado en el repositorio.

## Variables Básicas

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `NODE_ENV` | Entorno de ejecución | No | `development` | `production` |
| `PORT` | Puerto del servidor HTTP | No | `3000` | `8080` |
| `HOST` | Host del servidor HTTP | No | `0.0.0.0` | `localhost` |
| `LOG_LEVEL` | Nivel de detalle de logs | No | `info` | `debug`, `warn`, `error` |
| `APP_VERSION` | Versión del bot | No | - | `1.0.0` |

## Conexión a MongoDB

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB | **Sí** | - | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB` | Nombre de la base de datos | No | `whatsapp_bot` | `wa_bot_prod` |
| `MONGODB_COLLECTION_PREFIX` | Prefijo para colecciones de auth | No | `baileys_` | `wa_bot_` |
| `MONGO_KEYS_TTL_SECONDS` | TTL para llaves E2E | No | - | `2592000` (30 días) |
| `MONGO_CONNECTION_POOL_SIZE` | Tamaño del pool de conexiones | No | `10` | `5` |
| `MONGO_CONNECTION_TIMEOUT_MS` | Timeout para conexiones | No | `30000` | `10000` |
| `MONGO_CONNECTION_FAMILY` | Versión IP (4 o 6) | No | `4` | `4` |
| `MONGO_LOCK_TTL_SECONDS` | TTL para lock distribuido | No | `300` | `600` |

## Configuración Baileys

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `BAILEYS_INSTANCE` | Identificador único de instancia | No | `default` | `prod-server-1` |
| `BAILEYS_LOG_LEVEL` | Nivel de logs específico Baileys | No | `silent` | `debug`, `trace` |
| `RECOVERY_428_WAIT_MS` | Espera antes de reconectar tras 428 | No | `120000` (2 min) | `60000` |
| `BAILEYS_VERSION` | Versión protocolo WhatsApp | No | Auto | `1.0.0` |

## Límites y Timeouts

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `MAX_RETRIES` | Máximo de reintentos conexión | No | `5` | `10` |
| `RETRY_DELAY_MS` | Delay entre reintentos | No | `5000` | `10000` |
| `INACTIVITY_TIMEOUT_MS` | Timeout de inactividad de usuario | No | `180000` (3 min) | `300000` |
| `MESSAGE_FREEZE_MS` | Delay tras manejo de mensaje | No | `1500` | `1000` |
| `KEEP_ALIVE_INTERVAL_MS` | Intervalo ping keep-alive | No | `45000` | `60000` |
| `CONNECTION_READY_DELAY_MS` | Delay antes de enviar primer mensaje | No | `3000` | `2000` |
| `RATE_LIMIT_MESSAGES` | Límite mensajes por minuto | No | `20` | `10` |

## APIs Externas

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `OPENAI_API_KEY` | API Key de OpenAI | **Sí** | - | `sk-...` |
| `OPENAI_MODEL` | Modelo de OpenAI a utilizar | No | `gpt-4o` | `gpt-4-turbo` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al archivo de credenciales GCP | No | - | `/path/to/credentials.json` |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Credenciales GCP como JSON inline | **Sí** | - | `{"type":"service_account",...}` |
| `VISION_API_ENDPOINT` | Endpoint de Google Vision | No | Auto | `https://vision.googleapis.com` |

## Supabase

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `SUPABASE_URL` | URL de Supabase | No | - | `https://abcdefg.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave anónima Supabase | **Sí** | - | `eyJhbGciOiJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio Supabase | **Sí** | - | `eyJhbGciOiJ...` |
| `SUPABASE_STORAGE_BUCKET` | Bucket de almacenamiento | No | `comprobantes` | `comprobantes-prod` |
| `SUPABASE_STORAGE_PATH` | Ruta dentro del bucket | No | `uploads` | `receipts` |

## Seguridad

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `ALLOWED_JIDS` | JIDs permitidos (separados por coma) | **Sí** | - | `123456@s.whatsapp.net,9876@g.us` |
| `SESSION_CLEAR_KEY` | Clave para endpoints admin | **Sí** | - | `super-secret-key` |
| `ADMIN_IPS` | IPs permitidas para endpoints admin | **Sí** | - | `192.168.1.1,10.0.0.1` |

## Fuzzy Matching

| Variable | Descripción | Sensible | Valor por defecto | Ejemplo |
|----------|-------------|----------|-------------------|---------|
| `DEST_SCORE_MIN_LIST` | Umbral mínimo para lista | No | `0.65` | `0.7` |
| `DEST_SCORE_MIN_AUTO` | Umbral para auto-aceptar | No | `0.85` | `0.9` |
| `METODO_PAGO_SCORE_MIN_LIST` | Umbral mínimo para lista | No | `0.60` | `0.65` |
| `METODO_PAGO_SCORE_MIN_AUTO` | Umbral para auto-aceptar | No | `0.85` | `0.9` |

## Ejemplo de .env

```bash
# Básicas
NODE_ENV=production
PORT=8080

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bot
MONGODB_DB=whatsapp_bot_prod
MONGODB_COLLECTION_PREFIX=wa_bot_
MONGO_KEYS_TTL_SECONDS=2592000

# Baileys
BAILEYS_INSTANCE=prod-server-1
RECOVERY_428_WAIT_MS=120000

# APIs
OPENAI_API_KEY=sk-abcdefg123456789
OPENAI_MODEL=gpt-4o
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"my-project",...}

# Supabase
SUPABASE_URL=https://abcdefg.supabase.co
SUPABASE_ANON_KEY=eyJhfegsJIUzI1NiIsInR5cCIfEEFkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciwdawfg32NiR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=comprobantes-prod

# Seguridad
ALLOWED_JIDS=1234567890@s.whatsapp.net,987654321@g.us
SESSION_CLEAR_KEY=mi-clave-super-secreta-123

# Fuzzy Matching
DEST_SCORE_MIN_LIST=0.65
DEST_SCORE_MIN_AUTO=0.85
METODO_PAGO_SCORE_MIN_LIST=0.60
METODO_PAGO_SCORE_MIN_AUTO=0.85