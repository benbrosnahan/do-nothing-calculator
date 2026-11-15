// SEO and agent-readiness basics. Created with Claude Code, 2026-11-15.
import { test, expect } from './helpers.mjs';

test('SEO-01 title, description, canonical and a share image', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('The Do-Nothing Calculator by Cense');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /selling and rebuying/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://do-nothing-calculator.vercel.app');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /opengraph-image/);
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon/);
});

test('SEO-02 robots.txt and sitemap.xml are served', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://do-nothing-calculator.vercel.app/sitemap.xml');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<loc>https://do-nothing-calculator.vercel.app/</loc>');
  const og = await request.get('/opengraph-image');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
});

test('SEO-03 structured data describes a free finance web app', async ({ page }) => {
  await page.goto('/');
  const json = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
  expect(json['@type']).toBe('WebApplication');
  expect(json.applicationCategory).toBe('FinanceApplication');
  expect(json.offers.price).toBe('0');
});

test('SEO-04 the answer and the method are in the server HTML, before any script runs', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('What selling and buying back in costs you.');
  expect(html).toContain('leaving it alone gives you');
  expect(html).toContain('If you do sell');
});
