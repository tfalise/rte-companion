<script lang="ts">
  import { Pencil, Plus, Users } from '@lucide/svelte'
  import type { Person, Team } from '../services/database'

  export let people: Person[]
  export let teams: Team[]

  const fullName = (person: Person) => `${person.firstName} ${person.lastName}`
  const personTeams = (person: Person) => teams
    .filter((team) => person.teamIds.includes(team.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'))

  function readableTextColor(backgroundColor: string) {
    const backgroundLuminance = relativeLuminance(backgroundColor)
    const darkText = '#18242b'
    const lightText = '#ffffff'

    return contrastRatio(backgroundLuminance, relativeLuminance(darkText)) > contrastRatio(backgroundLuminance, relativeLuminance(lightText)) ? darkText : lightText
  }

  function relativeLuminance(hexColor: string) {
    const normalizedColor = hexColor.replace('#', '')
    const channels = [normalizedColor.slice(0, 2), normalizedColor.slice(2, 4), normalizedColor.slice(4, 6)]
      .map((channel) => Number.parseInt(channel, 16) / 255)
      .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  function contrastRatio(leftLuminance: number, rightLuminance: number) {
    const lighterLuminance = Math.max(leftLuminance, rightLuminance)
    const darkerLuminance = Math.min(leftLuminance, rightLuminance)

    return (lighterLuminance + 0.05) / (darkerLuminance + 0.05)
  }
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
                  {#each personTeams(person) as team}<span class="tag" style={`background-color: ${team.color}; color: ${readableTextColor(team.color)}`}>{team.name}</span>{/each}
                  {#if personTeams(person).length === 0}<span class="muted-text">Aucune</span>{/if}
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