import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, step, disabled, readOnly, onWheel, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current!);

    const resolvedStep = type === "number" && step === undefined ? "any" : step;

    const clearHold = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    React.useEffect(() => {
      return () => clearHold();
    }, [clearHold]);

    const handleStep = React.useCallback(
      (direction: 1 | -1) => {
        const el = innerRef.current;
        if (!el || disabled || readOnly) return;

        const min = el.min !== "" ? parseFloat(el.min) : -Infinity;
        const max = el.max !== "" ? parseFloat(el.max) : Infinity;
        const parsedStep =
          step && step !== "any" ? parseFloat(String(step)) : 1;
        const effectiveStep = isNaN(parsedStep) || parsedStep <= 0 ? 1 : parsedStep;

        let current = parseFloat(el.value);
        if (isNaN(current)) {
          current =
            direction > 0
              ? min !== -Infinity && min > 0
                ? min
                : 0
              : min !== -Infinity
              ? min
              : 0;
        }

        let next = current + direction * effectiveStep;

        const stepDecimals =
          effectiveStep.toString().split(".")[1]?.length || 0;
        const currentDecimals =
          el.value.toString().split(".")[1]?.length || 0;
        const precision = Math.max(stepDecimals, currentDecimals);
        next = parseFloat(next.toFixed(Math.min(precision, 10)));

        if (next < min) next = min;
        if (next > max) next = max;

        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        if (nativeSetter) {
          nativeSetter.call(el, String(next));
        } else {
          el.value = String(next);
        }

        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      [disabled, readOnly, step]
    );

    const startHold = React.useCallback(
      (direction: 1 | -1) => {
        handleStep(direction);
        clearHold();
        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            handleStep(direction);
          }, 60);
        }, 350);
      },
      [handleStep, clearHold]
    );

    const inputElement = (
      <input
        ref={innerRef}
        type={type}
        step={resolvedStep}
        disabled={disabled}
        readOnly={readOnly}
        data-slot="input"
        className={cn(
          "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring disabled:bg-muted/50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:bg-black dark:disabled:bg-muted/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-10 w-full min-w-0 rounded-lg border bg-white text-foreground px-2.5 py-1 text-sm font-medium transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          type === "number" &&
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pe-8 min-w-[4.5rem]",
          className
        )}
        onWheel={(e) => {
          if (type === "number") {
            (e.target as HTMLElement).blur();
          }
          onWheel?.(e);
        }}
        {...props}
      />
    );

    if (type !== "number") {
      return inputElement;
    }

    return (
      <div className="relative flex items-center w-full min-w-[4.5rem]">
        {inputElement}
        <div className="absolute end-1 inset-y-0 flex flex-col justify-center items-center w-4 select-none pointer-events-auto py-1">
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || readOnly}
            onMouseDown={(e) => {
              e.preventDefault();
              startHold(1);
            }}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(1);
            }}
            onTouchEnd={clearHold}
            className="flex h-[42%] w-full items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/80 active:bg-accent active:text-primary transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            aria-label="Increase value"
          >
            <ChevronUp className="size-3 stroke-[2.5]" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || readOnly}
            onMouseDown={(e) => {
              e.preventDefault();
              startHold(-1);
            }}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(-1);
            }}
            onTouchEnd={clearHold}
            className="flex h-[42%] w-full items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/80 active:bg-accent active:text-primary transition-all duration-150 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            aria-label="Decrease value"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

