<script lang="ts">
  import { Check, Clipboard, Pencil, Plus, Save, UsersRound, X } from '@lucide/svelte'
  import { copyText } from '../services/clipboard'
  import { DEFAULT_TEAM_COLOR, type Person, type Team, type TeamInput } from '../services/database'

  export let people: Person[]
  export let teams: Team[]
  export let selectedTeamId: string
  export let onSaveTeam: (input: TeamInput, id?: string) => Promise<void>

  let name = ''
  let slug = ''
  let color = DEFAULT_TEAM_COLOR
  let showForm = false
  let editingTeamId = ''
  let saving = false
  let error = ''
  let copied = false
  $: sortedTeams = [...teams].sort((left, right) => left.name.localeCompare(right.name, 'fr'))
  $: selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? sortedTeams[0]
  $: members = selectedTeam
    ? people.filter((person) => person.teamIds.includes(selectedTeam.id)).sort((left, right) => `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, 'fr'))
    : []

  $: isEditing = editingTeamId !== ''

  async function submitTeam(event: SubmitEvent) {
    event.preventDefault()
    saving = true
    error = ''
    try {
      await onSaveTeam({ name, slug, color }, isEditing ? editingTeamId : undefined)
      resetForm()
    } catch (caughtError) {
      console.error("Impossible d'enregistrer l'équipe.", caughtError)
      error = 'Ce slug est peut-être déjà utilisé.'
    } finally {
      saving = false
    }
  }

  function startCreateTeam() {
    if (showForm && !isEditing) {
      resetForm()
      return
    }

    name = ''
    slug = ''
    color = DEFAULT_TEAM_COLOR
    editingTeamId = ''
    showForm = true
    error = ''
  }

  function startEditTeam(team: Team) {
    name = team.name
    slug = team.slug
    color = team.color
    editingTeamId = team.id
    showForm = true
    error = ''
  }

  function resetForm() {
    name = ''
    slug = ''
    color = DEFAULT_TEAM_COLOR
    editingTeamId = ''
    showForm = false
    error = ''
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
  <header class="page-heading"><div><p class="page-kicker">Projet</p><h1 id="page-title">Équipes</h1></div><button class="secondary-button" type="button" on:click={startCreateTeam}><Plus size={18} aria-hidden="true" /> Nouvelle équipe</button></header>
  {#if showForm}
    <form class="inline-form" on:submit={submitTeam}>
      <label>Nom<input bind:value={name} required placeholder="DevOps & Infra" /></label>
      <label>Slug technique<input bind:value={slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="dev-devops-infra" /></label>
      <label>Couleur<input bind:value={color} type="color" aria-label="Couleur de l’équipe" /></label>
      <div class="inline-form-actions">
        {#if isEditing}<button class="secondary-button compact-button" type="button" on:click={resetForm}><X size={17} aria-hidden="true" /> Annuler</button>{/if}
        <button class="primary-button" type="submit" disabled={saving}><svelte:component this={isEditing ? Save : Plus} size={18} aria-hidden="true" />{saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer'}</button>
      </div>
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    </form>
  {/if}

  {#if teams.length === 0}
    <div class="empty-state"><UsersRound size={32} strokeWidth={1.5} aria-hidden="true" /><h2>Aucune équipe</h2><p>Créez une équipe pour commencer à organiser les personnes.</p></div>
  {:else}
    <div class="teams-layout">
      <nav class="team-list" aria-label="Liste des équipes">
        {#each sortedTeams as team}<a class:active={team.id === selectedTeam?.id} href={`#equipes/${team.id}`}><span>{team.name}</span><small>{team.slug}</small></a>{/each}
      </nav>
      <section class="team-detail" aria-labelledby="team-name">
        <header class="team-heading"><div><h2 id="team-name">{selectedTeam.name}</h2><p>{members.length} {members.length === 1 ? 'membre' : 'membres'}</p></div><div class="team-actions"><button class="icon-text-button" type="button" on:click={() => startEditTeam(selectedTeam)} title="Modifier l’équipe"><Pencil size={18} aria-hidden="true" />Modifier</button><button class="icon-text-button" type="button" on:click={copyEmails} disabled={members.length === 0} title="Copier les emails"><svelte:component this={copied ? Check : Clipboard} size={18} aria-hidden="true" />{copied ? 'Copiés' : 'Copier les emails'}</button><a class="primary-button" href={`#equipes/${selectedTeam.id}/ajouter`}><Plus size={18} aria-hidden="true" /> Ajouter un membre</a></div></header>
        {#if members.length === 0}<p class="empty-detail">Cette équipe n’a pas encore de membre.</p>{:else}<ul class="member-list">{#each members as person}<li><div><strong>{person.firstName} {person.lastName}</strong><a href={`mailto:${person.email}`}>{person.email}</a></div><a class="secondary-button compact-button" href={`#personnes/${person.id}?equipe=${selectedTeam.id}`}>Modifier</a></li>{/each}</ul>{/if}
      </section>
    </div>
  {/if}
</section>