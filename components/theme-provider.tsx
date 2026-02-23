"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      storageKey="theme"
      themes={["light", "dark"]}
    >
      {props.children}
    </NextThemesProvider>
  );
}
