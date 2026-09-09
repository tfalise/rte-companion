# RTE Companion

Application web locale construite avec Svelte, TypeScript et Vite. Elle s'exécute entièrement dans Microsoft Edge, sans backend ni serveur web en production.

## Fonctionnalités

- Gestion des personnes mobilisées sur le projet
- Organisation d'une personne dans une ou plusieurs équipes
- Consultation des membres d'une équipe
- Copie des adresses email d'une équipe, séparées par des points-virgules

## Prérequis

- Node.js et npm pour développer et construire l'application
- Une version récente de Microsoft Edge pour exécuter le livrable

## Installation

```powershell
npm install
```

## Développement

```powershell
npm run dev
```

Le serveur Vite est utilisé uniquement pendant le développement.

## Contrôles

```powershell
npm run check
npm test
```

## Distribution locale

```powershell
npm run build
```

Le build produit un fichier autonome `dist/index.html`. Ouvrez ce fichier directement dans Microsoft Edge, par double-clic ou depuis l'explorateur de fichiers. Aucun serveur web n'est nécessaire.

Les données locales sont conservées avec IndexedDB dans la base `rte-companion`. Leur disponibilité sous le protocole `file://` dépend des politiques de sécurité configurées dans Edge sur le poste cible.

## Publication

L'intégration continue est assurée par GitHub Actions.

- Sur chaque pull request vers `main`, les contrôles `npm run check`, `npm test` et `npm run build` sont exécutés.
- À chaque merge dans `main`, les mêmes contrôles sont rejoués, puis le workflow crée un tag `vX.Y.Z` en incrémentant le numéro de patch et publie une release GitHub.

La release contient le fichier autonome `rte-companion-X.Y.Z.html`. Téléchargez-le et ouvrez-le directement dans Microsoft Edge.

## Structure

```text
src/
|-- components/  Composants du shell applicatif
|-- pages/       Contenu des pages
|-- services/    Services clients, dont IndexedDB
|-- styles/      Styles globaux
|-- App.svelte   Composition générale
`-- main.ts      Point d'entrée
```
