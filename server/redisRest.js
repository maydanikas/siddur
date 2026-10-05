const PAIRS = [
  ['STORAGE_KV_REST_API_URL', 'STORAGE_KV_REST_API_TOKEN'],
  ['STORAGE_UPSTASH_REDIS_REST_URL', 'STORAGE_UPSTASH_REDIS_REST_TOKEN'],
  ['STORAGE_REDIS_REST_URL', 'STORAGE_REDIS_REST_TOKEN'],
  ['STORAGE_URL', 'STORAGE_TOKEN'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
];

function httpsUrl(value) {
  return typeof value === 'string' && value.startsWith('https://');
}

/** REST endpoint only. rediss:// URLs cannot be called with fetch. */
export function redisConfig(env = process.env) {
  for (const [urlKey, tokenKey] of PAIRS) {
    const url = env[urlKey];
    const token = env[tokenKey];
    if (httpsUrl(url) && typeof token === 'string' && token) return { url, token };
  }
  for (const urlKey of Object.keys(env)) {
    if (!/(REDIS|KV|UPSTASH|STORAGE)/i.test(urlKey) || !/URL$/.test(urlKey)) continue;
    const url = env[urlKey];
    if (!httpsUrl(url)) continue;
    const token = env[urlKey.replace(/URL$/, 'TOKEN')];
    if (typeof token === 'string' && token) return { url, token };
  }
  return null;
}

export async function redisCommand(command, env = process.env, fetchImpl = fetch) {
  const cfg = redisConfig(env);
  if (!cfg) {
    const error = new Error('redis-missing');
    error.code = 'redis-missing';
    throw error;
  }
  const response = await fetchImpl(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    const error = new Error(`redis-${response.status}`);
    error.code = 'redis-http';
    throw error;
  }
  const data = await response.json();
  if (data && data.error) {
    const error = new Error('redis-error');
    error.code = 'redis-error';
    throw error;
  }
  return data ? data.result : null;
}
