// src/components/ThemeToggle.tsx
import { FaSun, FaMoon } from "react-icons/fa";
import { Theme } from "../types";

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export default function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <FaSun className="text-yellow-500" /> : <FaMoon />}
    </button>
  );
}