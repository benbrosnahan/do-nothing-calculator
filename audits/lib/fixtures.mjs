// Shared fixtures for the Do-Nothing Calculator. The app stores nothing, so there is no seeded state: every audited
// state starts from a first visit and is reached with real clicks. Adapted from the Loan Desk audit kit.
export const KEYS = {};
export const LOANS = [];
export const PROFILE = {};
export const SNAPSHOTS = [];

/** Script for evaluateOnNewDocument. The app keeps nothing in storage, so this seeds nothing. */
export function seedScript() {
  return '(() => {})();';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Click a control by its exact trimmed visible text with a real (trusted) mouse click. */
export async function clickText(page, text) {
  const handle = await page.evaluateHandle(t => {
    const norm = s => (s || '').replace(/\s+/g, ' ').trim();
    const els = [...document.querySelectorAll('button, a, [role="radio"]')];
    return els.find(e => norm(e.innerText) === t && e.offsetParent !== null)
      || els.find(e => norm(e.innerText).startsWith(t) && e.offsetParent !== null)
      || null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error(`clickText: no visible control "${text}"`);
  await el.click();
  await sleep(350);
}

/** Tab labels differ by breakpoint: label below sm, long at sm and up. */
export const TAB_LABELS = {
  loans: ['Your loans', 'Loans'],
  plans: ['Repayment plans', 'Plans'],
  payoff: ['Payoff', 'Payoff'],
  records: ['Records', 'Records'],
};

export async function clickTab(page, tab) {
  const [long, short] = TAB_LABELS[tab];
  const handle = await page.evaluateHandle((long, short) => {
    const nav = document.querySelector('nav[aria-label="Sections"]');
    if (!nav) return null;
    const norm = s => (s || '').replace(/\s+/g, ' ').trim();
    return [...nav.querySelectorAll('button')].find(b => {
      const t = norm(b.innerText);
      return t === long || t === short || t.startsWith(long) || t.startsWith(short);
    }) || null;
  }, long, short);
  const el = handle.asElement();
  if (!el) throw new Error(`clickTab: no section button for ${tab}`);
  await el.click();
  await sleep(400);
}

/**
 * The audited states, all from a first visit: the default result, and the assumptions panel opened.
 * The toggle's label is matched by its start, which the pre-audit and the redesigned build share.
 */
export const STATES = {
  result: { seeded: false, enter: async () => {} },
  assumptions: { seeded: false, enter: async page => clickText(page, 'Adjust the assumptions') },
};
