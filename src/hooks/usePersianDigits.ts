import { useEffect } from 'react';

const englishToPersianMap: { [key: string]: string } = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

const abbreviationMap: { [key: string]: string } = {
  'k': ' هزار',
  'm': ' میلیون',
  'b': ' میلیارد',
  't': ' تریلیون'
};

function convertTextNode(node: Node) {
  if (!node.nodeValue) return;
  // Fast check: does it contain any english digit?
  if (!/\d/.test(node.nodeValue)) return;
  
  let text = node.nodeValue;

  // Replace abbreviations like 100k -> 100 هزار, 1.5M -> 1.5 میلیون
  // Matches digits (with optional dots/commas) followed by optional space and k, m, b, or t at word boundary.
  text = text.replace(/([\d.,]+)\s*([kKmMBbTt])\b/g, (match, numberPart, suffix) => {
    const translatedSuffix = abbreviationMap[suffix.toLowerCase()];
    // Wrap in RLE (\u202B) and PDF (\u202C) to force RTL rendering of the number and word,
    // ensuring the word (e.g., میلیون) appears on the left of the number visually.
    return translatedSuffix ? `\u202B${numberPart}${translatedSuffix}\u202C` : match;
  });

  // Replace ASCII digits with Persian digits, BUT skip words containing English letters.
  // This ensures codes like "ESP-32" or "A1" keep their English digits.
  text = text.replace(/(\S+)/g, (word) => {
    if (/[a-zA-Z]/.test(word)) {
      return word;
    }
    return word.replace(/\d/g, (match) => englishToPersianMap[match] || match);
  });

  if (text !== node.nodeValue) {
    node.nodeValue = text;
  }
}

function shouldProcessNode(node: Node, selectors: string[]): boolean {
  let current: Node | null = node;
  let matches = false;

  while (current && current !== document.body && current !== document.documentElement) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as Element;
      const tag = el.tagName?.toUpperCase();
      
      // Hard blocks: never convert inside inputs, code blocks, or explicitly marked English nodes
      if (['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(tag)) {
        return false;
      }
      if (el.classList && el.classList.contains('en-num')) {
        return false;
      }
      
      // Check if the current element matches any of our target selectors
      if (!matches && selectors.length > 0) {
        for (const selector of selectors) {
          if (el.matches && el.matches(selector)) {
            matches = true;
            break;
          }
        }
      }
    }
    current = current.parentNode;
  }
  return matches;
}

export function usePersianDigits(enabled: boolean = true, selectors: string[] = ['.fa-num']) {
  useEffect(() => {
    if (!enabled) return;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!shouldProcessNode(node, selectors)) return;
        convertTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(processNode);
      }
    };

    // 1. Initial pass
    processNode(document.body);

    // 2. Watch for dynamic DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            processNode(node);
          });
        } else if (mutation.type === 'characterData') {
          if (mutation.target.nodeType === Node.TEXT_NODE) {
            if (!shouldProcessNode(mutation.target, selectors)) return;
            convertTextNode(mutation.target);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [enabled]);
}
