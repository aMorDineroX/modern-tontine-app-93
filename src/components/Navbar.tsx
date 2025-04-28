import { Menu, X, Settings, LogOut, Bell, User, Home, Users, Search, Gem, CalendarDays, Receipt, BarChart3, Package } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import SettingsModal from "./SettingsModal";
import PaymentModal from "./PaymentModal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

/**
 * Composant Navbar - Barre de navigation principale de l'application
 *
 * Ce composant affiche la barre de navigation principale avec les liens vers les différentes
 * sections de l'application, ainsi que des boutons pour les actions rapides comme la recherche,
 * les notifications, les paramètres, le changement de thème, etc.
 *
 * Il s'adapte automatiquement aux écrans mobiles en affichant un menu hamburger.
 *
 * @component
 * @example
 * return (
 *   <Navbar />
 * )
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);
  const { t } = useApp();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const notificationCount = 3;

  const searchPlaceholderText = "Search for groups, members, or transactions...";

  const handlePremiumClick = () => {
    navigate('/premium');
    setShowPremiumTooltip(false);
  };

  return (
    <nav className="relative z-20 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tontine-text-gradient">Naat</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <Home size={18} />
              {t('dashboard')}
            </Link>

            <Link
              to="/tontine-cycles"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/tontine-cycles')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <CalendarDays size={18} />
              Cycles
            </Link>

            <Link
              to="/transactions"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/transactions')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <Receipt size={18} />
              Transactions
            </Link>

            <Link
              to="/statistics"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/statistics')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <BarChart3 size={18} />
              Statistiques
            </Link>

            <Link
              to="/services"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/services')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <Package size={18} />
              Services
            </Link>

            <Link
              to="/groups"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/groups')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <Users size={18} />
              {t('myGroups')}
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/profile')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
              }`}
            >
              <User size={18} />
              {t('profile')}
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-amber-300 to-amber-500 text-white border-amber-500 hover:from-amber-400 hover:to-amber-600 font-medium"
              onClick={handlePremiumClick}
            >
              <Gem size={16} />
              {t('premium')}
            </Button>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-secondary-foreground" />
            </button>

            <button
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors relative"
              aria-label="Notifications"
              onClick={() => setNotificationCount(0)}
            >
              <Bell size={20} className="text-secondary-foreground" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs">
                  {notificationCount}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Settings size={20} className="text-primary" />
            </button>
            <ThemeToggle />
            <button
              className="tontine-button tontine-button-primary"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              {t('depositWithdraw')}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              title="Sign out"
            >
              <LogOut size={20} className="text-destructive" />
            </button>
          </div>

          <div className="flex items-center sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 bg-gradient-to-r from-amber-300 to-amber-500 text-white border-amber-500 hover:from-amber-400 hover:to-amber-600 font-medium"
              onClick={handlePremiumClick}
            >
              <Gem size={16} />
            </Button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors mr-2"
            >
              <Settings size={20} className="text-primary" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background shadow-lg p-4 animate-slide-down border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="search"
                placeholder={searchPlaceholderText}
                className="tontine-input pl-10"
                autoFocus
              />
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="sm:hidden absolute w-full bg-background border-b border-border animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              {t('dashboard')}
            </Link>
            <Link
              to="/groups"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/groups')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Users size={18} />
              {t('myGroups')}
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/profile')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              {t('profile')}
            </Link>

            <Link
              to="/tontine-cycles"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/tontine-cycles')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <CalendarDays size={18} />
              Cycles
            </Link>

            <Link
              to="/transactions"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/transactions')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Receipt size={18} />
              Transactions
            </Link>

            <Link
              to="/statistics"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/statistics')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 size={18} />
              Statistiques
            </Link>

            <Link
              to="/services"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/services')
                  ? 'bg-accent text-primary border-l-4 border-primary'
                  : 'text-foreground hover:bg-accent/50 hover:text-primary hover:border-l-4 hover:border-primary/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Package size={18} />
              Services
            </Link>

            <div className="px-3 py-2">
              <button
                onClick={() => {
                  navigate('/premium');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-md"
              >
                <Gem size={18} />
                {t('premium')}
              </button>
            </div>

            <div className="px-3 py-2">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-foreground hover:bg-accent/50 hover:text-primary"
              >
                <Search size={18} />
                {t('search')}
              </button>
            </div>

            <div className="px-3 py-2">
              <button
                onClick={() => setNotificationCount(0)}
                className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-foreground hover:bg-accent/50 hover:text-primary relative"
              >
                <Bell size={18} />
                {t('notifications')}
                {notificationCount > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground">
                    {notificationCount}
                  </Badge>
                )}
              </button>
            </div>

            <div className="px-3 py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsPaymentModalOpen(true);
                }}
                className="w-full tontine-button tontine-button-primary"
              >
                {t('depositWithdraw')}
              </button>
            </div>
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-destructive hover:bg-accent/50 flex items-center gap-2"
            >
              <LogOut size={18} />
              {t('signOut')}
            </button>
          </div>
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </nav>
  );
}
