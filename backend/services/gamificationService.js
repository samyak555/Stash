/**
 * GAMIFICATION SERVICE
 * Handles points, badges, levels, streaks, and challenges
 */

import User from '../models/User.js';

// Points configuration
export const POINTS = {
    DAILY_LOGIN: 10,
    ADD_EXPENSE: 5,
    ADD_INCOME: 5,
    COMPLETE_GOAL: 100,
    REACH_BUDGET: 50,
    WEEK_STREAK: 100,
    MONTH_STREAK: 500,
    LEARN_LESSON: 25,
    INVITE_FRIEND: 50,
    ADD_INVESTMENT: 10,
    COMPLETE_CHALLENGE: 75,
};

// Level thresholds
const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500,  // Levels 1-10
    11000, 14000, 17500, 21500, 26000, 31000, 36500, 42500, 49000, 56000, // Levels 11-20
    64000, 72500, 81500, 91000, 101000, 111500, 122500, 134000, 146000, 158500, // Levels 21-30
    171500, 185000, 199000, 213500, 228500, 244000, 260000, 276500, 293500, 311000, // Levels 31-40
    329000, 347500, 366500, 386000, 406000, 426500, 447500, 469000, 491000, 513500, // Levels 41-50
];

// Badge definitions
export const BADGES = {
    STREAK_7: { id: 'streak_7', name: '🔥 Week Warrior', description: '7 days streak' },
    STREAK_30: { id: 'streak_30', name: '🔥 Month Master', description: '30 days streak' },
    STREAK_100: { id: 'streak_100', name: '🔥 Century Champion', description: '100 days streak' },

    BUDGET_3: { id: 'budget_3', name: '💎 Budget Boss', description: 'Stay under budget 3 months' },
    BUDGET_6: { id: 'budget_6', name: '💎 Budget King', description: 'Stay under budget 6 months' },

    GOAL_1: { id: 'goal_1', name: '🎯 First Goal', description: 'Complete first goal' },
    GOAL_5: { id: 'goal_5', name: '🎯 Goal Getter', description: 'Complete 5 goals' },
    GOAL_10: { id: 'goal_10', name: '🎯 Goal Master', description: 'Complete 10 goals' },

    LESSON_1: { id: 'lesson_1', name: '📚 Student', description: 'Complete first lesson' },
    LESSON_10: { id: 'lesson_10', name: '📚 Scholar', description: 'Complete 10 lessons' },
    LESSON_ALL: { id: 'lesson_all', name: '📚 Finance Guru', description: 'Complete all lessons' },

    INVITE_1: { id: 'invite_1', name: '🤝 Friendly', description: 'Invite 1 friend' },
    INVITE_10: { id: 'invite_10', name: '🤝 Community Leader', description: 'Invite 10 friends' },

    SAVER_50: { id: 'saver_50', name: '💰 Saver', description: 'Save 50% of income' },
    SAVER_70: { id: 'saver_70', name: '💰 Super Saver', description: 'Save 70% of income' },

    INVESTOR_5: { id: 'investor_5', name: '📊 Investor', description: 'Hold 5+ investments' },
    INVESTOR_20: { id: 'investor_20', name: '📊 Portfolio Master', description: 'Hold 20+ investments' },

    LEVEL_10: { id: 'level_10', name: '⭐ Rising Star', description: 'Reach level 10' },
    LEVEL_25: { id: 'level_25', name: '⭐ Shining Star', description: 'Reach level 25' },
    LEVEL_50: { id: 'level_50', name: '⭐ Super Star', description: 'Reach level 50' },
};

/**
 * Calculate level from points
 */
export const calculateLevel = (points) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (points >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
};

/**
 * Get points needed for next level
 */
export const getPointsForNextLevel = (currentPoints) => {
    const currentLevel = calculateLevel(currentPoints);
    if (currentLevel >= 50) return 0; // Max level
    return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
};

/**
 * Award points to user
 */
