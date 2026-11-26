process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:8080';

const { escapeRegex, escapeHtml } = require('../src/app/utils/escape');
const { sanitize } = require('../src/interfaces/http/utils/sanitize');
const { isEventPast, formatUser } = require('../src/app/utils/formatters');

describe('escape', () => {
  it('escapa metacaracteres de regex', () => {
    expect(() => new RegExp(escapeRegex('São (Paulo'))).not.toThrow();
    expect(new RegExp(escapeRegex('.')).test('x')).toBe(false);
  });

  it('escapa HTML', () => {
    expect(escapeHtml('<a href="x">\'oi\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&#39;oi&#39;&lt;/a&gt;');
  });
});

describe('sanitize', () => {
  it('mascara todas as variações de senha e token, inclusive aninhadas', () => {
    const out = sanitize({ currentPassword: 'a', newPassword: 'b', token: 'c', nested: { password: 'd' }, name: 'ok' });
    expect(out).toEqual({ currentPassword: '***', newPassword: '***', token: '***', nested: { password: '***' }, name: 'ok' });
  });
});

describe('formatters', () => {
  it('considera passado só depois do fim do jogo', () => {
    const now = Date.now();
    expect(isEventPast({ dateTime: new Date(now - 30 * 60000), duration: 60 })).toBe(false);
    expect(isEventPast({ dateTime: new Date(now - 90 * 60000), duration: 60 })).toBe(true);
  });

  it('omite email por padrão', () => {
    expect(formatUser({ user_id: '1', name: 'A', email: 'a@b.com' })).not.toHaveProperty('email');
  });
});

describe('HTTP (sem banco)', () => {
  let server;
  let base;

  beforeAll(done => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const app = require('../app');
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}/api/v1`;
      done();
    });
  });

  afterAll(done => {
    console.log.mockRestore();
    server.closeAllConnections();
    server.close(done);
  });

  it('registra todas as rotas (o container resolve todos os controllers)', async () => {
    const res = await fetch(`${base}/events`);
    expect(res.status).toBe(401);
  });

  it('JSON malformado retorna 400, não 500', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ruim',
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('INVALID_JSON');
  });

  it('corpo grande demais retorna 413', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'x'.repeat(20000) }),
    });
    expect(res.status).toBe(413);
  });

  it('token inválido retorna 401', async () => {
    const res = await fetch(`${base}/events`, { headers: { Authorization: 'Bearer abc' } });
    expect(res.status).toBe(401);
  });

  it('documenta a rota de suporte no swagger', async () => {
    const res = await fetch(`${base.replace('/api/v1', '')}/api-docs.json`);
    const spec = await res.json();
    expect(spec.paths).toHaveProperty('/api/v1/support');
    expect(spec.paths).toHaveProperty('/api/v1/users/{id}/events');
  });
});
