import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('imap.gmail.com');
  const [port, setPort] = useState(993);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    loadSyncStatus();
  }, []);

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and transaction sync settings</p>
      </div>

      {/* Auto-Fetch Transactions Card */}
      <div className="glass-light p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Auto-Fetch Transactions</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Connect your email to automatically fetch transactions from Paytm, PhonePe, banks, MakeMyTrip, and more.
            </p>
          </div>
          {syncStatus?.connected && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
          )}
        </div>

        {syncStatus?.connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">Connected Email:</span>
                <span className="text-white">{syncStatus.email}</span>
              </div>
              {syncStatus.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Last Sync:</span>
                  <span className="text-slate-400 text-sm">
                    {new Date(syncStatus.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="flex-1 btn-premium py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </span>
                ) : (
                  '🔄 Sync Now'
                )}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your-email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                App Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter app password (not your regular password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                For Gmail: Settings → Security → 2-Step Verification → App Passwords
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="host" className="block text-sm font-semibold text-slate-200 mb-2">
                  IMAP Host
                </label>
                <input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="port" className="block text-sm font-semibold text-slate-200 mb-2">
                  Port
                </label>
                <input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                '🔗 Connect Email'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h3 className="text-blue-400 font-semibold mb-2">✨ Supported Services:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-slate-300">
            <div>• Paytm</div>
            <div>• PhonePe</div>
            <div>• MakeMyTrip</div>
            <div>• Bank Transactions</div>
            <div>• Zomato</div>
            <div>• Swiggy</div>
            <div>• Uber</div>
            <div>• Ola</div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Transactions are automatically categorized and synced every 5 minutes. You can also trigger a manual sync anytime.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-light p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700/30">
        <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
        <div className="space-y-3 text-slate-300">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">1</span>
            <p>Connect your email that receives transaction notifications from banks and payment apps.</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">2</span>
            <p>Our system automatically reads transaction emails and extracts details (amount, merchant, date).</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">3</span>
            <p>Transactions are automatically categorized and added to your expense tracker.</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">4</span>
            <p>Sync happens every 5 minutes automatically, or trigger a manual sync anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

