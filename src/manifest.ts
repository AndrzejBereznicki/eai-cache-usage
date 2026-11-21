const manifest = {
  id: "eai-cache-usage",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Cache tokenów",
  description:
    "Wskaźnik % tokenów agentów obsłużonych z prompt cache (7 dni), z podziałem na agentów. Liczone z tabeli cost_events.",
  author: "EkspertAI",
  categories: ["ui"],
  capabilities: ["database.namespace.read", "database.namespace.migrate", "ui.dashboardWidget.register"],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  database: {
    namespaceSlug: "cache_usage",
    migrationsDir: "migrations",
    coreReadTables: ["cost_events", "agents"],
  },
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: "cache-usage-widget",
        displayName: "Cache tokenów",
        exportName: "CacheUsageWidget",
      },
    ],
  },
};

export default manifest;
