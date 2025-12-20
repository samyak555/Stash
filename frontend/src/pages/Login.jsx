import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 relative overflow-hidden">
      {/* Full Page Logo Background - Covering the entire page */}
      <Logo fullPage={true} />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-sm w-full space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="relative inline-block mb-4 sm:mb-6">
              {/* Responsive Logo */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto">
                <img
                  src="/logo.png"
                  alt="Stash"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h2>
            <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-slate-400 px-4 font-medium">
              Sign in to your account to continue your financial journey
            </p>
          </div>
          
          <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6 glass-light p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/30 backdrop-blur-xl" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3.5 border border-slate-600/50 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base focus:bg-slate-900/80"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium group relative w-full flex justify-center py-3.5 px-4 text-sm sm:text-base font-semibold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
              >
                {loading ? (
                  <span className="flex items-center">
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

            <div className="text-center pt-2">
              <Link
                to="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center text-sm sm:text-base"
              >
                Don't have an account? 
                <span className="ml-1 underline">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer at the bottom */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
