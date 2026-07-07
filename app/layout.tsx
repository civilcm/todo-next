import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "할 일 목록 · Todo List",
  description: "우선순위, 마감일, 카테고리를 지원하는 할 일 관리 앱",
};

// Values are JSON-encoded by useLocalStorageState, hence the quote stripping.
const themeInitScript = `
(function () {
  try {
    var theme = (localStorage.getItem("todo-theme") || "").replace(/"/g, "");
    var dark = theme ? theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
    var lang = (localStorage.getItem("todo-lang") || "").replace(/"/g, "");
    if (lang === "en" || lang === "ko") document.documentElement.lang = lang;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
