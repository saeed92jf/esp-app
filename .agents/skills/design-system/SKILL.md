---
name: design-system
description: Rules and guidelines for creating premium, consistent, and beautiful UI widgets in the ESP App.
---

# Design System Guidelines

When building UI for the ESP App, you must follow these guidelines to ensure a premium, WOW-factor experience.

## 1. Container & Layout
- Use `rounded-xl` for cards and widgets.
- Default padding is `p-5` or `p-6`.
- Add a subtle border: `border border-border/50` or `border-border/40`.
- Use gradients or subtle background variations to avoid flat colors: e.g., `bg-gradient-to-br from-background to-muted/20`.

## 2. Micro-Animations & Interactivity
- Every interactive element (list items, buttons, cards) MUST have a hover state.
- Use `transition-all duration-300` or `transition-colors`.
- Group hovers are encouraged: use `group` on the parent container and `group-hover:text-primary` or `group-hover:bg-primary/10` on children to create cohesive interactive feedback.

## 3. Typography & Icons
- Use `lucide-react` for icons.
- Headers should be `font-semibold` and generally small to medium (`text-lg` or `text-base`).
- Use muted colors for secondary text (`text-muted-foreground`).
- Numbers and dates should be clean. If in a Persian locale container (`fa-num`), ensure digits are easily converted.

## 4. Empty States
- Always design a beautiful empty state.
- Use a large, faded icon (`opacity-20`, `size-10`).
- Place text below it in `text-sm text-muted-foreground`.
- Center the content using `flex flex-col items-center justify-center`.

## 5. Shadows and Depth
- Use `shadow-sm` for normal cards.
- On hover, consider elevating slightly with `hover:shadow-md` or changing the border color (`hover:border-primary/30`).
