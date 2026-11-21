import { MetricCard, Spinner, usePluginData, type PluginWidgetProps } from "@paperclipai/plugin-sdk/ui";
import { cacheHitPercent } from "../calc.js";

interface AgentRow {
  agentId: string;
  name: string;
  input: number;
  cached: number;
}

interface CacheUsageData {
  windowDays: number;
  companyTotal: { input: number; cached: number };
  byAgent: AgentRow[];
}

const CSS = `
.eai-cache-widget { padding: 4px 0; }
.eai-cache-widget .hint { color: var(--muted-foreground); font-size: 12px; margin: 6px 0 10px; }
.eai-cache-widget table { width: 100%; border-collapse: collapse; font-size: 13px; }
.eai-cache-widget th, .eai-cache-widget td { text-align: left; padding: 4px 6px; border-bottom: 1px solid var(--border); }
.eai-cache-widget th.num, .eai-cache-widget td.num { text-align: right; white-space: nowrap; }
`;

export function CacheUsageWidget({ context }: PluginWidgetProps) {
  const companyId = context.companyId;
  const { data, loading, error } = usePluginData<CacheUsageData>("cache-usage", companyId ? { companyId } : undefined);

  if (!companyId) return null;
  if (loading && !data) return <Spinner size="sm" label="Wczytuję cache…" />;
  if (error) return <p className="eai-cache-widget">Błąd cache: {error.message}</p>;
  if (!data) return null;

  const { companyTotal, byAgent, windowDays } = data;
  const percent = cacheHitPercent(companyTotal.cached, companyTotal.input);
  const hasData = companyTotal.cached + companyTotal.input > 0;

  return (
    <div className="eai-cache-widget">
      <style>{CSS}</style>
      <MetricCard label={`Cache (${windowDays} dni)`} value={hasData ? percent : "—"} unit={hasData ? "%" : undefined} />
      <p className="hint">
        Źródło: cached_input_tokens / (input_tokens + cached_input_tokens) z tabeli cost_events, ostatnie {windowDays} dni.
      </p>
      {byAgent.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th className="num">Cache</th>
            </tr>
          </thead>
          <tbody>
            {byAgent.map((a) => (
              <tr key={a.agentId}>
                <td>{a.name}</td>
                <td className="num">{cacheHitPercent(a.cached, a.input)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
