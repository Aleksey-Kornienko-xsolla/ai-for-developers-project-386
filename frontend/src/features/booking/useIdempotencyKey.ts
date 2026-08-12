import { useRef } from "react";

export function useIdempotencyKey() {
  const ref = useRef<string | null>(null);
  if (ref.current === null) {
    ref.current = crypto.randomUUID();
  }
  return ref.current;
}