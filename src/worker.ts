import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import { BY_AGENT_SQL, CACHE_USAGE_WINDOW_DAYS, COMPANY_TOTALS_SQL } from "./calc.js";

function requireCompanyId(params: Record<string, unknown>): string {
  const companyId = params.companyId;
  if (typeof companyId !== "string" || !companyId) throw new Error("companyId is required");
  return companyId;
}

interface TotalsRow {
  input: number | string;
  cached: number | string;
}

interface AgentRow {
  agent_id: string;
  agent_name: string;
  input: number | string;
  cached: number | string;
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.data.register("cache-usage", async (params) => {
      const companyId = requireCompanyId(params);

      const totalsRows = await ctx.db.query<TotalsRow>(COMPANY_TOTALS_SQL, [companyId]);
      const totals = totalsRows[0] ?? { input: 0, cached: 0 };

      const agentRows = await ctx.db.query<AgentRow>(BY_AGENT_SQL, [companyId]);

      return {
        windowDays: CACHE_USAGE_WINDOW_DAYS,
        companyTotal: {
          input: Number(totals.input ?? 0),
          cached: Number(totals.cached ?? 0),
        },
        byAgent: agentRows.map((row) => ({
          agentId: row.agent_id,
          name: row.agent_name,
          input: Number(row.input ?? 0),
          cached: Number(row.cached ?? 0),
        })),
      };
    });
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
