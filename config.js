/**
 * Global settings for the extension
 * These are the DEFAULT values. User overrides are stored in chrome.storage.local
 * and merged at runtime via yuumi_local_config.
 */
const YUUMI_CONFIG_DEFAULTS = {
    menuLinks: [
      { label: "❇️ Prospect", url: "https://airtable.com/app7Nqnx527uH5yre/pagzK7pd8bXc7yXv7/form" },
      { label: "🚀 Onboarding", url: "https://airtable.com/app7Nqnx527uH5yre/pag7XrfkEhB9KnlcQ" },
      { label: "💵 Chiffrage", url: "https://airtable.com/app7Nqnx527uH5yre/pagz0BmeLjsd29sHZ" },
      { label: "📧 Mailing", url: "https://n8n.srv780990.hstgr.cloud/form/airtable-mailing" }
    ],

    forms: [
      {
        title: "Ajouter une personne physique",
        detectUrl: [
          "app7Nqnx527uH5yre/pagzK7pd8bXc7yXv7",
          "app7Nqnx527uH5yre/pagvRhCOQMh7gwhzr"
        ],
        webhookUrl: "https://hooks.airtable.com/workflows/v1/genericWebhook/app7Nqnx527uH5yre/wfl4reeoaOCRrmeIf/wtrR63GmjOU4MO7Nw",
        fields: ["NOM Prénom", "Rôle", "Mail personnel", "Téléphone personnel"]
      }
    ],

    visibleTables: [
      { config: "Référentiel", tables: ["tblACAxSTkXEMArHn", "tbl8iSAxdh56bMjCK", "tbllRRRS3LMf0nSuz"] },
      { config: "Onboarding", tables: ["tblACAxSTkXEMArHn", "tblFiUWIx8ISgBZI2", "tblNF30KEekLaOnDR", "tblEJRFRXYMlz8Axj", "tblJyUJ7hJe2D8TV6", "tblEr7S9caXydVhKn"]},
      { config: "Comptabilité", tables: ["tblSoJLe4uYm1LFKv", "tblUzAhT7XZl8J9WN", "tblnQg0WKA8s9H9fW", "tbl6h5wbgu5M7SB7M", "tblsiVixmaS10SAHa", "tbl5anmqaeHhkGy2N", "tbleI8KpQkqlfNfdU"] },
      { config: "Juridique", tables: ["tblFiUWIx8ISgBZI2", "tblpHXHqNSaFtZLZw", "tblgdZYc2TDNW0T8Y", "tblbIbUASGmoK6oAx"] },
      { config: "Social", tables: ["tblYl9omKHRyd0yQz", "tblYZlIwAQlPhuPUy", "tblzuDot8WFAbAZIe"] },
      { config: "Divers", tables: ["tblPpQ6TUEf2weYNW", "tblhnIjP75PyMt93O", "tblhD6uwDJfNZdk17"] }
    ],

    // Tables pinned regardless of active config selection.
    // Add table IDs here that should ALWAYS be visible.
    pinnedTables: ["tblKVUhPzuLJQwPB3"]
};

// Runtime config, will be populated asynchronously by merging defaults + local overrides.
let YUUMI_CONFIG = null;

const YUUMI_LOCAL_CONFIG_KEY = 'yuumi_local_config';

function loadYuumiConfig(callback) {
    chrome.storage.local.get(YUUMI_LOCAL_CONFIG_KEY, (result) => {
        const local = result[YUUMI_LOCAL_CONFIG_KEY] || {};
        YUUMI_CONFIG = {
            menuLinks:     local.menuLinks     ?? JSON.parse(JSON.stringify(YUUMI_CONFIG_DEFAULTS.menuLinks)),
            forms:         local.forms         ?? JSON.parse(JSON.stringify(YUUMI_CONFIG_DEFAULTS.forms)),
            visibleTables: local.visibleTables ?? JSON.parse(JSON.stringify(YUUMI_CONFIG_DEFAULTS.visibleTables)),
            pinnedTables:  local.pinnedTables  ?? JSON.parse(JSON.stringify(YUUMI_CONFIG_DEFAULTS.pinnedTables)),
        };
        if (callback) callback(YUUMI_CONFIG);
    });
}

// Expose helpers for popup/settings
const YUUMI_CONFIG_API = {
    getDefaults: () => JSON.parse(JSON.stringify(YUUMI_CONFIG_DEFAULTS)),
    saveLocal: (patch, callback) => {
        chrome.storage.local.get(YUUMI_LOCAL_CONFIG_KEY, (result) => {
            const current = result[YUUMI_LOCAL_CONFIG_KEY] || {};
            const updated = { ...current, ...patch };
            chrome.storage.local.set({ [YUUMI_LOCAL_CONFIG_KEY]: updated }, () => {
                loadYuumiConfig(callback);
            });
        });
    },
    resetToDefaults: (callback) => {
        chrome.storage.local.remove(YUUMI_LOCAL_CONFIG_KEY, () => {
            loadYuumiConfig(callback);
        });
    }
};