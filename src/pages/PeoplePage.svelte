<script lang="ts">
  import { Pencil, Plus, Users } from '@lucide/svelte'
  import type { Person, Team } from '../services/database'

  export let people: Person[]
  export let teams: Team[]

  const fullName = (person: Person) => `${person.firstName} ${person.lastName}`
  const teamNames = (person: Person) => teams
    .filter((team) => person.teamIds.includes(team.id))
    .map((team) => team.name)
    .sort((left, right) => left.localeCompare(right, 'fr'))
</script>

<section class="page" aria-labelledby="page-title">
  <header class="page-heading">
    <div>
      <p class="page-kicker">Projet</p>
      <h1 id="page-title">Personnes</h1>
      <p class="page-introduction">{people.length} {people.length === 1 ? 'personne mobilisée' : 'personnes mobilisées'} sur le projet</p>
    </div>
    <a class="primary-button" href="#personnes/nouveau">
      <Plus size={18} aria-hidden="true" />
      Ajouter une personne
    </a>
  </header>

  {#if people.length === 0}
    <div class="empty-state">
      <Users size={32} strokeWidth={1.5} aria-hidden="true" />
      <h2>Aucune personne pour le moment</h2>
      <p>Ajoutez la première personne mobilisée sur le projet.</p>
    </div>
  {:else}
    <div class="data-table-wrapper">
      <table>
        <thead><tr><th>Personne</th><th>Email</th><th>Équipes</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody>
          {#each [...people].sort((left, right) => `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, 'fr')) as person}
            <tr>
              <td class="person-name">{fullName(person)}</td>
              <td><a class="email-link" href={`mailto:${person.email}`}>{person.email}</a></td>
              <td>
                <div class="tag-list">
                  {#each teamNames(person) as teamName}<span class="tag">{teamName}</span>{/each}
                  {#if teamNames(person).length === 0}<span class="muted-text">Aucune</span>{/if}
                </div>
              </td>
              <td class="action-cell"><a class="icon-button" href={`#personnes/${person.id}`} aria-label={`Modifier ${fullName(person)}`} title="Modifier"><Pencil size={18} aria-hidden="true" /></a></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>