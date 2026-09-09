<script lang="ts">
  import { ArrowLeft, Plus, Search, UserPlus } from '@lucide/svelte'
  import type { Person, Team } from '../services/database'

  export let people: Person[]
  export let teams: Team[]
  export let teamId: string
  export let onAssign: (personId: string, teamId: string) => Promise<void>

  let query = ''
  let savingPersonId = ''
  let error = ''

  $: team = teams.find((candidate) => candidate.id === teamId)
  $: availablePeople = people.filter((person) => !person.teamIds.includes(teamId))
  $: normalizedQuery = normalize(query)
  $: filteredPeople = availablePeople
    .filter((person) => normalize(`${person.firstName} ${person.lastName} ${person.email}`).includes(normalizedQuery))
    .sort((left, right) => `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`, 'fr'))

  function normalize(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim()
  }

  async function assign(person: Person) {
    savingPersonId = person.id
    error = ''
    try {
      await onAssign(person.id, teamId)
    } catch (caughtError) {
      console.error("Impossible d'ajouter la personne à l'équipe.", caughtError)
      error = "L'ajout à l'équipe a échoué."
      savingPersonId = ''
    }
  }
</script>

<section class="page narrow-page" aria-labelledby="page-title">
  <a class="back-link" href={`#equipes/${teamId}`}><ArrowLeft size={17} aria-hidden="true" /> Retour à l’équipe</a>

  {#if !team}
    <h1 id="page-title">Équipe introuvable</h1>
    <p class="page-introduction">Cette équipe n’existe plus dans le projet.</p>
  {:else}
    <header class="page-heading">
      <div>
        <p class="page-kicker">{team.name}</p>
        <h1 id="page-title">Ajouter un membre</h1>
        <p class="page-introduction">Recherchez une personne déjà enregistrée dans le projet.</p>
      </div>
    </header>

    <div class="member-picker">
      <label class="search-field" for="person-search">
        <Search size={19} aria-hidden="true" />
        <span class="visually-hidden">Rechercher une personne</span>
        <input id="person-search" type="search" bind:value={query} placeholder="Nom, prénom ou adresse email" autocomplete="off" />
      </label>

      <div class="picker-summary" aria-live="polite">
        {filteredPeople.length} {filteredPeople.length === 1 ? 'personne disponible' : 'personnes disponibles'}
      </div>

      {#if filteredPeople.length > 0}
        <ul class="person-results">
          {#each filteredPeople as person}
            <li>
              <div><strong>{person.firstName} {person.lastName}</strong><span>{person.email}</span></div>
              <button class="secondary-button compact-button" type="button" disabled={savingPersonId !== ''} on:click={() => assign(person)}>
                <UserPlus size={17} aria-hidden="true" />
                {savingPersonId === person.id ? 'Ajout…' : 'Ajouter'}
              </button>
            </li>
          {/each}
        </ul>
      {:else if availablePeople.length === 0}
        <p class="empty-detail">Toutes les personnes du projet appartiennent déjà à cette équipe.</p>
      {:else}
        <p class="empty-detail">Aucune personne ne correspond à cette recherche.</p>
      {/if}

      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    </div>

    <div class="create-person-callout">
      <div><strong>La personne n’est pas encore dans le projet ?</strong><span>Créez sa fiche et elle sera directement ajoutée à cette équipe.</span></div>
      <a class="primary-button" href={`#personnes/nouveau?equipe=${teamId}`}><Plus size={18} aria-hidden="true" /> Créer une personne</a>
    </div>
  {/if}
</section>