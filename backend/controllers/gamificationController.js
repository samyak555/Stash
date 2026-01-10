import {
    getGamificationStats,
    awardPoints,
    awardBadge,
    updateStreak,
    BADGES,
    POINTS,
} from '../services/gamificationService.js';

/**
 * Get user's gamification stats
 */
export const getStats = async (req, res) => {
    try {
        const stats = await getGamificationStats(req.userId);
        if (!stats) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(stats);
    } catch (error) {
        console.error('Get gamification stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Award points manually (admin or system)
 */
export const givePoints = async (req, res) => {
    try {
        const { points, reason } = req.body;
        const result = await awardPoints(req.userId, points, reason);
        if (!result) {
            return res.status(404).json({ message: 'Failed to award points' });
        }
        res.json(result);
    } catch (error) {
        console.error('Give points error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Award badge manually
 */
export const giveBadge = async (req, res) => {
    try {
        const { badgeId } = req.body;
        const result = await awardBadge(req.userId, badgeId);
        if (!result) {
            return res.status(404).json({ message: 'Failed to award badge' });
        }
        res.json(result);
    } catch (error) {
        console.error('Give badge error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update daily streak
 */
export const checkIn = async (req, res) => {
    try {
        const streakResult = await updateStreak(req.userId);
        if (!streakResult) {
            return res.status(404).json({ message: 'Failed to update streak' });
        }

        // Award daily login points
        const pointsResult = await awardPoints(req.userId, POINTS.DAILY_LOGIN, 'Daily check-in');

        res.json({
            ...streakResult,
            pointsAwarded: pointsResult?.pointsAwarded || 0,
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all available badges
 */
export const getAllBadges = async (req, res) => {
    try {
        res.json(Object.values(BADGES));
    } catch (error) {
        console.error('Get all badges error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get leaderboard (top users by points)
 */
export const getLeaderboard = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const { limit = 100 } = req.query;

        const topUsers = await User.find()
            .select('name points level badges currentStreak')
            .sort({ points: -1 })
            .limit(parseInt(limit));

        res.json(topUsers);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: error.message });
    }
};
