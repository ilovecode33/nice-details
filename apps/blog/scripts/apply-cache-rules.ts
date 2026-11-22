/**
 * Declarative Cloudflare Cache Rules for the blog.
 *
 * The rule definition lives in ../cloudflare/cache-rules.json. This script
 * finds the zone by name, reads the existing entrypoint ruleset (if any) and
 * PUTs a merged version, so it is safe to run on every deploy.
 *
 * Required API token permissions: Zone → Zone → Read and Zone → Cache Rules → Edit.
 * The expression is restricted to /static/* on the blog host — HTML is never
 * matched and always keeps Pages' `max-age=0, must-revalidate`.
 */

import { readFileSync } from 'node:fs';

interface CacheRule {
  description: string;
  expression: string;
  action: string;
  action_parameters: Record<string, unknown>;
  enabled?: boolean;
}

interface Config {
  zone: string;
  phase: string;
  ruleset: { name: string; description: string };
  rules: CacheRule[];
}

interface RuleSet {
  id?: string;
  name?: string;
  description?: string;
  rules?: Array<CacheRule & { id?: string }>;
}

const API = 'https://api.cloudflare.com/client/v4';

const config = JSON.parse(
  readFileSync(new URL('../cloudflare/cache-rules.json', import.meta.url), 'utf8'),
) as Config;

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error('CLOUDFLARE_API_TOKEN is required');

async function cf<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    result?: T;
    errors?: Array<{ message: string }>;
  };
  if (!response.ok || payload.success === false) {
    const error = new Error(
      `${method} ${path} → ${response.status}: ${JSON.stringify(payload.errors ?? payload)}`,
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return payload.result as T;
}

const zones = await cf<Array<{ id: string; name: string }>>(
  `/zones?name=${encodeURIComponent(config.zone)}&per_page=50`,
);
const zone = zones.find((candidate) => candidate.name === config.zone);
if (!zone) throw new Error(`Zone ${config.zone} not found`);

let ruleset: RuleSet;
try {
  ruleset = await cf<RuleSet>(
    `/zones/${zone.id}/rulesets/phases/${config.phase}/entrypoint`,
  );
} catch (error) {
  if ((error as { status?: number }).status !== 404) throw error;
  ruleset = await cf<RuleSet>(`/zones/${zone.id}/rulesets`, 'POST', {
    name: config.ruleset.name,
    description: config.ruleset.description,
    kind: 'zone',
    phase: config.phase,
    rules: [],
  });
}

/** Keep only writable fields; the API rejects read-only metadata on PUT. */
function normalize(rule: CacheRule & { id?: string }) {
  return {
    ...(rule.id ? { id: rule.id } : {}),
    description: rule.description,
    expression: rule.expression,
    action: rule.action,
    action_parameters: rule.action_parameters ?? {},
    enabled: rule.enabled ?? true,
  };
}

const desired = config.rules.map((rule) => normalize({ ...rule, enabled: true }));
const desiredDescriptions = new Set(config.rules.map((rule) => rule.description));
const preserved = (ruleset.rules ?? [])
  .filter((rule) => !desiredDescriptions.has(rule.description))
  .map(normalize);
const rules = [...preserved, ...desired];

await cf<RuleSet>(
  `/zones/${zone.id}/rulesets/phases/${config.phase}/entrypoint`,
  'PUT',
  {
    name: ruleset.name ?? config.ruleset.name,
    description: ruleset.description ?? config.ruleset.description,
    rules,
  },
);

console.log(
  `Applied ${desired.length} cache rule(s) to ${config.zone} (${rules.length} total in phase ${config.phase}).`,
);
