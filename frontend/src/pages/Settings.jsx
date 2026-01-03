import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('imap.gmail.com');
  const [port, setPort] = useState(993);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  // Profile editing state
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    profession: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkGuestMode();
    
    // Only load data if not guest
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    if (!guestStatus) {
      loadSyncStatus();
      loadProfile();
    }
  }, []);

  const checkGuestMode = () => {
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestStatus);
    
    // Redirect guest users to login
    if (guestStatus) {
      toast.error('Please sign in to access Settings');
      // Use setTimeout to avoid navigation during render
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      setProfile({
        name: userData.name || '',
        age: userData.age || '',
        profession: userData.profession || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setProfile({
            name: userData.name || '',
            age: userData.age || '',
            profession: userData.profession || '',
          });
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const updateData = {
        name: profile.name.trim(),
      };
      
      if (profile.age) {
        const ageNum = parseInt(profile.age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
          toast.error('Age must be between 13 and 100');
          setProfileLoading(false);
          return;
        }
        updateData.age = ageNum;
      }
      
      if (profile.profession) {
        updateData.profession = profile.profession.trim();
      }

      await userAPI.updateProfile(updateData);
      
      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const updatedUser = { ...userData, ...updateData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const res = await transactionAPI.getSyncStatus();
      setSyncStatus(res.data);
      if (res.data.email) {
        setEmail(res.data.email);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleConnectEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await transactionAPI.connectEmail({ email, password, host, port });
      toast.success('Email connected! Transactions will sync automatically every 5 minutes.');
      setPassword(''); // Clear password field
      await loadSyncStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect email. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your email?')) {
      return;
    }

    setLoading(true);
    try {
      await transactionAPI.disconnectEmail();
      toast.success('Email disconnected successfully.');
      setEmail('');
      setPassword('');
      await loadSyncStatus();
    } catch (error) {
      toast.error('Failed to disconnect email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await transactionAPI.syncNow();
      if (res.data.transactionsFound > 0) {
        toast.success(`Found ${res.data.transactionsFound} new transaction(s)!`);
      } else {
        toast.success('No new transactions found.');
      }
      await loadSyncStatus();
      
      // Refresh the page after 1 second to show new transactions
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sync failed. Please check your email connection.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-10 animate-fade-in">
      {/* Company Identity */}
      <div className="text-center pb-4 border-b border-white/10">
        <p className="text-slate-400 text-sm">
          Powered by <span className="text-slate-300 font-medium">Cestrum Technologies Private Limited</span> (India)
        </p>
        <p className="text-slate-500 text-xs mt-1">
          <a 
            href="mailto:administrator-stash.auth7@gmail.com" 
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            administrator-stash.auth7@gmail.com
          </a>
        </p>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-lg font-normal">Manage your account and transaction sync settings</p>
      </div>

      {/* Profile Settings - Only for authenticated users */}
      {!isGuest && (
        <div className="glass-card p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/8 transition-all focus:border-cyan-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age
              </label>
              <input
                type="number"
                min="13"
                max="100"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Enter your age"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/8 transition-all focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profession
              </label>
              <select
                value={profile.profession}
                onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/8 transition-all focus:border-cyan-400/50"
              >
                <option value="">Select profession</option>
                <option value="Student">Student</option>
                <option value="Salaried">Salaried</option>
                <option value="Business">Business</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Retired">Retired</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={profileLoading}
              className="w-full"
            >
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </div>
      )}

      {/* Auto-Fetch Transactions Card */}
      <div className="glass-card p-8 sm:p-10 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Auto-Fetch Transactions</h2>
            <p className="text-slate-400 text-base font-normal mb-2">
              Automatically fetch transactions from Paytm, PhonePe, banks, MakeMyTrip, and more.
            </p>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-cyan-300 font-medium mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Automatic Setup
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you signed in with Google, your Gmail is automatically connected! No manual setup needed. Transactions sync every 5 minutes.
              </p>
            </div>
          </div>
          {syncStatus?.connected && (
            <div className="flex items-center space-x-3 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
              <span className="text-cyan-400 text-sm font-semibold">Connected</span>
            </div>
          )}
        </div>

        {syncStatus?.connected ? (
          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 font-normal text-sm">Connected Email:</span>
                <span className="text-white font-medium">{syncStatus.email}</span>
              </div>
              {syncStatus.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-normal text-sm">Last Sync:</span>
                  <span className="text-slate-400 text-sm font-normal">
                    {new Date(syncStatus.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSyncNow}
                disabled={syncing}
                variant="primary"
                className="flex-1"
                leftIcon={
                  syncing ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>🔄</span>
                  )
                }
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={loading}
                variant="danger"
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <p className="text-sm text-slate-300 font-medium mb-2">💡 Prefer Automatic Setup?</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Sign out and sign in again using "Continue with Google" on the login page. Your Gmail will be automatically connected - no passwords needed!
              </p>
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-slate-400 font-medium mb-4">Manual Setup (Alternative)</p>
              <form onSubmit={handleConnectEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your-email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                App Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter app password (not your regular password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                For Gmail: Settings → Security → 2-Step Verification → App Passwords
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                  IMAP Host
                </label>
                <input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                />
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                  Port
                </label>
                <input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
              leftIcon={
                loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>🔗</span>
                )
              }
            >
              {loading ? 'Connecting...' : 'Connect Email'}
            </Button>
          </form>
          </div>
        </div>
        )}

        <div className="mt-6 p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <h3 className="text-cyan-400 font-semibold mb-3 text-base">✨ Supported Services:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-slate-300 font-normal">
            <div>• Paytm</div>
            <div>• PhonePe</div>
            <div>• MakeMyTrip</div>
            <div>• Bank Transactions</div>
            <div>• Zomato</div>
            <div>• Swiggy</div>
            <div>• Uber</div>
            <div>• Ola</div>
          </div>
          <p className="mt-4 text-xs text-slate-400 font-normal">
            Transactions are automatically categorized and synced every 5 minutes. You can also trigger a manual sync anytime.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card p-8 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">How It Works</h2>
        <div className="space-y-4 text-slate-300">
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 font-semibold text-sm">1</span>
            <p className="font-normal">Connect your email that receives transaction notifications from banks and payment apps.</p>
          </div>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 font-semibold text-sm">2</span>
            <p className="font-normal">Our system automatically reads transaction emails and extracts details (amount, merchant, date).</p>
          </div>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 font-semibold text-sm">3</span>
            <p className="font-normal">Transactions are automatically categorized and added to your expense tracker.</p>
          </div>
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-7 h-7 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 font-semibold text-sm">4</span>
            <p className="font-normal">Sync happens every 5 minutes automatically, or trigger a manual sync anytime.</p>
          </div>
        </div>
      </div>

      {/* Privacy & Trust */}
      <div className="glass-card p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Privacy & Trust</h2>
        <div className="space-y-4">
          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">We do not access your bank account</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Stash only reads transaction emails you choose to connect. We never access your bank accounts, credit cards, or financial institutions directly.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">You stay in full control of your data</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  All your financial data is stored securely. You can add, edit, or delete any entry at any time. Manual tracking means you decide what to share.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Manual tracking. No forced linking.</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Email sync is optional. You can track expenses manually without connecting anything. We respect your choice.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Your data is never sold</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We don't sell your financial data to third parties. Your privacy is our priority. Your information stays yours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <DeleteAccountSection />

      {/* Legal Links */}
      <div className="pt-8 border-t border-white/10">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
          <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-600">•</span>
          <Link to="/terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
          <span className="text-slate-600">•</span>
          <Link to="/data-deletion" className="hover:text-cyan-400 transition-colors">
            Data Deletion Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Delete Account Component
 * Only shown for authenticated Google users (not guests)
 */
const DeleteAccountSection = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Don't show for guests
  const isGuest = localStorage.getItem('isGuest') === 'true';
  // Show delete account for authenticated users (has token)
  const hasToken = localStorage.getItem('token');
  if (isGuest || !user || !hasToken) {
    return null;
  }

  const handleDeleteAccount = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    // Confirm deletion with user
    const finalConfirm = window.confirm(
      'Are you absolutely sure? This will permanently delete your account and ALL data. This action cannot be undone.'
    );

    if (!finalConfirm) {
      setShowConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      // Call delete account API directly
      const { userAPI } = await import('../services/api');
      await userAPI.deleteAccount();

      // Clear all local data
      localStorage.clear();
      
      toast.success('Account deleted successfully');
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="glass-card p-4 md:p-8 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Delete Account</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.{' '}
            <Link to="/data-deletion" className="text-cyan-400 hover:text-cyan-300 underline">
              Learn more about our data deletion policy
            </Link>.
          </p>

          {!showConfirm ? (
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="mt-4 w-full md:w-auto"
            >
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm font-medium mb-2">⚠️ Warning: This action is irreversible</p>
                <p className="text-slate-300 text-xs">
                  This will permanently delete:
                </p>
                <ul className="text-slate-400 text-xs list-disc list-inside mt-2 space-y-1">
                  <li>Your account and profile</li>
                  <li>All expenses and income records</li>
                  <li>All goals and budgets</li>
                  <li>All transaction sync settings</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                  className="flex-1 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 w-full sm:w-auto"
                >
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

