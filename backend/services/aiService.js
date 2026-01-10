/**
 * ANTI-GRAVITY FINANCIAL INTELLIGENCE ENGINE
 * Rule-based implementation of the Stash AI System Prompt.
 * Acts as a deterministic financial co-pilot.
 */

import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';

// Indian Tax Slabs (FY 2024-25 New Regime)
const TAX_SLABS = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

export const generateInsights = async (userId) => {
    try {
        // 1. Gather Data
        const user = await User.findById(userId);
        const expenses = await Expense.find({ userId });
        const incomes = await Income.find({ userId });

        const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        // 2. Calculate Financial Health Score (0-100)
        let healthScore = 50; // Base
        if (savingsRate > 20) healthScore += 10;
        if (savingsRate > 50) healthScore += 10;
        if (savingsRate < 0) healthScore -= 20;
        if (user.currentStreak > 3) healthScore += 5;
        if (user.currentStreak > 10) healthScore += 5;
        if (!user.badges || user.badges.length === 0) healthScore -= 5;

        // Clamp score
        healthScore = Math.max(0, Math.min(100, healthScore));

        // 3. Generate Insights (The "Brain")
        const insights = [];
        const recommendations = [];

        // Insight 1: Spending vs Income
        if (totalExpense > totalIncome && totalIncome > 0) {
            insights.push(`🚨 Critical: You are spending ${(totalExpense / totalIncome * 100).toFixed(0)}% of your income.`);
            recommendations.push("Review your 'Wants' category immediately. Cut discretionary spending by 10%.");
        } else if (savingsRate > 30) {
            insights.push(`✅ Healthy: You are saving ${savingsRate.toFixed(0)}% of your income.`);
            recommendations.push("Consider investing your surplus in a high-yield mutual fund (Stash Invest).");
        } else {
            insights.push(`⚠️ Tight Margin: You are living paycheck to paycheck.`);
        }

        // Insight 2: Category Analysis
        const categoryMap = {};
        expenses.forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });
        const highestCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

        if (highestCategory) {
            insights.push(`📊 Top Spending: Your detailed analysis shows '${highestCategory[0]}' is your biggest expense (₹${highestCategory[1]}).`);
            if (['Food', 'Shopping', 'Entertainment'].includes(highestCategory[0])) {
                recommendations.push(`Try setting a stricter budget for ${highestCategory[0]} to boost your savings.`);
            }
        }

        // Warning Generation
        let warning = null;
        if (totalExpense > totalIncome) warning = "Warning: Negative cash flow detected.";
        else if (savingsRate < 10) warning = "Warning: Savings rate is dangerously low.";

        // Tax Calculation (Estimated)
        const estimatedTax = calculateTax(totalIncome);

        // Safe to Spend
        // Logic: Income - Tax - Fixed Expenses (Estimate 50%) - Savings Goal (20%)
        const safeToSpend = Math.max(0, totalIncome - estimatedTax - (totalIncome * 0.2));

        return {
            healthScore,
            insights: insights.slice(0, 3),
            recommendations: recommendations.slice(0, 3),
            estimatedTax,
            safeToSpend,
            warning,
            dashboardSummary: `💰 Net Worth Trend: ${savings >= 0 ? 'Positive' : 'Negative'} | Streak: ${user.currentStreak} Days`,
            taxOptimization: "Consider Section 80C investments (ELSS) to reduce taxable income by up to ₹1.5L."
        };

    } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
    }
};

/**
 * Helper: Calculate Tax based on New Regime Slabs
 */
function calculateTax(income) {
    if (income <= 300000) return 0;

    let tax = 0;
    let remainingIncome = income;
    let previousLimit = 0;

    for (const slab of TAX_SLABS) {
        if (remainingIncome <= 0) break;

        const taxableInSlab = Math.min(Math.max(0, slab.limit - previousLimit), remainingIncome);
        // Rate applies to income ABOVE previous limit
        // Wait, logic correction:
        // Slabs are ranges. 
        // 0-3L: 0
        // 3-7L: 5% (Income minus 3L)
        // Correct iterative logic:
    }

    // Simplified calculation for robustness
    let taxPayable = 0;
    if (income > 300000) taxPayable += Math.min(Math.max(0, income - 300000), 400000) * 0.05; // 3-7L
    if (income > 700000) taxPayable += Math.min(Math.max(0, income - 700000), 300000) * 0.10; // 7-10L
    if (income > 1000000) taxPayable += Math.min(Math.max(0, income - 1000000), 200000) * 0.15; // 10-12L
    if (income > 1200000) taxPayable += Math.min(Math.max(0, income - 1200000), 300000) * 0.20; // 12-15L
    if (income > 1500000) taxPayable += (income - 1500000) * 0.30; // >15L

    return taxPayable;
}
