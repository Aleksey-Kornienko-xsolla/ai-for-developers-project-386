import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60 ${
        invalid ? "border-red-500" : "border-slate-300"
      } ${className}`}
      {...props}
    />
  );
});