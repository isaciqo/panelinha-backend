const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'token',
  'authorization',
]);

/** Copia o objeto mascarando, em qualquer nível, campos com dados sensíveis. */
function sanitize(value, depth = 0) {
  if (depth > 5 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(v => sanitize(v, depth + 1));
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '***' : sanitize(v, depth + 1);
  }
  return out;
}

module.exports = { sanitize };
