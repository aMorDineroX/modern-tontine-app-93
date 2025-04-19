
import { Moon, Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ThemeToggle() {
  const { isDarkMode, setIsDarkMode } = useApp();

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-primary" />
      )}
    </button>
  );
}
