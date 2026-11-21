# eai-cache-usage — prompt cache dashboard for Paperclip

A [Paperclip](https://github.com/paperclipai/paperclip) plugin that adds a dashboard widget showing **what % of AI agents' input tokens were served from the prompt cache** over the last 7 days, with a per-agent breakdown.

Prompt caching is one of the biggest levers on LLM cost and latency. This widget makes it easy to spot agents that keep re-sending uncached context.

## Data source

Paperclip already records cache-read tokens per agent run in its first-party `cost_events` table (`input_tokens`, `cached_input_tokens`, per agent, per company, timestamped). No new data collection is needed — the plugin only **reads** that table (read-only, through the plugin database `core-read-table` whitelist) and renders it.

## Formula

```
cache % = cached_input_tokens / (input_tokens + cached_input_tokens)   — summed over the last 7 days
```

Cache writes (`cache_creation_input_tokens`) are **not** counted as "from cache", since they are billed at a premium, not a discount.

## Build & test

```bash
npm install
npm run build
npm test
```

## Install (local dev)

```bash
npx paperclipai plugin install --local /path/to/eai-cache-usage
```
