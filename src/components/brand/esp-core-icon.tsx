// src/components/brand/esp-core-icon.tsx
import React, { type SVGProps } from "react";

/**
 * Official ESP CORE brand emblem SVG component.
 * Supports currentColor fill so it can be dynamically styled with Tailwind text-* classes
 * or passed explicit fill/stroke props.
 */
export function EspCoreIcon({
  className,
  fill = "currentColor",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 990.62 990.62"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M495.31,943.72c247.65,0,448.41-200.76,448.41-448.42S742.96,46.9,495.31,46.9,46.9,247.66,46.9,495.3s200.76,448.42,448.41,448.42ZM495.31,630.06c-74.42,0-134.76-60.33-134.76-134.76s60.34-134.74,134.76-134.74v269.5h0ZM495.31,108.84v138.91c-136.72,0-247.55,110.83-247.55,247.55s110.83,247.57,247.55,247.57v138.91c-213.44,0-386.47-173.03-386.47-386.48S281.87,108.84,495.31,108.84Z"
      />
    </svg>
  );
}

