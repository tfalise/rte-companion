const DATABASE_NAME = 'rte-companion'
const DATABASE_VERSION = 3
const METADATA_STORE = 'application-metadata'
const PEOPLE_STORE = 'people'
const TEAMS_STORE = 'teams'
export const DEFAULT_TEAM_COLOR = '#007d73'

export interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  teamIds: string[]
}

export interface Team {
  id: string
  name: string
  slug: string
  color: string
}

export type PersonInput = Omit<Person, 'id'>
export type TeamInput = Omit<Team, 'id' | 'color'> & Partial<Pick<Team, 'color'>>

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

    request.onupgradeneeded = (event) => {
      if (!request.result.objectStoreNames.contains(METADATA_STORE)) {
        request.result.createObjectStore(METADATA_STORE)
      }

      if (!request.result.objectStoreNames.contains(PEOPLE_STORE)) {
        request.result.createObjectStore(PEOPLE_STORE, { keyPath: 'id' })
      }

      if (!request.result.objectStoreNames.contains(TEAMS_STORE)) {
        const teamStore = request.result.createObjectStore(TEAMS_STORE, { keyPath: 'id' })
        teamStore.createIndex('slug', 'slug', { unique: true })
      } else if (event.oldVersion < 3) {
        migrateTeamColors(request.transaction?.objectStore(TEAMS_STORE))
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

export async function listPeople(): Promise<Person[]> {
  return getAll<Person>(PEOPLE_STORE)
}

export async function savePerson(input: PersonInput, id: string = crypto.randomUUID()): Promise<Person> {
  const person: Person = {
    id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    teamIds: [...new Set(input.teamIds)],
  }

  await put(PEOPLE_STORE, person)
  return person
}

export async function assignPersonToTeam(personId: string, teamId: string): Promise<Person> {
  const database = await initializeDatabase()
  const transaction = database.transaction(PEOPLE_STORE, 'readwrite')
  const store = transaction.objectStore(PEOPLE_STORE)
  const person = await requestResult<Person | undefined>(store.get(personId))

  if (!person) {
    transaction.abort()
    throw new Error("La personne à affecter n'existe pas.")
  }

  const updatedPerson = { ...person, teamIds: [...new Set([...person.teamIds, teamId])] }
  store.put(updatedPerson)
  await transactionComplete(transaction)
  return updatedPerson
}

export async function listTeams(): Promise<Team[]> {
  return getAll<Team>(TEAMS_STORE)
}

export async function saveTeam(input: TeamInput, id: string = crypto.randomUUID()): Promise<Team> {
  const team: Team = {
    id,
    name: input.name.trim(),
    slug: input.slug.trim(),
    color: normalizeTeamColor(input.color),
  }

  await put(TEAMS_STORE, team)
  return team
}

function migrateTeamColors(teamStore: IDBObjectStore | undefined) {
  if (!teamStore) return

  const request = teamStore.openCursor()
  request.onsuccess = () => {
    const cursor = request.result
    if (!cursor) return

    const team = cursor.value as Team
    cursor.update({ ...team, color: normalizeTeamColor(team.color) })
    cursor.continue()
  }
}

function normalizeTeamColor(color: string | undefined): string {
  const trimmedColor = color?.trim() ?? ''
  return /^#[0-9a-f]{6}$/i.test(trimmedColor) ? trimmedColor.toLowerCase() : DEFAULT_TEAM_COLOR
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const database = await initializeDatabase()
  const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll()
  return requestResult(request)
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const database = await initializeDatabase()
  const transaction = database.transaction(storeName, 'readwrite')
  transaction.objectStore(storeName).put(value)
  await transactionComplete(transaction)
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('La requête IndexedDB a échoué.'))
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('La transaction IndexedDB a échoué.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('La transaction IndexedDB a été annulée.'))
  })
}