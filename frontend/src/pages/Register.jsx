import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    profession: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation with strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', errors: [] };
    
    const errors = [];
    if (password.length < 8) errors.push('8+ characters');
    if (!/[A-Z]/.test(password)) errors.push('uppercase');
    if (!/[a-z]/.test(password)) errors.push('lowercase');
    if (!/[0-9]/.test(password)) errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('special char');
    
    const remaining = errors.length;
    if (remaining === 0) return { strength: 'strong', errors: [] };
    if (remaining <= 2) return { strength: 'medium', errors };
    return { strength: 'weak', errors };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing (but don't validate on keystroke)
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Normalize password values with trim
    const password = formData.password ? formData.password.trim() : '';
    const confirmPassword = formData.confirmPassword ? formData.confirmPassword.trim() : '';

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const { errors: passwordErrors } = getPasswordStrength(password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Missing: ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password validation (only on submit)
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age validation
    if (formData.age) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
        newErrors.age = 'Age must be between 13 and 100';
      }
    }

    // Profession validation
    if (!formData.profession) {
      newErrors.profession = 'Profession is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Don't send confirmPassword to backend
      const { confirmPassword, ...submitData } = formData;
      const response = await authAPI.register(submitData);
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-[500px] space-y-6 animate-fade-in">
          {/* STASH Logo */}
          <div className="text-center animate-slide-up mb-6">
            <Logo size="xl" showText={true} iconOnly={false} className="justify-center" />
          </div>
          
          {/* Header */}
          <div className="text-center animate-slide-up space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-brand tracking-tight">
              Create your account
            </h1>
            <p className="text-text-secondary text-sm font-normal">
              Start managing your finances with Stash
            </p>
          </div>

          {/* Auth Card */}
          <form 
            className="glass-light p-6 sm:p-8 rounded-2xl space-y-5 animate-scale-in max-h-[85vh] overflow-y-auto" 
            onSubmit={handleSubmit}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal pr-12 ${
                      errors.password ? 'border-red-400/50' : 'border-white/10'
                    }`}
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
                {formData.password && (
                  <div className="mt-1.5">
                    {passwordStrength.errors.length > 0 ? (
                      <p className="text-xs text-amber-400">
                        Need: {passwordStrength.errors.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-green-400">Password strength: {passwordStrength.strength}</p>
                    )}
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal pr-12 ${
                      errors.confirmPassword ? 'border-red-400/50' : 'border-white/10'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-[#1a1d29] text-[#E5E7EB] focus:outline-none focus:border-cyan-400/50 focus:bg-[#1f2332] focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal [&>option]:bg-[#1a1d29] [&>option]:text-[#E5E7EB]"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    colorScheme: 'dark'
                  }}
                >
                  <option value="" className="bg-[#1a1d29] text-[#E5E7EB]">Select gender</option>
                  <option value="Male" className="bg-[#1a1d29] text-[#E5E7EB]">Male</option>
                  <option value="Female" className="bg-[#1a1d29] text-[#E5E7EB]">Female</option>
                  <option value="Non-binary" className="bg-[#1a1d29] text-[#E5E7EB]">Non-binary</option>
                  <option value="Prefer not to say" className="bg-[#1a1d29] text-[#E5E7EB]">Prefer not to say</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="13"
                  max="100"
                  className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal ${
                    errors.age ? 'border-red-400/50' : 'border-white/10'
                  }`}
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                />
                {errors.age && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.age}</p>
                )}
              </div>

              {/* Profession */}
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Profession <span className="text-red-400">*</span>
                </label>
                <select
                  id="profession"
                  name="profession"
                  required
                  className={`w-full px-4 py-3 border rounded-xl bg-[#1a1d29] text-[#E5E7EB] focus:outline-none focus:border-cyan-400/50 focus:bg-[#1f2332] focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal [&>option]:bg-[#1a1d29] [&>option]:text-[#E5E7EB] ${
                    errors.profession ? 'border-red-400/50' : 'border-white/10'
                  }`}
                  value={formData.profession}
                  onChange={handleChange}
                  style={{
                    colorScheme: 'dark'
                  }}
                >
                  <option value="" className="bg-[#1a1d29] text-[#E5E7EB]">Select profession</option>
                  <option value="Student" className="bg-[#1a1d29] text-[#E5E7EB]">Student</option>
                  <option value="Salaried" className="bg-[#1a1d29] text-[#E5E7EB]">Salaried</option>
                  <option value="Business" className="bg-[#1a1d29] text-[#E5E7EB]">Business</option>
                  <option value="Freelancer" className="bg-[#1a1d29] text-[#E5E7EB]">Freelancer</option>
                  <option value="Homemaker" className="bg-[#1a1d29] text-[#E5E7EB]">Homemaker</option>
                  <option value="Retired" className="bg-[#1a1d29] text-[#E5E7EB]">Retired</option>
                  <option value="Other" className="bg-[#1a1d29] text-[#E5E7EB]">Other</option>
                </select>
                {errors.profession && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.profession}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-gradient-brand hover:opacity-80 transition-opacity inline-flex items-center"
                >
                  Sign in
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Register;
