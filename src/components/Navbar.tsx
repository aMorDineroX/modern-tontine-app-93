
import { Menu, X, Settings, LogOut, Bell, User, Home, Users, Search, Gem } from "lucide-react";
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
    <nav className="relative z-20 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tontine-text-gradient">Tontine</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/dashboard') 
                  ? 'text-tontine-purple dark:text-tontine-light-purple border-b-2 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-b-2 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
              }`}
            >
              <Home size={18} />
              {t('dashboard')}
            </Link>
            <Link 
              to="/groups" 
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/groups') 
                  ? 'text-tontine-purple dark:text-tontine-light-purple border-b-2 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-b-2 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
              }`}
            >
              <Users size={18} />
              {t('myGroups')}
            </Link>
            <Link 
              to="/profile" 
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/profile') 
                  ? 'text-tontine-purple dark:text-tontine-light-purple border-b-2 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-b-2 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
              }`}
            >
              <User size={18} />
              {t('profile')}
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-amber-300 to-amber-500 text-white border-amber-500 hover:from-amber-400 hover:to-amber-600"
              onClick={handlePremiumClick}
            >
              <Gem size={16} className="mr-1" />
              {t('premium')}
            </Button>
            
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-700 dark:text-gray-300" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs">
                  {notificationCount}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
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
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 bg-gradient-to-r from-amber-300 to-amber-500 text-white border-amber-500 hover:from-amber-400 hover:to-amber-600"
              onClick={handlePremiumClick}
            >
              <Gem size={16} />
            </Button>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
            >
              <Settings size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
            </button>
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

      {searchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 animate-slide-down border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="search"
                placeholder={searchPlaceholderText}
                className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
              <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
              <button 
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 text-base font-medium ${
                isActive('/dashboard') 
                  ? 'bg-tontine-soft-purple text-tontine-purple dark:bg-gray-800 dark:text-tontine-light-purple border-l-4 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-l-4 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
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
                  ? 'bg-tontine-soft-purple text-tontine-purple dark:bg-gray-800 dark:text-tontine-light-purple border-l-4 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-l-4 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
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
                  ? 'bg-tontine-soft-purple text-tontine-purple dark:bg-gray-800 dark:text-tontine-light-purple border-l-4 border-tontine-purple dark:border-tontine-light-purple' 
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple hover:border-l-4 hover:border-tontine-purple dark:hover:border-tontine-light-purple'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              {t('profile')}
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
                className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Search size={18} />
                {t('search')}
              </button>
            </div>
            
            <div className="px-3 py-2">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 relative">
                <Bell size={18} />
                {t('notifications')}
                {notificationCount > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
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
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
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
