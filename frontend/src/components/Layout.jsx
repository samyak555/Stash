import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Logo from './Logo';
import Footer from './Footer';
import { DashboardIcon, ExpensesIcon, IncomeIcon, BudgetsIcon, GoalsIcon, FamilyIcon, InsightsIcon } from './Icons';

const Layout = ({ children, user, setUser }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { path: '/expenses', label: 'Expenses', Icon: ExpensesIcon },
    { path: '/income', label: 'Income', Icon: IncomeIcon },
    { path: '/budgets', label: 'Budgets', Icon: BudgetsIcon },
    { path: '/goals', label: 'Goals', Icon: GoalsIcon },
    { path: '/family', label: 'Family', Icon: FamilyIcon },
    { path: '/insights', label: 'AI Insights', Icon: InsightsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="glass-light shadow-xl border-b border-slate-700/30 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo size="default" showText={true} />
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <item.Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-slate-300 text-sm font-medium">Hello, <span className="text-indigo-400">{user?.name}</span></span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200 hover:scale-105"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <span className="text-slate-300 text-xs truncate max-w-[100px] font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-indigo-400 p-2 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium flex items-center transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-slate-800/50 hover:text-red-300 flex items-center transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;

