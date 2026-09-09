<script lang="ts">
  import { onMount } from 'svelte'
  import AppHeader from './components/AppHeader.svelte'
  import SideNavigation from './components/SideNavigation.svelte'
  import PeoplePage from './pages/PeoplePage.svelte'
  import PersonPage from './pages/PersonPage.svelte'
  import TeamsPage from './pages/TeamsPage.svelte'
  import { listPeople, listTeams, savePerson, saveTeam, type Person, type PersonInput, type Team, type TeamInput } from './services/database'

  let route = 'personnes'
  let people: Person[] = []
  let teams: Team[] = []
  let loading = true
  let error = ''
  let activeView: 'people' | 'teams' = 'people'

  $: activeView = route.startsWith('equipes') ? 'teams' : 'people'
  $: routePath = route.split('?')[0]
  $: personId = routePath.startsWith('personnes/') ? routePath.slice('personnes/'.length) : ''
  $: selectedTeamId = routePath.startsWith('equipes/') ? routePath.slice('equipes/'.length) : ''
  $: initialTeamId = new URLSearchParams(route.split('?')[1] ?? '').get('equipe') ?? ''

  onMount(() => {
    const updateRoute = () => {
      route = window.location.hash.slice(1) || 'personnes'
    }

    updateRoute()
    window.addEventListener('hashchange', updateRoute)
    void refreshData()
    return () => window.removeEventListener('hashchange', updateRoute)
  })

  async function refreshData() {
    try {
      ;[people, teams] = await Promise.all([listPeople(), listTeams()])
      error = ''
    } catch (caughtError) {
      console.error('Impossible de charger les données du projet.', caughtError)
      error = 'Les données du projet ne peuvent pas être chargées.'
    } finally {
      loading = false
    }
  }

  async function handleSavePerson(input: PersonInput, id?: string) {
    await savePerson(input, id)
    await refreshData()
    window.location.hash = initialTeamId ? `equipes/${initialTeamId}` : 'personnes'
  }

  async function handleSaveTeam(input: TeamInput) {
    const team = await saveTeam(input)
    await refreshData()
    window.location.hash = `equipes/${team.id}`
  }
</script>

<a class="skip-link" href="#main-content">Aller au contenu principal</a>

<div class="app-shell">
  <AppHeader />
  <div class="workspace">
    <SideNavigation {activeView} />
    <main id="main-content" tabindex="-1">
      {#if loading}
        <p class="status-message">Chargement…</p>
      {:else if error}
        <p class="status-message error-message" role="alert">{error}</p>
      {:else if personId}
        <PersonPage {people} {teams} {personId} {initialTeamId} onSave={handleSavePerson} />
      {:else if activeView === 'teams'}
        <TeamsPage {people} {teams} {selectedTeamId} onSaveTeam={handleSaveTeam} />
      {:else}
        <PeoplePage {people} {teams} />
      {/if}
    </main>
  </div>
</div>
