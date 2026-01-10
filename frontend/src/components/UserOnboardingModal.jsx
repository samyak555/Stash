import { useState } from 'react';
import Button from './ui/Button';
import Icon from './ui/Icons';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserOnboardingModal = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        profession: 'Student',
        dateOfBirth: '',
    });
    const [loading, setLoading] = useState(false);

    const professions = [
        { id: 'Student', label: 'Student', icon: 'zap' },
        { id: 'Salaried', label: 'Salaried', icon: 'briefcase' },
        { id: 'Business', label: 'Business', icon: 'trendingUp' },
        { id: 'Freelancer', label: 'Freelancer', icon: 'target' },
        { id: 'Homemaker', label: 'Homemaker', icon: 'user' },
        { id: 'Retired', label: 'Retired', icon: 'award' },
        { id: 'Other', label: 'Other', icon: 'star' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate age from DOB if provided
            let calculatedAge = formData.age;
            if (formData.dateOfBirth) {
                const dob = new Date(formData.dateOfBirth);
                const today = new Date();
                calculatedAge = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                    calculatedAge--;
                }
            }

            // Determine user type based on age and profession
            let userType = 'general';
            if (calculatedAge < 18) {
                userType = 'genZ';
            } else if (formData.profession === 'Freelancer') {
                userType = 'freelancer';
            } else if (calculatedAge >= 18 && calculatedAge <= 25) {
                userType = 'genZ'; // Young adults also get Gen Z experience
            }

            const updateData = {
                name: formData.name,
                age: parseInt(calculatedAge),
                profession: formData.profession,
                dateOfBirth: formData.dateOfBirth || undefined,
                userType,
                onboardingCompleted: true,
            };

            await userAPI.updateProfile(updateData);
            toast.success('Setup complete');
            onComplete(userType);
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm transition-all duration-300">
            <div className="w-full max-w-lg transform overflow-hidden rounded-2xl border border-white/10 bg-[#0F1218] shadow-2xl transition-all">

                {/* Header Section */}
                <div className="bg-gradient-to-b from-white/5 to-transparent px-8 py-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                            <Icon icon="zap" size={20} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Welcome</h2>
                    </div>
                    <p className="text-slate-400 text-sm pl-[52px]">Let's personalize your workspace.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-6">

                    {/* Steps Indicator */}
                    <div className="mb-8 flex items-center gap-2">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                    </div>

                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="e.g. Jordan Smith"
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-500">
                                        <Icon icon="user" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* DOB Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-500">
                                        <Icon icon="calendar" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.name || !formData.dateOfBirth}
                                    variant="primary"
                                    fullWidth
                                    className="justify-center"
                                    rightIcon={<Icon icon="chevronRight" size={16} />}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Profession Grid */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Primary Occupation
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {professions.map((prof) => (
                                        <button
                                            key={prof.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, profession: prof.id })}
                                            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${formData.profession === prof.id
                                                    ? 'border-blue-500 bg-blue-500/10 text-white'
                                                    : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/8'
                                                }`}
                                        >
                                            <Icon icon={prof.icon} size={18} className={formData.profession === prof.id ? "text-blue-400" : "text-slate-600 group-hover:text-slate-500"} />
                                            <span className="text-sm font-medium">{prof.label}</span>

                                            {/* Active Indicator */}
                                            {formData.profession === prof.id && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Icon icon="check" size={14} className="text-blue-400" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hint Box */}
                            {formData.dateOfBirth && (
                                <div className="flex items-start gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-4">
                                    <Icon icon="zap" size={16} className="mt-0.5 text-blue-400 shrink-0" />
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {(() => {
                                            const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
                                            if (age < 18) return 'Setting up Gen Z mode customization...';
                                            if (age >= 18 && age <= 25) return 'Optimizing for young professionals...';
                                            if (formData.profession === 'Freelancer') return 'Activating freelancer toolset (GST, Taxes)...';
                                            return 'Personalizing your financial dashboard...';
                                        })()}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    variant="ghost"
                                    className="flex-1 justify-center"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    loading={loading}
                                    variant="primary"
                                    className="flex-[2] justify-center"
                                >
                                    {loading ? 'Finalizing...' : 'Complete Setup'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UserOnboardingModal;
