/**
 * Global settings for the extension
 */
const YUUMI_CONFIG = {
    menuLinks: [
      { label: "❇️ Prospect", url: "https://airtable.com/app7Nqnx527uH5yre/pagzK7pd8bXc7yXv7/form" },
      { label: "🚀 Onboarding", url: "https://airtable.com/app7Nqnx527uH5yre/pag7XrfkEhB9KnlcQ" },
      { label: "💵 Chiffrage", url: "https://airtable.com/app7Nqnx527uH5yre/pagz0BmeLjsd29sHZ" },
      { label: "📧 Mailing", url: "https://n8n.srv780990.hstgr.cloud/form/airtable-mailing" }
      
    ],
    
    forms: [
      {
        title: "Ajouter une personne physique",
        detectUrl: "app7Nqnx527uH5yre/pagzK7pd8bXc7yXv7",
        webhookUrl: "https://hooks.airtable.com/workflows/v1/genericWebhook/app7Nqnx527uH5yre/wfl4reeoaOCRrmeIf/wtrR63GmjOU4MO7Nw",
        fields: ["NOM Prénom", "Rôle", "Mail personnel", "Téléphone personnel"]
      }
    ],

    visibleTables: [
      { config: "Référentiel", tables: ["tblKVUhPzuLJQwPB3", "tblACAxSTkXEMArHn", "tbl8iSAxdh56bMjCK", "tbllRRRS3LMf0nSuz"] },
      { config: "Onboarding", tables: ["tblACAxSTkXEMArHn", "tblFiUWIx8ISgBZI2", "tblNF30KEekLaOnDR", "tblEJRFRXYMlz8Axj", "tblJyUJ7hJe2D8TV6", "tblEr7S9caXydVhKn"]},
      { config: "Comptabilité", tables: ["tblSoJLe4uYm1LFKv", "tblUzAhT7XZl8J9WN", "tblnQg0WKA8s9H9fW", "tbl6h5wbgu5M7SB7M", "tblsiVixmaS10SAHa", "tbl5anmqaeHhkGy2N", "tbleI8KpQkqlfNfdU"] },
      { config: "Juridique", tables: ["tblFiUWIx8ISgBZI2", "tblpHXHqNSaFtZLZw", "tblgdZYc2TDNW0T8Y", "tblbIbUASGmoK6oAx"] },
      { config: "Social", tables: ["tblYl9omKHRyd0yQz", "tblYZlIwAQlPhuPUy", "tblzuDot8WFAbAZIe"] },
      { config: "Divers", tables: ["tblhnIjP75PyMt93O", "tblhD6uwDJfNZdk17"] }
      
    ],
  };
