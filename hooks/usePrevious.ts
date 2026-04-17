/* eslint-disable react-hooks/refs -- previous-prop pattern reads/writes ref during render */
import { useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const previous = ref.current;
  ref.current = value;
  return previous;
}