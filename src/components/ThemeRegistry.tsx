"use client";

import * as React from "react";
import createCache, { type EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { CssVarsProvider, getInitColorSchemeScript } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import theme from "@/lib/theme";

/**
 * Wires Joy UI (which uses Emotion) into the Next.js App Router so styles
 * stream during SSR without a flash on hydration.
 *
 * Adapted from the official MUI App Router example:
 * https://mui.com/material-ui/integrations/nextjs/#app-router
 */
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [registry] = React.useState(() => {
    const cache: EmotionCache = createCache({ key: "mbp", prepend: true });
    cache.compat = true;
    type InsertFn = EmotionCache["insert"];
    const prevInsert: InsertFn = cache.insert.bind(cache);
    let inserted: { name: string; isGlobal: boolean }[] = [];
    cache.insert = ((...args: Parameters<InsertFn>) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector });
      }
      return prevInsert(...args);
    }) as InsertFn;
    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) return null;
    let styles = "";
    let dataEmotionAttr = registry.cache.key;
    const globals: { name: string; style: string }[] = [];
    names.forEach(({ name, isGlobal }) => {
      const style = registry.cache.inserted[name];
      if (typeof style === "string") {
        if (isGlobal) {
          globals.push({ name, style });
        } else {
          styles += style;
          dataEmotionAttr += ` ${name}`;
        }
      }
    });
    return (
      <>
        {globals.map(({ name, style }) => (
          <style
            key={name}
            data-emotion={`${registry.cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {styles && (
          <style
            data-emotion={dataEmotionAttr}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </>
    );
  });

  return (
    <CacheProvider value={registry.cache}>
      {getInitColorSchemeScript({ defaultMode: "dark" })}
      <CssVarsProvider theme={theme} defaultMode="dark" modeStorageKey="mbp-mode">
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}
