// src/app/[locale]/aparat/page.tsx
import { AparatClient } from './aparat-client';

/**
 * Parse NEXT_PUBLIC_APARAT_USERNAMES (comma-separated) into a clean handle
 * list. The first entry is treated as the default selected channel.
 */
function getAparatUsernames(): string[] {
  const raw = process.env.NEXT_PUBLIC_APARAT_USERNAMES ?? '';
  const seen = new Set<string>();
  const usernames: string[] = [];

  for (const part of raw.split(',')) {
    // Trim whitespace and strip a leading "@" if the env value includes one.
    const handle = part.trim().replace(/^@/, '');
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
    usernames.push(handle);
  }

  // Always render at least one channel.
  return usernames.length > 0 ? usernames : ['zoomit'];
}

export default function AparatPage() {
  const usernames = getAparatUsernames();
  // Hand the handle list to the client; it owns selection + data loading.
  return <AparatClient usernames={usernames} />;
}
