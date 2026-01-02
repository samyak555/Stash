import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

// Register component with extended onboarding fields
const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    profession: '',
    incomeSources: [],
    incomeRange: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('1 uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('1 lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('1 number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('1 special character');
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'incomeSources') {
      // Handle multi-select for income sources
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        incomeSources: selectedOptions,
      });
      if (errors.incomeSources) {
        setErrors({ ...errors, incomeSources: '' });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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

    // Income sources validation
    if (!formData.incomeSources || formData.incomeSources.length === 0) {
      newErrors.incomeSources = 'At least one income source is required';
    }

    // Income range validation
    if (!formData.incomeRange) {
      newErrors.incomeRange = 'Income range is required';
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

  const passwordErrors = formData.password ? validatePassword(formData.password) : [];

  return (
    <div className="min-h-screen flex flex-col bg-app-bg relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-[540px] space-y-6 animate-fade-in">
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
                {formData.password && passwordErrors.length > 0 && (
                  <p className="mt-1.5 text-xs text-amber-400">
                    Required: {passwordErrors.join(', ')}
                  </p>
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
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
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
                  className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal ${
                    errors.profession ? 'border-red-400/50' : 'border-white/10'
                  }`}
                  value={formData.profession}
                  onChange={handleChange}
                >
                  <option value="">Select profession</option>
                  <option value="Student">Student</option>
                  <option value="Salaried (Private)">Salaried (Private)</option>
                  <option value="Salaried (Government)">Salaried (Government)</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Self Employed">Self Employed</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired">Retired</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other</option>
                </select>
                {errors.profession && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.profession}</p>
                )}
              </div>

              {/* Income Sources */}
              <div>
                <label htmlFor="incomeSources" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Primary Source of Income <span className="text-red-400">*</span>
                </label>
                <select
                  id="incomeSources"
                  name="incomeSources"
                  required
                  multiple
                  size="4"
                  className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal ${
                    errors.incomeSources ? 'border-red-400/50' : 'border-white/10'
                  }`}
                  value={formData.incomeSources}
                  onChange={handleChange}
                >
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Investments">Investments</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Pension">Pension</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Other">Other</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-400">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
                {errors.incomeSources && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.incomeSources}</p>
                )}
              </div>

              {/* Income Range */}
              <div>
                <label htmlFor="incomeRange" className="block text-sm font-medium text-slate-300 mb-2 tracking-tight">
                  Monthly Income Range <span className="text-red-400">*</span>
                </label>
                <select
                  id="incomeRange"
                  name="incomeRange"
                  required
                  className={`w-full px-4 py-3 border rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm font-normal ${
                    errors.incomeRange ? 'border-red-400/50' : 'border-white/10'
                  }`}
                  value={formData.incomeRange}
                  onChange={handleChange}
                >
                  <option value="">Select income range</option>
                  <option value="Below ₹10,000">Below ₹10,000</option>
                  <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                  <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                  <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                  <option value="₹1,00,000 – ₹5,00,000">₹1,00,000 – ₹5,00,000</option>
                  <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                </select>
                {errors.incomeRange && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.incomeRange}</p>
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
