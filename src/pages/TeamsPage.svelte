<script lang="ts">
  import { Check, Clipboard, Plus, UsersRound } from '@lucide/svelte'
  import { copyText } from '../services/clipboard'
  import type { Person, Team, TeamInput } from '../services/database'

  export let people: Person[]
  export let teams: Team[]
  export let selectedTeamId: string
  export let onSaveTeam: (input: TeamInput) => Promise<void>

  let name = ''
  let slug = ''
  let showForm = false
  let saving = false
  let error = ''
  let copied = false
  $: selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0]
  $: members = selectedTeam ? people.filter((person) => person.teamIds.includes(selectedTeam.id)) : []

  async function createTeam(event: SubmitEvent) {
    event.preventDefault()
    saving = true
    error = ''
    try {
      await onSaveTeam({ name, slug })
      name = ''
      slug = ''
      showForm = false
    } catch (caughtError) {
      console.error("Impossible de créer l'équipe.", caughtError)
      error = 'Ce slug est peut-être déjà utilisé.'
    } finally {
      saving = false
    }
  }

  async function copyEmails() {
    try {
      await copyText(members.map((person) => person.email).join(';'))
      copied = true
      window.setTimeout(() => (copied = false), 2000)
    } catch (caughtError) {
      console.error('Impossible de copier les adresses email.', caughtError)
      error = 'La copie dans le presse-papiers a échoué.'
    }
  }
</script>

<section class="page" aria-labelledby="page-title">
  <header class="page-heading"><div><p class="page-kicker">Projet</p><h1 id="page-title">Équipes</h1></div><button class="secondary-button" type="button" on:click={() => (showForm = !showForm)}><Plus size={18} aria-hidden="true" /> Nouvelle équipe</button></header>
  {#if showForm}
    <form class="inline-form" on:submit={createTeam}>
      <label>Nom<input bind:value={name} required placeholder="DevOps & Infra" /></label>
      <label>Slug technique<input bind:value={slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="dev-devops-infra" /></label>
      <button class="primary-button" type="submit" disabled={saving}>{saving ? 'Création…' : 'Créer'}</button>
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    </form>
  {/if}

  {#if teams.length === 0}
    <div class="empty-state"><UsersRound size={32} strokeWidth={1.5} aria-hidden="true" /><h2>Aucune équipe</h2><p>Créez une équipe pour commencer à organiser les personnes.</p></div>
  {:else}
    <div class="teams-layout">
      <nav class="team-list" aria-label="Liste des équipes">
        {#each teams as team}<a class:active={team.id === selectedTeam?.id} href={`#equipes/${team.id}`}><span>{team.name}</span><small>{team.slug}</small></a>{/each}
      </nav>
      <section class="team-detail" aria-labelledby="team-name">
        <header class="team-heading"><div><h2 id="team-name">{selectedTeam.name}</h2><p>{members.length} {members.length === 1 ? 'membre' : 'membres'}</p></div><div class="team-actions"><button class="icon-text-button" type="button" on:click={copyEmails} disabled={members.length === 0} title="Copier les emails"><svelte:component this={copied ? Check : Clipboard} size={18} aria-hidden="true" />{copied ? 'Copiés' : 'Copier les emails'}</button><a class="primary-button" href={`#equipes/${selectedTeam.id}/ajouter`}><Plus size={18} aria-hidden="true" /> Ajouter un membre</a></div></header>
        {#if members.length === 0}<p class="empty-detail">Cette équipe n’a pas encore de membre.</p>{:else}<ul class="member-list">{#each members as person}<li><div><strong>{person.firstName} {person.lastName}</strong><a href={`mailto:${person.email}`}>{person.email}</a></div><a class="secondary-button compact-button" href={`#personnes/${person.id}?equipe=${selectedTeam.id}`}>Modifier</a></li>{/each}</ul>{/if}
      </section>
    </div>
  {/if}
</section>