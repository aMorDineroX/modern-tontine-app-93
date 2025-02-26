
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-20 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tontine-text-gradient">Tontine</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              Dashboard
            </Link>
            <Link to="/groups" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              My Groups
            </Link>
            <Link to="/profile" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              Profile
            </Link>
            <ThemeToggle />
            <button className="tontine-button tontine-button-primary">
              Create Group
            </button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tontine-purple"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/groups"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              My Groups
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <div className="px-3 py-2">
              <button className="w-full tontine-button tontine-button-primary">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
