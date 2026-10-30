import type { ReactNode } from "react";

// Kök layout yalnızca geçiş katmanıdır; <html> ve <body> [locale]/layout.tsx içindedir.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
