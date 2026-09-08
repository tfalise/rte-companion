<script lang="ts">
  import { House } from '@lucide/svelte'
</script>

<nav class="side-navigation" aria-label="Navigation principale">
  <p class="navigation-label">Navigation</p>
  <a class="navigation-item" href="#main-content" aria-current="page">
    <House size={19} strokeWidth={1.8} aria-hidden="true" />
    <span>Accueil</span>
  </a>
</nav>