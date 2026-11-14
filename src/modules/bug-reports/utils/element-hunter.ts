// src/modules/bug-reports/utils/element-hunter.ts
import type { InspectedElementData } from "../types";

/**
 * High-precision hunter reticle SVG encoded as a data URL for custom cursor.
 * Features a dynamic crimson target circle, crosshairs, and white center pin.
 */
export const HUNTER_CURSOR_DATA_URI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke="%23EC2527" stroke-width="1.75" stroke-dasharray="3 2"/><circle cx="16" cy="16" r="3" fill="%23EC2527" fill-opacity="0.35" stroke="%23ffffff" stroke-width="1"/><circle cx="16" cy="16" r="1" fill="%23ffffff"/><line x1="16" y1="1" x2="16" y2="7" stroke="%23EC2527" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="25" x2="16" y2="31" stroke="%23EC2527" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="16" x2="7" y2="16" stroke="%23EC2527" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="16" x2="31" y2="16" stroke="%23EC2527" stroke-width="2" stroke-linecap="round"/></svg>`;

/**
 * Calculates a unique, readable CSS selector for any DOM element.
 */
export function getCssSelector(el: Element): string {
  if (el.id) {
    return `#${el.id}`;
  }

  // Check for common test or data attributes
  const testId = el.getAttribute("data-testid") || el.getAttribute("data-id");
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  const path: string[] = [];
  let curr: Element | null = el;

  while (
    curr &&
    curr.nodeType === Node.ELEMENT_NODE &&
    curr !== document.body &&
    curr !== document.documentElement
  ) {
    let sel = curr.nodeName.toLowerCase();

    if (curr.id) {
      sel = `#${curr.id}`;
      path.unshift(sel);
      break;
    }

    // Try using unique classes if present
    const classList = Array.from(curr.classList).filter(
      (c) =>
        !c.startsWith("hover:") &&
        !c.startsWith("focus:") &&
        !c.startsWith("active:") &&
        !c.includes("[") &&
        !c.includes(":")
    );

    if (classList.length > 0) {
      sel += `.${classList.slice(0, 2).join(".")}`;
    }

    // Add nth-of-type for disambiguation
    let sib = curr;
    let nth = 1;
    while ((sib = sib.previousElementSibling as Element)) {
      if (sib.nodeName.toLowerCase() === curr.nodeName.toLowerCase()) {
        nth++;
      }
    }
    if (nth > 1) {
      sel += `:nth-of-type(${nth})`;
    }

    path.unshift(sel);
    curr = curr.parentElement;
  }

  return path.join(" > ") || el.tagName.toLowerCase();
}

/**
 * Calculates an exact XPath for a given DOM element.
 */
export function getXPath(el: Element): string {
  if (el.id) {
    return `//*[@id="${el.id}"]`;
  }

  const parts: string[] = [];
  let curr: Element | null = el;

  while (curr && curr.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = curr.previousSibling;
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        (sibling as Element).nodeName === curr.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = curr.nodeName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : "";
    parts.unshift(`${tagName}${pathIndex}`);
    curr = curr.parentElement;
  }

  return parts.length ? `/${parts.join("/")}` : "";
}

/**
 * Extracts comprehensive technical details and bounding geometry from a DOM element.
 */
export function extractElementInfo(
  el: Element,
  clientX?: number,
  clientY?: number
): InspectedElementData {
  const rect = el.getBoundingClientRect();

  // Extract visible text snippet
  let text = (el.textContent || "").replace(/\s+/g, " ").trim();
  if (text.length > 120) {
    text = text.slice(0, 117) + "...";
  }

  // Extract sanitized HTML snippet
  let htmlSnippet = (el.outerHTML || "").replace(/\s+/g, " ").trim();
  if (htmlSnippet.length > 220) {
    htmlSnippet = htmlSnippet.slice(0, 217) + "...";
  }

  // Get class names as string
  const className =
    typeof el.className === "string"
      ? el.className.trim()
      : typeof (el.className as any)?.baseVal === "string"
      ? (el.className as any).baseVal
      : undefined;

  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id || undefined,
    className: className || undefined,
    selector: getCssSelector(el),
    xpath: getXPath(el),
    textSnippet: text || undefined,
    role: el.getAttribute("role") || undefined,
    ariaLabel: el.getAttribute("aria-label") || undefined,
    rect: {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      bottom: Math.round(rect.bottom),
      right: Math.round(rect.right),
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: Math.round(window.scrollX),
      scrollY: Math.round(window.scrollY),
    },
    htmlSnippet: htmlSnippet || undefined,
  };
}

/**
 * Formats an element display tag e.g. `<button#submit.btn>`
 */
export function formatElementTagBadge(info: InspectedElementData): string {
  let badge = `<${info.tagName}`;
  if (info.id) badge += `#${info.id}`;
  if (info.className) {
    const firstClass = info.className.split(" ")[0];
    if (firstClass && !firstClass.includes(":")) {
      badge += `.${firstClass}`;
    }
  }
  badge += ">";
  return badge;
}

