# Yuumi — Compagnon Airtable

Extension Chrome qui greffe des raccourcis et des outils directement dans l'interface Airtable.

---

## Fonctionnalités

- **Menu de navigation** — Ajoute des liens rapides dans la barre du haut d'Airtable
- **Filtrage de tables** — Masque/affiche des groupes de tables selon des configurations nommées (Onboarding, Comptabilité, Juridique…)
- **Tables épinglées** — Certaines tables restent toujours visibles quelle que soit la config active
- **Formulaires flottants** — Injecte des panneaux de création rapide sur certaines pages (envoi via webhook Airtable)
- **Paramètres éditables** — Tout se configure depuis le popup : liens, configs de tables, IDs épinglés

---

## Structure du projet

```
yuumi-for-airtable/
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background/
│   └── background.js      # Service worker — relaie les requêtes webhook
├── content/
│   ├── config.js          # Config globale + chargement depuis chrome.storage
│   ├── menu.js            # Injection des liens dans la nav Airtable
│   ├── form.js            # Overlays de création rapide
│   └── tables.js          # Gestion de la visibilité des tables
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js           # UI du popup + vue paramètres
└── manifest.json
```

---

## Installation (mode développeur)

1. Cloner le repo
2. Ouvrir `chrome://extensions`
3. Activer le **mode développeur**
4. Cliquer sur **Charger l'extension non empaquetée** et sélectionner le dossier du projet

---

## Configuration

Les valeurs par défaut sont dans `content/config.js` (`YUUMI_CONFIG_DEFAULTS`). Elles peuvent toutes être surchargées depuis le popup → **Paramètres**, sans toucher au code.

Ce qui est configurable :

| Paramètre | Description |
|---|---|
| `menuLinks` | Liens affichés dans la nav Airtable |
| `visibleTables` | Configs nommées avec leurs IDs de tables |
| `pinnedTables` | IDs toujours visibles |
| `forms` | Formulaires flottants avec URL de détection et webhook |

Les overrides sont stockés dans `chrome.storage.local` et fusionnés au runtime.

---

## Permissions

| Permission | Raison |
|---|---|
| `storage` | Sauvegarder les configs et l'état actif |
| `tabs` | Envoyer des messages au contenu de l'onglet actif |
| `https://airtable.com/*` | Injection des scripts dans Airtable |
| `https://hooks.airtable.com/*` | Envoi des webhooks depuis le background |

---

## Auteur

Nawfel — fait pour un usage personnel sur Airtable.
