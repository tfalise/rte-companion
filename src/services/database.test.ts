import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { DEFAULT_TEAM_COLOR, assignPersonToTeam, initializeDatabase, listPeople, listTeams, savePerson, saveTeam } from './database'

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
    expect(database.version).toBe(3)
    expect(count).toBe(0)
    expect([...database.objectStoreNames]).toEqual(['application-metadata', 'people', 'teams'])
  })

  it('stores people assigned to several teams', async () => {
    const delivery = await saveTeam({ name: 'Delivery', slug: 'dev-delivery', color: '#1A7F37' })
    const devops = await saveTeam({ name: 'DevOps & Infra', slug: 'dev-devops-infra' })
    const support = await saveTeam({ name: 'Support', slug: 'support' })

    const person = await savePerson({
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille.martin@example.com',
      teamIds: [delivery.id, devops.id, devops.id],
    })

    expect(await listTeams()).toEqual(expect.arrayContaining([
      expect.objectContaining({ ...delivery, color: '#1a7f37' }),
      expect.objectContaining({ ...devops, color: DEFAULT_TEAM_COLOR }),
      expect.objectContaining({ ...support, color: DEFAULT_TEAM_COLOR }),
    ]))
    expect(await listPeople()).toEqual([
      expect.objectContaining({
        firstName: 'Camille',
        teamIds: [delivery.id, devops.id],
      }),
    ])

    await savePerson({ ...person, email: 'camille.martin@project.example' }, person.id)
    expect(await listPeople()).toEqual([
      expect.objectContaining({ id: person.id, email: 'camille.martin@project.example' }),
    ])

    await assignPersonToTeam(person.id, support.id)
    await assignPersonToTeam(person.id, support.id)
    expect((await listPeople())[0].teamIds).toEqual([delivery.id, devops.id, support.id])
  })
})