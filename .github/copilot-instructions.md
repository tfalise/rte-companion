# RTE Companion - Instructions de développement

## Contexte produit

- RTE Companion est une application Svelte 5 et TypeScript entièrement exécutée côté client.
- Le livrable de production doit fonctionner dans une version récente de Microsoft Edge par ouverture directe de `dist/index.html` avec le protocole `file://`.
- Ne pas introduire de backend, d'API réseau obligatoire, de serveur web de production ni de service worker.
- Conserver le nom produit `RTE Companion` et rédiger les textes visibles par l'utilisateur en français.
- Consulter `README.md` pour les commandes et le mode de distribution.

## Architecture

- Placer les composants de structure et réutilisables dans `src/components/`.
- Placer le contenu propre à une page dans `src/pages/`.
- Placer les accès aux API du navigateur, notamment IndexedDB, dans `src/services/`.
- Placer les styles partagés dans `src/styles/`. Préférer les styles locaux d'un composant lorsqu'ils ne sont pas partagés.
- Garder `src/App.svelte` centré sur la composition du shell et `src/main.ts` sur l'initialisation de l'application.
- Ne pas ajouter de routeur tant qu'une fonctionnalité n'exige pas plusieurs vues adressables. Si nécessaire, utiliser un routage par fragment (`#`) compatible avec `file://`, jamais l'History API.
- Éviter les abstractions, stores globaux et dépendances qui ne répondent pas à un besoin actuel.

## Svelte et TypeScript

- Utiliser TypeScript dans les composants Svelte qui contiennent un script (`<script lang="ts">`).
- Suivre les idiomes Svelte 5 et les conventions déjà présentes dans le dépôt.
- Définir des types explicites aux frontières des services et pour les données persistées. Éviter `any`.
- Garder les composants petits, accessibles et responsables d'une seule surface fonctionnelle.
- Utiliser des éléments HTML sémantiques et préserver la navigation clavier, les libellés accessibles et les états de focus visibles.
- Utiliser `@lucide/svelte` pour les icônes courantes au lieu de SVG dessinés manuellement.

## Compatibilité hors serveur

- Conserver `base: './'` et `viteSingleFile()` dans `vite.config.ts`.
- Ne pas introduire d'import dynamique, de ressource distante indispensable, de chemin absolu commençant par `/` ni de chargement dépendant d'un serveur.
- Importer les ressources locales depuis le code afin que Vite puisse les intégrer au build.
- Après une modification affectant le build ou les ressources, vérifier que `npm run build` produit un unique fichier `dist/index.html` fonctionnel sous `file://`.

## Persistance IndexedDB

- Faire évoluer la persistance dans `src/services/database.ts`; les composants ne doivent pas utiliser directement l'API IndexedDB.
- Toute modification de schéma doit incrémenter `DATABASE_VERSION` et être appliquée de façon idempotente dans `onupgradeneeded`.
- Ne jamais supprimer ou réinitialiser silencieusement les données existantes. Prévoir une migration explicite pour chaque changement incompatible.
- Ne pas remplacer IndexedDB par `localStorage` ou `sessionStorage` comme mécanisme principal.
- Ajouter ou adapter un test avec `fake-indexeddb` pour chaque évolution du schéma ou du comportement de persistance.

## Interface

- Préserver le shell principal : barre de titre supérieure, navigation à gauche sur écran large et contenu principal à droite.
- Préserver le repli mobile sans chevauchement ni défilement horizontal.
- Réutiliser les variables CSS de `src/styles/global.css` avant d'ajouter de nouvelles couleurs ou dimensions partagées.
- Ne pas afficher de diagnostics techniques, détails de stockage ou instructions de développement dans l'interface utilisateur.

## Qualité et validation

- Limiter chaque changement au besoin fonctionnel demandé et mettre à jour `README.md` lorsque les commandes ou le mode d'utilisation changent.
- Ajouter des tests ciblés pour la logique métier, les services et les régressions corrigées.
- Avant de terminer une implémentation, exécuter dans cet ordre :
  1. `npm run check`
  2. `npm test`
  3. `npm run build`
- Pour toute modification du démarrage, du stockage, du responsive ou du packaging, valider également `dist/index.html` directement dans Microsoft Edge et contrôler l'absence d'erreur console.
