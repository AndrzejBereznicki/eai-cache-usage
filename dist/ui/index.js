// src/ui/index.tsx
import { MetricCard, Spinner, usePluginData } from "@paperclipai/plugin-sdk/ui";

// src/calc.ts
function cacheHitPercent(cachedInputTokens, inputTokens) {
  const total = cachedInputTokens + inputTokens;
  if (total <= 0) return 0;
  return Math.round(cachedInputTokens / total * 1e3) / 10;
}
var CACHE_USAGE_WINDOW_DAYS = 7;
var COMPANY_TOTALS_SQL = `select
  coalesce(sum(input_tokens),0)::bigint as input,
  coalesce(sum(cached_input_tokens),0)::bigint as cached
from public.cost_events
where company_id = $1 and occurred_at >= now() - interval '${CACHE_USAGE_WINDOW_DAYS} days'`;
var BY_AGENT_SQL = `select
  a.id as agent_id,
  a.name as agent_name,
  coalesce(sum(ce.input_tokens),0)::bigint as input,
  coalesce(sum(ce.cached_input_tokens),0)::bigint as cached
from public.cost_events ce
join public.agents a on a.id = ce.agent_id
where ce.company_id = $1 and ce.occurred_at >= now() - interval '${CACHE_USAGE_WINDOW_DAYS} days'
group by a.id, a.name
having coalesce(sum(ce.input_tokens),0) + coalesce(sum(ce.cached_input_tokens),0) > 0
order by (coalesce(sum(ce.input_tokens),0) + coalesce(sum(ce.cached_input_tokens),0)) desc`;

// src/ui/index.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var CSS = `
.eai-cache-widget { padding: 4px 0; }
.eai-cache-widget .hint { color: var(--muted-foreground); font-size: 12px; margin: 6px 0 10px; }
.eai-cache-widget table { width: 100%; border-collapse: collapse; font-size: 13px; }
.eai-cache-widget th, .eai-cache-widget td { text-align: left; padding: 4px 6px; border-bottom: 1px solid var(--border); }
.eai-cache-widget th.num, .eai-cache-widget td.num { text-align: right; white-space: nowrap; }
`;
function CacheUsageWidget({ context }) {
  const companyId = context.companyId;
  const { data, loading, error } = usePluginData("cache-usage", companyId ? { companyId } : void 0);
  if (!companyId) return null;
  if (loading && !data) return /* @__PURE__ */ jsx(Spinner, { size: "sm", label: "Wczytuj\u0119 cache\u2026" });
  if (error) return /* @__PURE__ */ jsxs("p", { className: "eai-cache-widget", children: [
    "B\u0142\u0105d cache: ",
    error.message
  ] });
  if (!data) return null;
  const { companyTotal, byAgent, windowDays } = data;
  const percent = cacheHitPercent(companyTotal.cached, companyTotal.input);
  const hasData = companyTotal.cached + companyTotal.input > 0;
  return /* @__PURE__ */ jsxs("div", { className: "eai-cache-widget", children: [
    /* @__PURE__ */ jsx("style", { children: CSS }),
    /* @__PURE__ */ jsx(MetricCard, { label: `Cache (${windowDays} dni)`, value: hasData ? percent : "\u2014", unit: hasData ? "%" : void 0 }),
    /* @__PURE__ */ jsxs("p", { className: "hint", children: [
      "\u0179r\xF3d\u0142o: cached_input_tokens / (input_tokens + cached_input_tokens) z tabeli cost_events, ostatnie ",
      windowDays,
      " dni."
    ] }),
    byAgent.length > 0 ? /* @__PURE__ */ jsxs("table", { children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Agent" }),
        /* @__PURE__ */ jsx("th", { className: "num", children: "Cache" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: byAgent.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: a.name }),
        /* @__PURE__ */ jsxs("td", { className: "num", children: [
          cacheHitPercent(a.cached, a.input),
          "%"
        ] })
      ] }, a.agentId)) })
    ] }) : null
  ] });
}
export {
  CacheUsageWidget
};