export const awardPoints = async (userId, points, reason) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const oldPoints = user.points || 0;
        const newPoints = oldPoints + points;
        const oldLevel = user.level || 1;
        const newLevel = calculateLevel(newPoints);

        user.points = newPoints;
        user.level = newLevel;

        // Award level-up badges
        if (newLevel > oldLevel) {
            if (newLevel === 10 && !user.badges.some(b => b.id === 'level_10')) {
                user.badges.push({ id: 'level_10', name: BADGES.LEVEL_10.name });
            }
            if (newLevel === 25 && !user.badges.some(b => b.id === 'level_25')) {
                user.badges.push({ id: 'level_25', name: BADGES.LEVEL_25.name });
            }
            if (newLevel === 50 && !user.badges.some(b => b.id === 'level_50')) {
                user.badges.push({ id: 'level_50', name: BADGES.LEVEL_50.name });
            }
        }

        await user.save();

        return {
            success: true,
            pointsAwarded: points,
            reason,
            newPoints,
            newLevel,
            leveledUp: newLevel > oldLevel,
        };
    } catch (error) {
        console.error('Award points error:', error);
        return null;
    }
};

/**
 * Award badge to user
 */
export const awardBadge = async (userId, badgeId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const badge = BADGES[badgeId.toUpperCase()];
        if (!badge) return null;

        // Check if already has badge
        if (user.badges.some(b => b.id === badge.id)) {
            return { success: false, message: 'Badge already earned' };
        }

        user.badges.push({
            id: badge.id,
            name: badge.name,
            earnedAt: new Date(),
        });

        await user.save();

        return {
            success: true,
            badge: badge,
        };
    } catch (error) {
        console.error('Award badge error:', error);
        return null;
    }
};

/**
 * Update user streak
 */
export const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const now = new Date();
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

        // Check if last active was yesterday
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        let streakContinues = false;

        if (lastActive) {
            // Same day - no change
            if (lastActive.toDateString() === now.toDateString()) {
                return { success: true, streak: user.currentStreak, streakContinues: true };
            }

            // Yesterday - continue streak
            if (lastActive.toDateString() === oneDayAgo.toDateString()) {
                streakContinues = true;
            }
        }

        if (streakContinues || !lastActive) {
            user.currentStreak = (user.currentStreak || 0) + 1;

            // Award streak badges
            if (user.currentStreak === 7 && !user.badges.some(b => b.id === 'streak_7')) {
                user.badges.push({ id: 'streak_7', name: BADGES.STREAK_7.name });
                await awardPoints(userId, POINTS.WEEK_STREAK, 'Week streak');
            }
            if (user.currentStreak === 30 && !user.badges.some(b => b.id === 'streak_30')) {
                user.badges.push({ id: 'streak_30', name: BADGES.STREAK_30.name });
                await awardPoints(userId, POINTS.MONTH_STREAK, 'Month streak');
            }
            if (user.currentStreak === 100 && !user.badges.some(b => b.id === 'streak_100')) {
                user.badges.push({ id: 'streak_100', name: BADGES.STREAK_100.name });
            }

            // Update longest streak
            if (user.currentStreak > (user.longestStreak || 0)) {
                user.longestStreak = user.currentStreak;
            }
        } else {
            // Streak broken
            user.currentStreak = 1;
        }

        user.lastActiveDate = now;
        await user.save();

        return {
            success: true,
            streak: user.currentStreak,
            longestStreak: user.longestStreak,
            streakContinues,
        };
    } catch (error) {
        console.error('Update streak error:', error);
        return null;
    }
};

/**
 * Get user gamification stats
 */
export const getGamificationStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const currentLevel = user.level || 1;
        const currentPoints = user.points || 0;
        const pointsForNextLevel = getPointsForNextLevel(currentPoints);

        return {
            points: currentPoints,
            level: currentLevel,
            pointsForNextLevel,
            badges: user.badges || [],
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0,
        };
    } catch (error) {
        console.error('Get gamification stats error:', error);
        return null;
    }
};
