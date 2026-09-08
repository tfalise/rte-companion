import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { initializeDatabase } from './database'

describe('initializeDatabase', () => {
  it('creates an empty versioned metadata store', async () => {
    const database = await initializeDatabase()
    const transaction = database.transaction('application-metadata', 'readonly')
    const countRequest = transaction.objectStore('application-metadata').count()
    const count = await new Promise<number>((resolve, reject) => {
      countRequest.onsuccess = () => resolve(countRequest.result)
      countRequest.onerror = () => reject(countRequest.error)
    })

    expect(database.name).toBe('rte-companion')
    expect(database.version).toBe(1)
    expect(count).toBe(0)

    database.close()
  })
})