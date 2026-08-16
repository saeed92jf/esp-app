# Workspace Rules

## Persian Digits Conversion
Whenever the user requests to convert numbers to Persian (e.g. "فارسی کن اعداد رو"), **DO NOT** attempt to create a global conversion script or apply a global effect.
Instead, use the existing opt-in mechanism:
1. Locate the container, section, or module where the user wants Persian numbers.
2. Add the CSS class `fa-num` or `persian-digits` to that specific container (e.g., `<div className="fa-num">...</div>`).
3. The `usePersianDigits` hook is already configured to automatically detect these classes and convert digits inside them safely without affecting the rest of the app.

