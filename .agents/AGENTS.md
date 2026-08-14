# Workspace Rules

## Persian Digits Conversion
Whenever the user requests to convert numbers to Persian (e.g. "فارسی کن اعداد رو"), **DO NOT** attempt to create a global conversion script or apply a global effect.
Instead, use the existing opt-in mechanism:
1. Locate the container, section, or module where the user wants Persian numbers.
2. Add the CSS class `fa-num` or `persian-digits` to that specific container (e.g., `<div className="fa-num">...</div>`).
3. The `usePersianDigits` hook is already configured to automatically detect these classes and convert digits inside them safely without affecting the rest of the app.

## UI & Design Consistency (WOW Factor)
Whenever creating or modifying a UI component or widget:
1. **Premium Aesthetic**: Avoid basic white/gray boxes. Use subtle gradients (e.g., `bg-gradient-to-br from-card to-card/50`), glassmorphism (`backdrop-blur-xl bg-card/60`), and subtle borders (`border-border/50`).
2. **Micro-Animations**: Always use hover effects (`hover:border-primary/50`, `group-hover:text-primary`) and transitions (`transition-all duration-300`).
3. **Empty States**: Never leave an empty state plain. Use faded icons, muted text, and a centered layout for empty states.
4. **Standard Containers**: Use `rounded-xl`, `border`, `p-5` or `p-6` for widget containers unless specified otherwise.
5. **Color Accents**: Use specific colors from the design system (e.g., emerald for success/checkmarks, rose for deadlines, primary for active states) instead of default generic colors.
