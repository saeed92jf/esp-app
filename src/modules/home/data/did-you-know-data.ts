import {
  DID_YOU_KNOW_CARDS_FA,
  type DidYouKnowCardItem,
} from "./did-you-know.fa";
import { DID_YOU_KNOW_CARDS_EN } from "./did-you-know.en";

export type { DidYouKnowCardItem };

/**
 * Deterministic pseudo-random shuffle based on seed.
 * When baseSeed is undefined or 0, a standard fixed order is used for SSR.
 * When baseSeed is passed on the client, it reshuffles freshly.
 */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const copy = [...arr];
  let s = Math.abs(seed) || 12345;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDidYouKnowCards(
  locale: string,
  baseSeed?: number
): DidYouKnowCardItem[] {
  const rawCards =
    locale === "fa" ? DID_YOU_KNOW_CARDS_FA : DID_YOU_KNOW_CARDS_EN;

  if (baseSeed !== undefined) {
    return seededShuffle(rawCards, baseSeed);
  }

  // Deterministic default order for SSR
  return [...rawCards];
}
