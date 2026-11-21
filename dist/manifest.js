// src/manifest.ts
var manifest = {
  id: "eai-cache-usage",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Cache token\xF3w",
  description: "Wska\u017Anik % token\xF3w agent\xF3w obs\u0142u\u017Conych z prompt cache (7 dni), z podzia\u0142em na agent\xF3w. Liczone z tabeli cost_events.",
  author: "EkspertAI",
  categories: ["ui"],
  capabilities: ["database.namespace.read", "database.namespace.migrate", "ui.dashboardWidget.register"],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  database: {
    namespaceSlug: "cache_usage",
    migrationsDir: "migrations",
    coreReadTables: ["cost_events", "agents"]
  },
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: "cache-usage-widget",
        displayName: "Cache token\xF3w",
        exportName: "CacheUsageWidget"
      }
    ]
  }
};
var manifest_default = manifest;
export {
  manifest_default as default
};
