import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 70000 → "70k", 39999 → "40k", 1500 → "1.5k". */
export const formatCount = (n: number) =>
  n >= 1000 ? `${parseFloat((n / 1000).toFixed(1))}k` : `${n}`;
