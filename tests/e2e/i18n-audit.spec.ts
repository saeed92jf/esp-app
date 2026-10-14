import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function getNestedKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

test.describe('i18n & Translation Integrity Audit (Zero Tolerance)', () => {
  const rootDir = process.cwd();
  const faPath = path.join(rootDir, 'messages', 'fa.json');
  const enPath = path.join(rootDir, 'messages', 'en.json');

  test('Both messages/fa.json and messages/en.json exist and are valid JSON', () => {
    expect(fs.existsSync(faPath)).toBe(true);
    expect(fs.existsSync(enPath)).toBe(true);

    const faContent = JSON.parse(fs.readFileSync(faPath, 'utf-8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

    expect(typeof faContent).toBe('object');
    expect(typeof enContent).toBe('object');
  });

  test('Check key parity between Persian (fa) and English (en)', () => {
    const fa = JSON.parse(fs.readFileSync(faPath, 'utf-8'));
    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

    const faKeys = new Set(getNestedKeys(fa));
    const enKeys = new Set(getNestedKeys(en));

    const missingInEn = [...faKeys].filter((k) => !enKeys.has(k));
    const missingInFa = [...enKeys].filter((k) => !faKeys.has(k));

    // Common critical namespaces should have full parity
    const criticalMissingInEn = missingInEn.filter((k) => k.startsWith('Common.') || k.startsWith('Auth.') || k.startsWith('Footer.'));
    const criticalMissingInFa = missingInFa.filter((k) => k.startsWith('Common.') || k.startsWith('Auth.') || k.startsWith('Footer.'));

    expect(criticalMissingInEn, `Missing English translations: ${criticalMissingInEn.join(', ')}`).toHaveLength(0);
    expect(criticalMissingInFa, `Missing Persian translations: ${criticalMissingInFa.join(', ')}`).toHaveLength(0);
  });

  test('Zero Tolerance: No defaultValue parameter inside useTranslations or t() in src/', () => {
    const srcDir = path.join(rootDir, 'src');
    const violations: { file: string; line: number; match: string }[] = [];

    function scan(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('defaultValue')) {
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              // Regex matching t("...", { defaultValue: "..." })
              if (/t\s*\(\s*["'][^"']+["']\s*,\s*\{[^}]*defaultValue/i.test(line)) {
                violations.push({
                  file: path.relative(rootDir, full),
                  line: idx + 1,
                  match: line.trim(),
                });
              }
            });
          }
        }
      }
    }

    scan(srcDir);
    expect(
      violations,
      `Found forbidden defaultValue in translations: ${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });
});
