import { LanguageProvider } from "@/components/LanguageProvider";
import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <main className="flex-1">
      <LanguageProvider>
        <TodoApp />
      </LanguageProvider>
    </main>
  );
}
