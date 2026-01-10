import GSTCalculator from '../components/GSTCalculator';
import Icon from '../components/ui/Icons';

const FreelancerTools = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Icon icon="briefcase" size={28} className="text-purple-400" />
                        </div>
                        Freelancer Tools
                    </h1>
                    <p className="text-slate-400 text-lg">Manage taxes, invoices, and gig finances</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: GST Calculator */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-blue-400">🇮🇳</span> GST Toolkit
                    </h2>
                    <GSTCalculator />
                </section>

                {/* Right Column: Placeholder for Invoices (Coming Soon) */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Icon icon="calendar" size={20} className="text-emerald-400" />
                        Recent Invoices
                    </h2>
                    <div className="glass-card rounded-2xl border border-white/10 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                            <Icon icon="briefcase" size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Invoice Generator Coming Soon</h3>
                        <p className="text-slate-400 max-w-xs mx-auto">
                            Create professional invoices, track payments, and export as PDF directly from Stash.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FreelancerTools;
