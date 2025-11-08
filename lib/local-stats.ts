export type LocalStatKey = 'docs' | 'precedent';

const keyFor = (userId?: string | null, k: LocalStatKey = 'docs') => `stats:${userId || 'anon'}:${k}`;

export function incLocalStat(userId: string | null | undefined, k: LocalStatKey): number {
  if (typeof window === 'undefined') return 0;
  const key = keyFor(userId, k);
  const next = (Number(localStorage.getItem(key) || '0') || 0) + 1;
  try { localStorage.setItem(key, String(next)); } catch {}
  return next;
}

export function getLocalStat(userId: string | null | undefined, k: LocalStatKey): number {
  if (typeof window === 'undefined') return 0;
  const key = keyFor(userId, k);
  try { return Number(localStorage.getItem(key) || '0'); } catch { return 0; }
}

export function resetLocalStat(userId: string | null | undefined, k: LocalStatKey) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(keyFor(userId, k)); } catch {}
}

export function decLocalStat(userId: string | null | undefined, k: LocalStatKey): number {
  if (typeof window === 'undefined') return 0;
  const key = keyFor(userId, k);
  const current = Number(localStorage.getItem(key) || '0') || 0;
  const next = Math.max(0, current - 1);
  try { localStorage.setItem(key, String(next)); } catch {}
  return next;
}
