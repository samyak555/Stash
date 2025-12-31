import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from './Logo';
import Button from './ui/Button';
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
    { path: '/family', label: 'Family', Icon: FamilyIcon },
    { path: '/insights', label: 'AI Insights', Icon: InsightsIcon },
    { path: '/settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar-bg border-r border-border flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-3">
          <Logo size="small" showText={false} />
          <span className="text-lg font-semibold text-teal tracking-tight">Stash</span>
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
                    ? 'bg-teal/20 text-teal border border-teal/30'
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
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Account</p>
          <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="danger"
          size="sm"
          className="w-full justify-start"
          leftIcon={<LogoutIcon className="w-4 h-4" />}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

