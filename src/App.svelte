<script lang="ts">
  import AppHeader from './components/AppHeader.svelte'
  import SideNavigation from './components/SideNavigation.svelte'
  import HomePage from './pages/HomePage.svelte'
</script>

<a class="skip-link" href="#main-content">Aller au contenu principal</a>

<div class="app-shell">
  <AppHeader />
  <div class="workspace">
    <SideNavigation />
    <main id="main-content" tabindex="-1">
      <HomePage />
    </main>
  </div>
</div>
