const DATABASE_NAME = 'rte-companion'
const DATABASE_VERSION = 1
const METADATA_STORE = 'application-metadata'

let databasePromise: Promise<IDBDatabase> | undefined

export function initializeDatabase(): Promise<IDBDatabase> {
  databasePromise ??= openDatabase().catch((error: unknown) => {
    databasePromise = undefined
    throw error
  })

  return databasePromise
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(METADATA_STORE)) {
        request.result.createObjectStore(METADATA_STORE)
      }
    }

    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }

    request.onerror = () => {
      reject(request.error ?? new Error("L'ouverture d'IndexedDB a échoué."))
    }
  })
}