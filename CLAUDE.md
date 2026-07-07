# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build (Turbopack; also runs TypeScript checking)
- `npm run lint` — ESLint

There is no test framework set up.

## What this is

A client-side-only todo app (Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript). There is no backend, API route, or database — all state persists to `localStorage`. The single page (`app/page.tsx`) statically prerenders and mounts the `"use client"` component tree: `LanguageProvider` → `TodoApp` → `TodoItem`.

## Architecture and cross-file couplings

**localStorage state**: All persistent state (todos, language, theme) goes through `useLocalStorageState` in `lib/useLocalStorageState.ts`, built on `useSyncExternalStore` with a module-level snapshot cache and listener set. This exists because the repo's ESLint config enforces the React `set-state-in-effect` rule — do not "hydrate from localStorage" with the `useEffect` + `setState` pattern; use this hook. Fallback values passed to it must be stable references (see `EMPTY_TODOS` in `TodoApp.tsx`).

**JSON encoding contract**: `useLocalStorageState` stores values JSON-encoded (so the string `"dark"` is stored as `"dark"` *with quotes*). The inline FOUC-prevention script in `app/layout.tsx` reads the same `todo-theme` / `todo-lang` keys before React loads and strips quotes to decode. If you change storage keys or encoding, update both sides.

**Dark mode**: driven by a `.dark` class on `<html>`, defined as a Tailwind custom variant in `app/globals.css` (`@custom-variant dark`). Three writers must stay consistent: the layout init script (pre-hydration), the `isDark` effect in `TodoApp.tsx` (on toggle), and the `todo-theme` storage value (`"dark"` / `"light"` / null = follow system).

**i18n**: `lib/i18n.ts` holds `ko`/`en` dictionaries typed `as const`; `TranslationKey` is derived from the `ko` shape, so adding a UI string means adding it to both languages or TypeScript fails. Components consume strings only via `useLanguage()` from `components/LanguageProvider.tsx` — no hardcoded UI text. Korean is the default language; `LanguageProvider` also syncs `<html lang>`.

**Font**: Pretendard Variable is self-hosted via the `pretendard` npm package, imported in `app/layout.tsx` and wired to Tailwind's `font-sans` through `--font-sans` in `globals.css`. Don't add `next/font` or CDN font links.

**Domain types**: `lib/types.ts` defines `Todo`, `Priority`, `Filter`, `Sort`. Todo array order in storage is the "manual" sort order; drag-and-drop reordering (only enabled when sort is `manual`) mutates that base order, while other sorts are view-only copies.
