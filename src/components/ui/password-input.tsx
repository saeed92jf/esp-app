"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type: _type, disabled, placeholder, dir = "ltr", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          placeholder={placeholder}
          dir={dir}
          className={cn(
            "flex h-11 sm:h-12 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 transition-colors font-sans auth-input-ltr",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            setShowPassword((prev) => !prev);
          }}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none z-10 disabled:pointer-events-none disabled:opacity-50"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4 shrink-0" />
          ) : (
            <Eye className="size-4 shrink-0" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
