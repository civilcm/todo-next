"use client";

import { useEffect, useRef, useState } from "react";
import type { Priority, Todo } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const priorityStyles: Record<Priority, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

function todayString() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

interface TodoItemProps {
  todo: Todo;
  draggable: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
}

export default function TodoItem({
  todo,
  draggable,
  onToggle,
  onDelete,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
}: TodoItemProps) {
  const { lang, t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const priorityLabel = {
    high: t("priorityHigh"),
    medium: t("priorityMedium"),
    low: t("priorityLow"),
  }[todo.priority];

  const today = todayString();
  const isOverdue = !!todo.dueDate && !todo.completed && todo.dueDate < today;
  const isDueToday = !!todo.dueDate && !todo.completed && todo.dueDate === today;

  const dueLabel = todo.dueDate
    ? new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(`${todo.dueDate}T00:00:00`))
    : null;

  const save = () => {
    const text = draft.trim();
    if (text) onEdit(todo.id, text);
    setDraft(text || todo.text);
    setEditing(false);
  };

  return (
    <li
      draggable={draggable && !editing}
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={(e) => onDragOver(e, todo.id)}
      onDrop={() => onDrop(todo.id)}
      className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800/70 ${
        draggable && !editing ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {draggable && (
        <span
          aria-hidden
          title={t("dragHint")}
          className="select-none text-slate-300 dark:text-slate-600"
        >
          ⠿
        </span>
      )}

      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.text}
        className="size-5 shrink-0 accent-indigo-600"
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(todo.text);
                setEditing(false);
              }
            }}
            onBlur={save}
            className="w-full rounded-md border border-indigo-300 bg-transparent px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400 dark:border-indigo-500"
          />
        ) : (
          <p
            className={`truncate text-sm sm:text-base ${
              todo.completed
                ? "text-slate-400 line-through dark:text-slate-500"
                : ""
            }`}
          >
            {todo.text}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${priorityStyles[todo.priority]}`}
          >
            {priorityLabel}
          </span>
          {todo.category && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              #{todo.category}
            </span>
          )}
          {dueLabel && (
            <span
              className={`rounded-full px-2 py-0.5 ${
                isOverdue
                  ? "bg-rose-600 font-semibold text-white"
                  : isDueToday
                    ? "bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              📅 {dueLabel}
              {isOverdue && ` · ${t("overdue")}`}
              {isDueToday && ` · ${t("dueToday")}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => {
            setDraft(todo.text);
            setEditing(true);
          }}
          aria-label={t("editLabel")}
          title={t("editLabel")}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          aria-label={t("deleteLabel")}
          title={t("deleteLabel")}
          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
