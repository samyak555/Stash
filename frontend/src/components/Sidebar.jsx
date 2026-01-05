import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import GuestBadge from './GuestBadge';
// Import logo icon for sidebar header
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

// Card icon SVG
const CardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

// Transaction icon SVG
const TransactionIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// Invest icon SVG
const InvestIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// Logout icon SVG
const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Sidebar = ({ user, setUser }) => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');
      setUser(null);
      toast.success('Logged out successfully');
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
    { path: '/portfolio-insights', label: 'Portfolio Insights', Icon: InsightsIcon },
    { path: '/news', label: 'Stash News', Icon: InsightsIcon },
    { path: '/family', label: 'Family', Icon: FamilyIcon },
    { path: '/insights', label: 'Stash Insight', Icon: InsightsIcon },
    { path: '/analytics', label: 'Analytics', Icon: InsightsIcon },
    { path: '/settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar-bg border-r border-border flex flex-col z-50">
      {/* STASH Logo Section - Clean Professional Brand Area */}
      <div className="border-b border-border bg-gradient-to-br from-sidebar-bg to-card-bg flex items-center justify-center" style={{ minHeight: '80px', padding: '12px' }}>
        <Link to="/" className="flex items-center justify-center gap-3 w-full h-full">
          <img
            src={iconSrc}
            alt="Stash"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '0',
              boxShadow: 'none',
              outline: 'none',
              padding: '0',
              margin: '0',
              display: 'block',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="text-lg sm:text-xl font-bold text-gradient-brand tracking-tight hidden sm:block">
            STASH
          </span>
        </Link>
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-blue/10 text-teal-blue border border-teal-blue/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card-bg'
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
            {/* Avatar Icon or User Image */}
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
          {/* Guest Mode Badge */}
          {user?.isGuest && (
            <div className="mt-3 flex justify-center">
              <GuestBadge />
            </div>
          )}
        </div>
        <Button
          onClick={handleLogout}
          variant="danger"
          size="sm"
          className="w-full justify-start bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 hover:border-red-500/30"
          leftIcon={<LogoutIcon className="w-4 h-4" />}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

