"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Filter, Priority, Sort, Todo } from "@/lib/types";
import { PRIORITY_ORDER } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import {
  useLocalStorageState,
  useMediaQuery,
} from "@/lib/useLocalStorageState";
import TodoItem from "@/components/TodoItem";

const STORAGE_KEY = "todo-items";
const THEME_KEY = "todo-theme";
const EMPTY_TODOS: Todo[] = [];

export default function TodoApp() {
  const { lang, setLang, t } = useLanguage();

  const [todos, setTodos] = useLocalStorageState<Todo[]>(
    STORAGE_KEY,
    EMPTY_TODOS,
  );

  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");

  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("manual");

  const [theme, setTheme] = useLocalStorageState<"dark" | "light" | null>(
    THEME_KEY,
    null,
  );
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isDark = theme ? theme === "dark" : systemDark;
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      priority,
      dueDate: dueDate || null,
      category: category.trim() || null,
      createdAt: Date.now(),
    };
    setTodos((prev) => [todo, ...prev]);
    setText("");
    setDueDate("");
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) =>
      prev.map((td) =>
        td.id === id ? { ...td, completed: !td.completed } : td,
      ),
    );

  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((td) => td.id !== id));

  const editTodo = (id: string, newText: string) =>
    setTodos((prev) =>
      prev.map((td) => (td.id === id ? { ...td, text: newText } : td)),
    );

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((td) => !td.completed));

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    setTodos((prev) => {
      const next = [...prev];
      const from = next.findIndex((td) => td.id === sourceId);
      const to = next.findIndex((td) => td.id === targetId);
      if (from < 0 || to < 0) return prev;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const categories = useMemo(
    () =>
      Array.from(
        new Set(todos.map((td) => td.category).filter((c): c is string => !!c)),
      ).sort(),
    [todos],
  );

  const visible = useMemo(() => {
    let list = todos;
    if (filter === "active") list = list.filter((td) => !td.completed);
    if (filter === "completed") list = list.filter((td) => td.completed);
    if (categoryFilter)
      list = list.filter((td) => td.category === categoryFilter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (td) =>
          td.text.toLowerCase().includes(q) ||
          (td.category ?? "").toLowerCase().includes(q),
      );
    if (sort === "dueDate")
      list = [...list].sort((a, b) =>
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
      );
    if (sort === "priority")
      list = [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      );
    if (sort === "alphabetical")
      list = [...list].sort((a, b) =>
        a.text.localeCompare(b.text, lang === "ko" ? "ko" : "en"),
      );
    return list;
  }, [todos, filter, categoryFilter, search, sort, lang]);

  const total = todos.length;
  const completed = todos.filter((td) => td.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const filterButtons: { value: Filter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "active", label: t("filterActive") },
    { value: "completed", label: t("filterCompleted") },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("appTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("appSubtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLang(lang === "ko" ? "en" : "ko")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {t("langToggle")}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={t("themeToggle")}
            title={t("themeToggle")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Add form */}
      <form
        onSubmit={addTodo}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70"
      >
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 dark:border-slate-600"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-40"
            disabled={!text.trim()}
          >
            {t("addButton")}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {t("priorityLabel")}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="high">{t("priorityHigh")}</option>
              <option value="medium">{t("priorityMedium")}</option>
              <option value="low">{t("priorityLow")}</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {t("dueDateLabel")}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("categoryPlaceholder")}
            list="category-list"
            className="w-36 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800"
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </form>

      {/* Stats */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <span>
              {t("statsTotal")}{" "}
              <strong className="tabular-nums">{total}</strong>
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {t("statsActive")}{" "}
              <strong className="tabular-nums">{active}</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {t("statsCompleted")}{" "}
              <strong className="tabular-nums">{completed}</strong>
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("progressLabel")}{" "}
            <strong className="tabular-nums">{percent}%</strong>
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {filterButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800"
        />
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">{t("categoryAll")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label={t("sortLabel")}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="manual">{t("sortManual")}</option>
          <option value="dueDate">{t("sortDueDate")}</option>
          <option value="priority">{t("sortPriority")}</option>
          <option value="alphabetical">{t("sortAlphabetical")}</option>
        </select>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          {total === 0 ? t("emptyAll") : t("emptyFiltered")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2" onDragOver={handleDragOver}>
          {visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              draggable={sort === "manual"}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}

      {completed > 0 && (
        <div className="mt-4 text-right">
          <button
            onClick={clearCompleted}
            className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-rose-500 hover:underline"
          >
            {t("clearCompleted")}
          </button>
        </div>
      )}
    </div>
  );
}
