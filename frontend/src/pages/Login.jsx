import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

// Login component with password authentication
const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
      
      // Sync onboardingCompleted to localStorage
      if (userData.onboardingCompleted) {
        localStorage.setItem('onboardingCompleted', 'true');
      }
      
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

  /**
   * Handle Google Sign-In
   * Redirects to backend OAuth endpoint (Authorization Code Flow)
   * Backend handles all Google authentication logic
   */
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    
    try {
      // Get backend URL from environment or use default
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Remove /api suffix to get base URL
      const backendBaseUrl = API_URL.replace('/api', '');
      
      // Construct full OAuth URL
      const oauthUrl = `${backendBaseUrl}/api/auth/google`;
      
      console.log('Redirecting to Google OAuth:', oauthUrl);
      
      // Redirect to backend OAuth endpoint
      // Backend will handle Google OAuth and redirect back with token
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to initiate Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Full Page Logo Background */}
      <Logo fullPage={true} />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-[400px] space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center animate-slide-up space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-base font-normal">
              Sign in to continue managing your finances
            </p>
          </div>
          
          {/* Auth Card */}
          <div className="glass-light p-8 sm:p-10 rounded-2xl space-y-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {/* Google Sign-In Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 shadow-lg"
              >
                {googleLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-4 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-4 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 text-base font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center"
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

      {/* Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
