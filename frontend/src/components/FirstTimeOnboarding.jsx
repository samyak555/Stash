import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Button from './ui/Button';
import Logo from './Logo';
import toast from 'react-hot-toast';

/**
 * First-Time Onboarding for Google Users
 * Mandatory fields: Name, Age, Profession
 * Only shown on first Google sign-in
 */
const FirstTimeOnboarding = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    profession: '',
    professionOther: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const professions = [
    'Student',
    'Salaried',
    'Business',
    'Freelancer',
    'Homemaker',
    'Retired',
    'Other',
  ];

  useEffect(() => {
    // Pre-fill name from Google
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Age validation
    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      newErrors.age = 'Please enter a valid age (13-100)';
    }

    // Profession validation
    if (!formData.profession) {
      newErrors.profession = 'Please select your profession';
    }
    if (formData.profession === 'Other' && !formData.professionOther.trim()) {
      newErrors.professionOther = 'Please specify your profession';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with mandatory fields
      const professionValue = formData.profession === 'Other' 
        ? formData.professionOther.trim() 
        : formData.profession;

      await userAPI.updateProfile({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        profession: professionValue,
        onboardingCompleted: true, // Mark onboarding as complete
      });

      // Update local user data
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        profession: professionValue,
        onboardingCompleted: true,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('onboardingCompleted', 'true');

      toast.success('Profile updated successfully!');
      onComplete(updatedUser);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* STASH Logo */}
        <div className="text-center mb-8">
          <Logo size="xl" showText={true} iconOnly={false} className="justify-center" />
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
            <p className="text-slate-400 text-sm">Help us personalize your Stash experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/8 transition-all ${
                  errors.name ? 'border-red-500' : 'border-white/10 focus:border-cyan-400/50'
                }`}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="13"
                max="100"
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(value) && parseInt(value) >= 13 && parseInt(value) <= 100)) {
                    setFormData({ ...formData, age: value });
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }
                }}
                placeholder="Enter your age"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/8 transition-all ${
                  errors.age ? 'border-red-500' : 'border-white/10 focus:border-cyan-400/50'
                }`}
              />
              {errors.age && (
                <p className="text-xs text-red-400 mt-1">{errors.age}</p>
              )}
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profession <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.profession}
                onChange={(e) => {
                  setFormData({ ...formData, profession: e.target.value, professionOther: '' });
                  if (errors.profession) setErrors({ ...errors, profession: '', professionOther: '' });
                }}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:bg-white/8 transition-all ${
                  errors.profession ? 'border-red-500' : 'border-white/10 focus:border-cyan-400/50'
                }`}
              >
                <option value="">Select profession</option>
                {professions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
              {errors.profession && (
                <p className="text-xs text-red-400 mt-1">{errors.profession}</p>
              )}

              {/* Other profession input */}
              {formData.profession === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.professionOther}
                    onChange={(e) => {
                      setFormData({ ...formData, professionOther: e.target.value });
                      if (errors.professionOther) setErrors({ ...errors, professionOther: '' });
                    }}
                    placeholder="Specify your profession"
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/8 transition-all ${
                      errors.professionOther ? 'border-red-500' : 'border-white/10 focus:border-cyan-400/50'
                    }`}
                  />
                  {errors.professionOther && (
                    <p className="text-xs text-red-400 mt-1">{errors.professionOther}</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
            </Button>

            {/* Info */}
            <p className="text-xs text-slate-400 text-center">
              This information helps us provide personalized insights
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeOnboarding;

