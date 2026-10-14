import fs from 'node:fs';
import path from 'node:path';

export interface DiscoveredRoute {
  path: string; // e.g. "/dashboard"
  filePath: string;
  isAuth: boolean;
  category: 'public' | 'auth' | 'app' | 'flow' | 'legal';
}

/**
 * Automatically discovers all existing and future pages created in src/app/[locale]
 * When new features/pages are added to the project, this auto-discovery picks them up automatically!
 */
export function discoverAppRoutes(): DiscoveredRoute[] {
  const rootDir = process.cwd();
  const localeDir = path.join(rootDir, 'src', 'app', '[locale]');

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const routes: DiscoveredRoute[] = [];

  function walk(currentDir: string, relativePath: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip catch-all routes like [...rest] and internal test dirs
        if (entry.name.startsWith('[...')) continue;

        const nextRelative = path.join(relativePath, entry.name);
        walk(fullPath, nextRelative);
      } else if (entry.isFile() && /^page\.(tsx|jsx|js|ts)$/.test(entry.name)) {
        // Convert filesystem path to route URL
        // Example: "(auth)/login" -> "/login"
        const segments = relativePath
          .split(path.sep)
          .filter(Boolean)
          .filter((seg) => !seg.startsWith('(') || !seg.endsWith(')')); // Strip route groups like (auth)

        const routePath = '/' + segments.join('/');
        const normalizedRoute = routePath === '//' ? '/' : routePath;

        let category: DiscoveredRoute['category'] = 'app';
        if (relativePath.includes('(auth)')) {
          category = 'auth';
        } else if (['/privacy', '/terms', '/sitemap'].includes(normalizedRoute)) {
          category = 'legal';
        } else if (normalizedRoute.includes('Flow')) {
          category = 'flow';
        } else if (['/', '/plans'].includes(normalizedRoute)) {
          category = 'public';
        }

        routes.push({
          path: normalizedRoute,
          filePath: fullPath,
          isAuth: relativePath.includes('(auth)'),
          category,
        });
      }
    }
  }

  walk(localeDir, '');

  // Sort routes logically: root first, then alphabetical
  return routes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });
}

/**
 * Extracts all navigation links declared in src/config/navigation.ts
 */
export function extractNavigationLinks(): { href: string; labelKey: string }[] {
  const rootDir = process.cwd();
  const navConfigFile = path.join(rootDir, 'src', 'config', 'navigation.ts');

  if (!fs.existsSync(navConfigFile)) {
    return [];
  }

  const content = fs.readFileSync(navConfigFile, 'utf-8');
  const items: { href: string; labelKey: string }[] = [];

  // Match items with href and labelKey in NAVIGATION array
  const hrefRegex = /href:\s*["']([^"']+)["']/g;
  const labelRegex = /labelKey:\s*["']([^"']+)["']/g;

  const hrefs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(content)) !== null) {
    if (match[1]) hrefs.push(match[1]);
  }

  const labels: string[] = [];
  while ((match = labelRegex.exec(content)) !== null) {
    if (match[1]) labels.push(match[1]);
  }

  for (let i = 0; i < hrefs.length; i++) {
    items.push({
      href: hrefs[i],
      labelKey: labels[i] || '',
    });
  }

  return items;
}

/**
 * Returns complete localized URL test matrix for all discovered routes
 */
export function getTestMatrix(locales = ['fa', 'en']): {
  locale: string;
  route: string;
  fullUrl: string;
  category: DiscoveredRoute['category'];
}[] {
  const routes = discoverAppRoutes();
  const matrix: {
    locale: string;
    route: string;
    fullUrl: string;
    category: DiscoveredRoute['category'];
  }[] = [];

  for (const locale of locales) {
    for (const r of routes) {
      const fullUrl = r.path === '/' ? `/${locale}` : `/${locale}${r.path}`;
      matrix.push({
        locale,
        route: r.path,
        fullUrl,
        category: r.category,
      });
    }
  }

  return matrix;
}
