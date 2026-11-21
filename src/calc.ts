// Prompt-cache hit rate: share of input tokens served from cache (reads only,
// not cache-write tokens, which are billed at a premium rather than "from cache").
export function cacheHitPercent(cachedInputTokens: number, inputTokens: number): number {
  const total = cachedInputTokens + inputTokens;
  if (total <= 0) return 0;
  return Math.round((cachedInputTokens / total) * 1000) / 10;
}

export const CACHE_USAGE_WINDOW_DAYS = 7;

export const COMPANY_TOTALS_SQL = `select
  coalesce(sum(input_tokens),0)::bigint as input,
  coalesce(sum(cached_input_tokens),0)::bigint as cached
from public.cost_events
where company_id = $1 and occurred_at >= now() - interval '${CACHE_USAGE_WINDOW_DAYS} days'`;

export const BY_AGENT_SQL = `select
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
