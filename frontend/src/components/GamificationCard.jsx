import { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';

const GamificationCard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await gamificationAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            const response = await gamificationAPI.checkIn();
            if (response.data) {
                setShowConfetti(true);
                fetchStats();
                setTimeout(() => setShowConfetti(false), 3000);
            }
        } catch (error) {
            console.error('Check-in failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-2xl border border-white/10 animate-pulse">
                <div className="h-24 bg-white/5 rounded-xl"></div>
            </div>
        );
    }

    const levelProgress = stats?.pointsForNextLevel
        ? ((stats.points % 1000) / 1000) * 100
        : 0;

    return (
        <div className="relative">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${2 + Math.random()}s`,
                            }}
                        >
                            {['🎉', '⭐', '💎', '🔥', '✨'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10">
                {/* Header with Level */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                                <span className="text-2xl font-bold text-white">{stats?.level || 1}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                ⭐
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Level {stats?.level || 1}</h3>
                            <p className="text-sm text-slate-400">{stats?.points || 0} points</p>
                        </div>
                    </div>

                    {/* Check-in Button */}
                    <button
                        onClick={handleCheckIn}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="flex items-center gap-2">
                            <span>🔥</span>
                            <span>Check In</span>
                        </span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Progress to Level {(stats?.level || 1) + 1}</span>
                        <span>{stats?.pointsForNextLevel || 0} pts needed</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                </div>

                {/* Streak Counter */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Current Streak</p>
                            <p className="text-xl font-bold text-white">{stats?.currentStreak || 0} days</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Best Streak</p>
                        <p className="text-lg font-semibold text-slate-300">{stats?.longestStreak || 0} days</p>
                    </div>
                </div>

                {/* Badges Preview */}
                {stats?.badges && stats.badges.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm text-slate-400 mb-3">Recent Badges</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {stats.badges.slice(0, 5).map((badge, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer"
                                    title={badge.name}
                                >
                                    {badge.name?.charAt(0) || '🏆'}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamificationCard;
