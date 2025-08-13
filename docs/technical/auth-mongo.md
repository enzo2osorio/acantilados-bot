
### 4. Auth MONGODB
```markdown
---
id: auth-mongo
title: Autenticación y MongoDB
sidebar_position: 4
---

# Autenticación y MongoDB

El bot utiliza MongoDB como capa de persistencia para las credenciales de WhatsApp, asegurando que no sea necesario escanear el código QR en cada reinicio. Además, implementa un sistema de bloqueo distribuido para garantizar que solo una instancia del bot esté activa a la vez.

## Adaptador de Baileys para MongoDB

### Diseño del Adaptador

El adaptador `useMongoAuthState` es una implementación personalizada que permite persistir las credenciales y las claves de cifrado E2E de Baileys en MongoDB. 

```javascript
// Estructura básica del adaptador
const useMongoAuthState = async (collection_prefix = 'baileys_') => {
  const keysCollection = db.collection(`${collection_prefix}keys`);
  const credsCollection = db.collection(`${collection_prefix}creds`);

  // Implementa saveCreds, keys, state...
  
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => { /* ... */ },
        set: async (type, id, value) => { /* ... */ },
        clear: async () => { /* ... */ }
      }
    },
    saveCreds: async () => { /* ... */ },
    clearState: async () => { /* ... */ }
  };
};

```

Serialización y Deserialización
Uno de los desafíos principales es manejar correctamente los Buffer de Node.js en MongoDB:

```javascript
// Serialización profunda
const serializeDeep = (obj) => {
  if (!obj) return obj;
  if (Buffer.isBuffer(obj)) {
    return {
      _type: 'Buffer',
      data: obj.toString('base64')
    };
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDeep);
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDeep(value);
    }
    return result;
  }
  return obj;
};

// Deserialización profunda
const deserializeDeep = (obj) => {
  if (!obj) return obj;
  if (obj._type === 'Buffer' && obj.data) {
    return Buffer.from(obj.data, 'base64');
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeDeep);
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deserializeDeep(value);
    }
    return result;
  }
  return obj;
};

```

Índices y TTL
Para optimizar rendimiento y gestionar el ciclo de vida de los documentos:


```javascript
// Crear índice TTL para llaves
await keysCollection.createIndex(
  { updatedAt: 1 },
  {
    expireAfterSeconds: ttlSeconds,
    background: true
  }
);

// Índice para keep (preservar durante limpieza)
await keysCollection.createIndex({ keep: 1 }, { background: true });

// Índice para tipos e IDs (búsquedas rápidas)
await keysCollection.createIndex({ type: 1, id: 1 }, { background: true });

// Índice TTL para locks
await locksCollection.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0, background: true }
);


```
Sistema de Lock Distribuido
El lock distribuido asegura que solo una instancia del bot esté activa en un momento dado, evitando conflictos en la sesión de WhatsApp.

Adquisición del Lock

```javascript
const acquireLock = async (instanceId) => {
  const now = new Date();
  const expireAt = new Date(now.getTime() + LOCK_TTL_MS);
  
  try {
    const result = await locksCollection.updateOne(
      { _id: instanceId },
      {
        $set: {
          hostname: os.hostname(),
          pid: process.pid,
          updatedAt: now,
          expireAt: expireAt
        },
        $setOnInsert: {
          startedAt: now
        }
      },
      { upsert: true }
    );
    
    return result.matchedCount === 0 || result.modifiedCount > 0;
  } catch (error) {
    console.error("Error acquiring lock:", error);
    return false;
  }
};

