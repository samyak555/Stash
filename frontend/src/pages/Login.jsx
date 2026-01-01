import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
// Import logo for background
import logoSrc from '../assets/logo/logo.png';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      // Check if Google OAuth is configured
      if (!clientId) {
        toast.error('Google Sign-In is not configured. Please use email login.', { duration: 5000 });
        setGoogleLoading(false);
        return;
      }

      // Wait for Google script to load
      if (!window.google) {
        // Wait up to 3 seconds for Google script to load
        let attempts = 0;
        while (!window.google && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.google) {
          toast.error('Google Sign-In script not loaded. Please refresh the page.', { duration: 5000 });
          setGoogleLoading(false);
          return;
        }
      }

      // Use Google Identity Services (gsi) for OAuth
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            toast.error('Google sign-in was cancelled or failed');
            setGoogleLoading(false);
            return;
          }

          if (response.access_token) {
            try {
              // Get user info from Google
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${response.access_token}`
                }
              });
              
              if (!userInfoResponse.ok) {
                throw new Error('Failed to fetch user info from Google');
              }
              
              const userInfo = await userInfoResponse.json();

              // Send to backend
              const authResponse = await authAPI.googleAuth({
                accessToken: response.access_token,
                email: userInfo.email,
                name: userInfo.name || userInfo.email
              });

              const { token, ...userData } = authResponse.data;
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);

              if (userData.emailAutoConnected) {
                toast.success('Signed in with Google! Email sync automatically configured.', { duration: 6000 });
              } else {
                toast.success('Signed in with Google!');
              }
              navigate('/');
            } catch (error) {
              console.error('Google auth error:', error);
              const errorMessage = error.response?.data?.message || error.message || 'Failed to complete Google sign-in';
              toast.error(errorMessage);
            }
          }
          setGoogleLoading(false);
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try email login.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-app-bg relative flex items-center justify-center">
      {/* Large Background Squirrel Logo - Hero Scale, Bold Brand Presence */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logoSrc})`,
          backgroundSize: '90%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          filter: 'blur(1px)',
        }}
      />

      {/* Main Content - Centered, Non-Scrollable */}
      <div className="relative z-10 w-full max-w-[420px] px-4 sm:px-6">
        <div className="space-y-6">
          {/* STASH Wordmark - Bold Brand Identity */}
          <div className="text-center mb-4">
            <h1 className="text-5xl sm:text-6xl font-black text-gradient-brand tracking-tight uppercase mb-2">
              STASH
            </h1>
            <p className="text-text-secondary text-sm font-medium">
              Financial Management Platform
            </p>
          </div>

          {/* Welcome Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-text-secondary text-sm">
              Sign in to continue managing your finances
            </p>
          </div>
          
          {/* Auth Card */}
          <div className="glass-light p-6 sm:p-8 rounded-2xl space-y-5">
            {/* Google Sign-In Button */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-white/20 shadow-lg"
                leftIcon={
                  googleLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )
                }
              >
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              {/* Description */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                <p className="text-xs text-cyan-300 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Automatic Transaction Sync
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you sign in with Google, we automatically connect your Gmail to fetch transactions from Paytm, PhonePe, banks, and more. No manual setup required!
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
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
                    ) : null
                  }
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="text-center pt-3 border-t border-white/5">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-gradient-brand hover:opacity-80 transition-opacity inline-flex items-center"
                >
                  Sign up
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
