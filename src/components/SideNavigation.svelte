<script lang="ts">
  import { Users, UsersRound } from '@lucide/svelte'

  export let activeView: 'people' | 'teams'
</script>

<nav class="side-navigation" aria-label="Navigation principale">
  <p class="navigation-label">Navigation</p>
  <a class:active={activeView === 'people'} class="navigation-item" href="#personnes" aria-current={activeView === 'people' ? 'page' : undefined}>
    <Users size={19} strokeWidth={1.8} aria-hidden="true" />
    <span>Personnes</span>
  </a>
  <a class:active={activeView === 'teams'} class="navigation-item" href="#equipes" aria-current={activeView === 'teams' ? 'page' : undefined}>
    <UsersRound size={19} strokeWidth={1.8} aria-hidden="true" />
    <span>Équipes</span>
  </a>
</nav>