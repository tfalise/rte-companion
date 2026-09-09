<script lang="ts">
  import { ArrowLeft, Save } from '@lucide/svelte'
  import type { Person, PersonInput, Team } from '../services/database'

  export let people: Person[]
  export let teams: Team[]
  export let personId: string
  export let initialTeamId: string
  export let onSave: (input: PersonInput, id?: string) => Promise<void>

  $: existingPerson = people.find((person) => person.id === personId)
  $: isNew = personId === 'nouveau'
  let loadedPersonId = ''
  let firstName = ''
  let lastName = ''
  let email = ''
  let teamIds: string[] = []
  let saving = false
  let error = ''

  $: if (personId !== loadedPersonId) {
    loadedPersonId = personId
    firstName = existingPerson?.firstName ?? ''
    lastName = existingPerson?.lastName ?? ''
    email = existingPerson?.email ?? ''
    teamIds = existingPerson?.teamIds ? [...existingPerson.teamIds] : initialTeamId ? [initialTeamId] : []
  }

  function toggleTeam(teamId: string, checked: boolean) {
    teamIds = checked ? [...teamIds, teamId] : teamIds.filter((id) => id !== teamId)
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    saving = true
    error = ''
    try {
      await onSave({ firstName, lastName, email, teamIds }, isNew ? undefined : personId)
    } catch (caughtError) {
      console.error("Impossible d'enregistrer la personne.", caughtError)
      error = "L'enregistrement a échoué. Vérifiez les informations saisies."
    } finally {
      saving = false
    }
  }
</script>

<section class="page narrow-page" aria-labelledby="page-title">
  <a class="back-link" href={initialTeamId ? `#equipes/${initialTeamId}` : '#personnes'}><ArrowLeft size={17} aria-hidden="true" /> Retour</a>
  {#if !isNew && !existingPerson}
    <h1 id="page-title">Personne introuvable</h1>
    <p class="page-introduction">Cette personne n’existe plus dans le projet.</p>
  {:else}
    <header class="page-heading">
      <div><p class="page-kicker">Personnes</p><h1 id="page-title">{isNew ? 'Nouvelle personne' : 'Modifier la personne'}</h1></div>
    </header>
    <form class="editor-form" on:submit={submit}>
      <div class="form-grid">
        <label>Prénom<input bind:value={firstName} autocomplete="given-name" required /></label>
        <label>Nom<input bind:value={lastName} autocomplete="family-name" required /></label>
      </div>
      <label>Adresse email<input bind:value={email} type="email" autocomplete="email" required /></label>
      <fieldset>
        <legend>Équipes</legend>
        {#if teams.length === 0}<p class="muted-text">Aucune équipe n’a encore été créée.</p>{/if}
        <div class="checkbox-list">
          {#each teams as team}
            <label class="checkbox-row"><input type="checkbox" checked={teamIds.includes(team.id)} on:change={(event) => toggleTeam(team.id, event.currentTarget.checked)} /><span><strong>{team.name}</strong><small>{team.slug}</small></span></label>
          {/each}
        </div>
      </fieldset>
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
      <div class="form-actions"><a class="secondary-button" href={initialTeamId ? `#equipes/${initialTeamId}` : '#personnes'}>Annuler</a><button class="primary-button" type="submit" disabled={saving}><Save size={18} aria-hidden="true" />{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form>
  {/if}
</section>