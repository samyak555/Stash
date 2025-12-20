import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await authAPI.register(formData);
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 relative overflow-hidden">
      {/* Full Page Logo Background - Bigger and Less Transparent */}
      <Logo fullPage={true} />
      
      <div className="flex-1 flex items-center justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 animate-fade-in">
        <div className="text-center animate-slide-up">
          <div className="relative inline-block mb-4 sm:mb-6">
            <Logo size="xl" showText={true} className="justify-center" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create your account
            </span>
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-400 px-4 font-medium">
            Sign up to get started
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6 glass-light p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/30 backdrop-blur-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-600/50 rounded-xl bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base focus:bg-slate-900/80"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                placeholder="you@example.com"
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
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 text-sm sm:text-base transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
        </div>
      </div>
      
      {/* Footer at the bottom */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Register;

