import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import GuestBadge from './GuestBadge';
import iconSrc from '../assets/logo/icon.png';
import { 
  DashboardIcon, 
  ExpensesIcon, 
  IncomeIcon, 
  BudgetsIcon, 
  GoalsIcon, 
  FamilyIcon, 
  InsightsIcon, 
  SettingsIcon 
} from './Icons';

const CardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TransactionIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const InvestIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MobileSidebar = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');
      setUser(null);
      setIsOpen(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', Icon: DashboardIcon },
    { path: '/cards', label: 'Cards', Icon: CardIcon },
    { path: '/transactions', label: 'Transactions', Icon: TransactionIcon },
    { path: '/expenses', label: 'Expenses', Icon: ExpensesIcon },
    { path: '/income', label: 'Income', Icon: IncomeIcon },
    { path: '/budgets', label: 'Budgets', Icon: BudgetsIcon },
    { path: '/goals', label: 'Goals', Icon: GoalsIcon },
    { path: '/invest', label: 'Stash Invest', Icon: InvestIcon },
    { path: '/family', label: 'Family', Icon: FamilyIcon },
    { path: '/insights', label: 'Stash Insight', Icon: InsightsIcon },
    { path: '/settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <>
      {/* Hamburger Button - Mobile Only - Always visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg backdrop-blur-sm border border-white/10 transition-all shadow-lg"
        aria-label="Open menu"
        style={{ zIndex: 60 }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity"
          onClick={() => setIsOpen(false)}
          style={{ zIndex: 55 }}
        />
      )}

      {/* Sliding Sidebar - Mobile Only */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-80 bg-sidebar-bg border-r border-border flex flex-col z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 60 }}
      >
        {/* Logo Section */}
        <div className="border-b border-border bg-gradient-to-br from-sidebar-bg to-card-bg flex items-center justify-between px-4" style={{ minHeight: '80px' }}>
          <Link to="/" className="flex items-center justify-center flex-1 h-full" onClick={() => setIsOpen(false)}>
            <img
              src={iconSrc}
              alt="Stash"
              className="w-full h-full object-contain"
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '0',
                boxShadow: 'none',
                outline: 'none',
                padding: '0',
                margin: '0',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-blue/10 text-teal-blue border border-teal-blue/30'
                      : 'text-text-secondary active:text-text-primary active:bg-card-bg'
                  }`}
                >
                  <item.Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="px-4 py-2">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Account</p>
            <div className="flex items-center space-x-3 mb-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-card-bg border border-border flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
              </div>
            </div>
            {(user?.isGuest || user?.role === 'guest') && (
              <div className="mt-3 flex justify-center">
                <GuestBadge />
              </div>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="danger"
            size="sm"
            className="w-full justify-start bg-red-500/10 active:bg-red-500/15 text-red-400 border border-red-500/20 active:border-red-500/30"
            leftIcon={<LogoutIcon className="w-4 h-4" />}
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;