```

Renovación del Lock

```javascript
const renewLock = async (instanceId) => {
  const now = new Date();
  const expireAt = new Date(now.getTime() + LOCK_TTL_MS);
  
  try {
    const result = await locksCollection.updateOne(
      {
        _id: instanceId,
        hostname: os.hostname(),
        pid: process.pid
      },
      {
        $set: {
          updatedAt: now,
          expireAt: expireAt
        }
      }
    );
    
    return result.matchedCount === 1;
  } catch (error) {
    console.error("Error renewing lock:", error);
    return false;
  }
};
```

Liberación del Lock

```javascript
const releaseLock = async (instanceId) => {
  try {
    const result = await locksCollection.deleteOne({
      _id: instanceId,
      hostname: os.hostname(),
      pid: process.pid
    });
    
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error releasing lock:", error);
    return false;
  }
};
```
Verificación del Lock

```javascript
const verifyLock = async (instanceId) => {
  try {
    const lock = await locksCollection.findOne({
      _id: instanceId
    });
    
    if (!lock) return true; // No lock, free to acquire
    
    if (lock.hostname === os.hostname() && lock.pid === process.pid) {
      return true; // We own the lock
    }
    
    // Check if lock is stale (TTL may not have triggered yet)
    if (lock.expireAt < new Date()) {
      await locksCollection.deleteOne({ _id: instanceId });
      return true;
    }
    
    return false; // Lock exists and is valid
  } catch (error) {
    console.error("Error verifying lock:", error);
    return false;
  }
};
```

Conexión a MongoDB
El bot utiliza un singleton para la conexión a MongoDB, garantizando que se reutilice la misma conexión en toda la aplicación:

```javascript
// Singleton para cliente MongoDB
let client = null;
let db = null;

const getClient = async () => {
  if (client && client.topology && client.topology.isConnected()) {
    return client;
  }

  try {
    client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: MONGO_CONNECTION_POOL_SIZE,
      serverSelectionTimeoutMS: MONGO_CONNECTION_TIMEOUT_MS,
      family: MONGO_CONNECTION_FAMILY
    });

    await client.connect();
    db = client.db(MONGODB_DB);
    console.log("✅ MongoDB connected successfully");
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

const closeClient = async () => {
  if (client) {
    try {
      await client.close();
      client = null;
      db = null;
      console.log("✅ MongoDB connection closed");
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error);
    }
  }
};

const getDB = async () => {
  if (!db) {
    await getClient();
  }
  return db;
};
```

Recuperación de Sesiones Temporales
Además de las credenciales principales, se almacenan sesiones temporales para recuperar el estado de las conversaciones en caso de reinicio:

```javascript
// Estructura de la colección temporal_sessions
{
  "_id": ObjectId("..."),
  "jid": "1234567890@s.whatsapp.net",
  "state": "AWAITING_SAVE_CONFIRMATION",
  "data": {
    // Datos estructurados del comprobante
    "nombre": "Empresa X",
    "monto": 1500.25,
    // ...
  },
  "createdAt": ISODate("2025-05-25T12:34:56.789Z"),
  "lastUpdated": ISODate("2025-05-25T12:39:56.789Z"),
  "lastActivityAt": ISODate("2025-05-25T12:39:56.789Z")
}
```

Los índices en esta colección incluyen:

```javascript
// Índice para JID (búsquedas rápidas)
await tempSessionsCollection.createIndex({ jid: 1 }, { background: true });

// Índice TTL para auto-limpieza
await tempSessionsCollection.createIndex(
  { lastUpdated: 1 },
  { expireAfterSeconds: SESSION_TTL_SECONDS, background: true }
);

Limpieza y Mantenimiento
Se implementan funciones para limpiar las credenciales y las llaves en caso de problemas:

const clearMongoAuthState = async (collection_prefix) => {
  try {
    const keysCollection = db.collection(`${collection_prefix}keys`);
    const credsCollection = db.collection(`${collection_prefix}creds`);
    
    await Promise.all([
      keysCollection.deleteMany({}),
      credsCollection.deleteMany({})
    ]);
    
    console.log(`✅ Cleared auth state for prefix ${collection_prefix}`);
    return true;
  } catch (error) {
    console.error(`❌ Error clearing auth state: ${error.message}`);
    return false;
  }
};
```

También se implementa una limpieza periódica de llaves antiguas que no están marcadas como keep:

```javascript
const cleanupOldKeys = async (collection_prefix, maxAgeDays = 30) => {
  try {
    const keysCollection = db.collection(`${collection_prefix}keys`);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    const result = await keysCollection.deleteMany({
      keep: { $ne: true },
      updatedAt: { $lt: cutoffDate }
    });
    
    console.log(`✅ Removed ${result.deletedCount} old keys`);
    return result.deletedCount;
  } catch (error) {
    console.error(`❌ Error cleaning up old keys: ${error.message}`);
    return 0;
  }
};
```


