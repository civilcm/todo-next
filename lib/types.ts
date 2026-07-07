export type Priority = "high" | "medium" | "low";

export type Filter = "all" | "active" | "completed";

export type Sort = "manual" | "dueDate" | "priority" | "alphabetical";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // "YYYY-MM-DD"
  category: string | null;
  createdAt: number;
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
