import { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';
import Icon from './ui/Icons';
import Button from './ui/Button';

const GamificationCard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

    useEffect(() => {
        const initGamification = async () => {
            try {
                setCheckingIn(true);
                // Attempt automatic check-in
                const checkInResponse = await gamificationAPI.checkIn();

                // Show toast only if points were actually awarded (first time today)
                if (checkInResponse?.data?.pointsAwarded > 0) {
                    toast.success(`Daily Streak! +${checkInResponse.data.pointsAwarded} XP 🔥`);
                }

                // Fetch latest full stats
                const statsResponse = await gamificationAPI.getStats();
                setStats(statsResponse.data);
            } catch (error) {
                console.error('Gamification sync failed:', error);
                // Fallback to just fetching stats if check-in fails
                fetchStats();
            } finally {
                setLoading(false);
                setCheckingIn(false);
            }
        };

        initGamification();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await gamificationAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-48 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse" />
        );
    }

    // Calculate progress
    const currentPoints = stats?.points || 0;
    const nextLevelPoints = (stats?.pointsForNextLevel || 0) + currentPoints;
    const progressPercent = nextLevelPoints > 0
        ? (currentPoints / nextLevelPoints) * 100
        : 0;

    // Safe progress for visual bar (clamped)
    const visualProgress = Math.min(Math.max(progressPercent, 5), 100);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0F1218] p-6 shadow-xl transition-all hover:border-white/10">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl transition-opacity group-hover:opacity-75" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl transition-opacity group-hover:opacity-75" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* Left Section: Level & Status */}
                <div className="flex items-start gap-5">
                    {/* Level Ring */}
                    <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner ring-1 ring-white/10">
                        <Icon icon="trophy" size={24} className="text-blue-400" />
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow ring-2 ring-[#0F1218]">
                            {stats?.level || 1}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">Current Level</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-light text-white tracking-tight">
                                {currentPoints.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-slate-500">XP</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2 w-full max-w-[200px] space-y-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${visualProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                <span className="text-slate-300 font-medium">{stats?.pointsForNextLevel || 0} XP</span> to next level
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Streak & Action */}
                <div className="flex flex-1 items-center justify-end gap-6 md:gap-12 pl-4 md:border-l md:border-white/5">
                    {/* Streak Stat */}
                    <div className="hidden sm:block text-right">
                        <div className="mb-1 flex items-center justify-end gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                            <Icon icon="flame" size={14} className={stats?.currentStreak > 0 ? "text-orange-500" : "text-slate-600"} />
                            Streak
                        </div>
                        <div className="text-2xl font-semibold text-white">
                            {stats?.currentStreak || 0} <span className="text-sm font-normal text-slate-500">days</span>
                        </div>
                    </div>

                    {/* Badges Preview (Mini) */}
                    <div className="hidden lg:flex items-center gap-2">
                        {(stats?.badges || []).slice(0, 3).map((badge, idx) => (
                            <div key={idx} className="group/tooltip relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 ring-1 ring-white/10 transition-transform hover:scale-110 hover:bg-slate-800 hover:ring-white/20">
                                <Icon icon="award" size={16} className="text-purple-400" />
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100 shadow-lg border border-white/5">
                                    {badge.name}
                                </div>
                            </div>
                        ))}
                        {(stats?.badges || []).length === 0 && (
                            <div className="h-10 w-10 rounded-full border border-dashed border-slate-700 bg-transparent" />
                        )}
                    </div>

                    {/* Status Indicator (Renamed from Button) */}
                    <div className="min-w-[140px] flex justify-end">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                            <Icon icon="check" size={16} />
                            <span>Streak Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationCard;
