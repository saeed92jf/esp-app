import { notFound } from 'next/navigation';

// Forwards any unmatched path inside a locale to the locale-aware not-found page.
export default function CatchAllPage() {
  notFound();
}
