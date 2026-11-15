// Security and privacy: headers, no third-party requests, nothing stored. Created with Claude Code, 2026-11-15.
import { test, expect, openApp, setInputs } from './helpers.mjs';

test('SEC-01 the page sends the security headers', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['x-powered-by']).toBeUndefined();
});

test('SEC-03 a full journey talks to no other site and stores nothing', async ({ page, baseURL }) => {
  const hosts = new Set();
  page.on('request', r => hosts.add(new URL(r.url()).host));
  await openApp(page);
  await setInputs(page, { monthly: 350, bracket: 0.24, salesPerYear: 4, years: 40, returnPct: 6 });
  await page.waitForTimeout(500);
  expect([...hosts]).toEqual([new URL(baseURL).host]);
  const stored = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }));
  expect(stored).toEqual({ local: 0, session: 0, cookies: '' });
});
