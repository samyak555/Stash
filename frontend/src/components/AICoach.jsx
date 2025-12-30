import { useState } from 'react';
import { DashboardIcon } from './Icons';

const AICoach = ({ expenses = [], incomes = [] }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [response, setResponse] = useState(null);

  // Predefined questions
  const questions = [
    "How am I doing with my spending?",
    "What's my biggest spending category?",
    "Am I spending too much?",
    "How can I save more money?",
    "What's my spending trend?",
    "Should I be worried about my expenses?",
    "How does my spending compare to my income?",
    "What's one thing I should focus on?"
  ];

  // Calculate financial metrics
  const calculateMetrics = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const cat = expense.category || 'Others';
      acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount || 0);
      return acc;
    }, {});

    const categoryData = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryData[0];

    // Average daily spending
    const daysWithExpenses = new Set(expenses.map(e => new Date(e.date).toDateString())).size;
    const avgDailySpending = daysWithExpenses > 0 ? (totalExpenses / daysWithExpenses) : 0;

    // Weekly comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= oneWeekAgo && expenseDate < today;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const lastWeekExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= twoWeeksAgo && expenseDate < oneWeekAgo;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    return {
      totalExpenses,
      totalIncome,
      balance,
      savingsRate,
      topCategory,
      avgDailySpending,
      thisWeekExpenses,
      lastWeekExpenses,
      categoryData
    };
  };

  // Generate coaching response based on question
  const generateResponse = (question) => {
    const metrics = calculateMetrics();

    if (expenses.length === 0) {
      return {
        message: "I'd love to help you understand your finances better! Start by adding some expenses, and I'll be able to provide personalized insights and guidance.",
        tone: "supportive"
      };
    }

    switch (question) {
      case "How am I doing with my spending?":
        if (metrics.savingsRate >= 20) {
          return {
            message: `You're doing great! You're saving ${metrics.savingsRate.toFixed(1)}% of your income, which is excellent. Keep up this healthy financial habit.`,
            tone: "positive"
          };
        } else if (metrics.savingsRate >= 10) {
          return {
            message: `You're on a good track. You're saving ${metrics.savingsRate.toFixed(1)}% of your income. There's room to grow, but you're building a solid foundation.`,
            tone: "encouraging"
          };
        } else if (metrics.balance >= 0) {
          return {
            message: `You're spending within your means, which is a positive sign. Consider setting aside a small amount each month to build your savings gradually.`,
            tone: "supportive"
          };
        } else {
          return {
            message: `I notice you're spending more than you're earning. This is a good time to review your expenses and identify areas where you can cut back. Every small change helps.`,
            tone: "gentle"
          };
        }

      case "What's my biggest spending category?":
        if (metrics.topCategory) {
          const percentage = (metrics.topCategory.amount / metrics.totalExpenses) * 100;
          return {
            message: `Your biggest spending category is ${metrics.topCategory.category}, making up ${percentage.toFixed(1)}% of your total expenses (₹${metrics.topCategory.amount.toFixed(2)}). This is normal, but it's worth reviewing if you want to optimize your spending.`,
            tone: "informative"
          };
        }
        return {
          message: "I don't have enough data to identify your biggest spending category yet. Keep tracking your expenses, and I'll be able to help you understand your spending patterns.",
          tone: "supportive"
        };

      case "Am I spending too much?":
        if (metrics.balance < 0) {
          return {
            message: `You're currently spending more than you earn. This isn't sustainable long-term. Let's work together to identify areas where you can reduce expenses. Remember, small changes add up.`,
            tone: "gentle"
          };
        } else if (metrics.savingsRate < 10) {
          return {
            message: `Your spending is within your income, which is good. However, you're saving less than 10% of your income. Consider setting a savings goal to build financial security over time.`,
            tone: "supportive"
          };
        } else {
          return {
            message: `No, you're not spending too much. You're managing your finances well and saving ${metrics.savingsRate.toFixed(1)}% of your income. Keep maintaining this balance.`,
            tone: "positive"
          };
        }

      case "How can I save more money?":
        if (metrics.topCategory) {
          const topCategoryPercent = (metrics.topCategory.amount / metrics.totalExpenses) * 100;
          if (topCategoryPercent >= 40) {
            return {
              message: `I notice ${metrics.topCategory.category} takes up ${topCategoryPercent.toFixed(0)}% of your spending. Consider setting a monthly limit for this category. Small reductions here can significantly boost your savings.`,
              tone: "coaching"
            };
          }
        }
        if (metrics.avgDailySpending > 0) {
          return {
            message: `Your average daily spending is ₹${metrics.avgDailySpending.toFixed(2)}. Try setting a daily spending limit that's 10-15% lower. Track your progress weekly, and you'll see your savings grow.`,
            tone: "coaching"
          };
        }
        return {
          message: "Start by reviewing your expenses weekly. Identify one category where you can reduce spending by even 10%. Small, consistent changes are more sustainable than drastic cuts.",
          tone: "coaching"
        };

      case "What's my spending trend?":
        if (metrics.lastWeekExpenses > 0 && metrics.thisWeekExpenses > 0) {
          const change = ((metrics.thisWeekExpenses - metrics.lastWeekExpenses) / metrics.lastWeekExpenses) * 100;
          if (Math.abs(change) < 5) {
            return {
              message: `Your spending has been relatively stable. This week you spent ₹${metrics.thisWeekExpenses.toFixed(2)}, which is similar to last week. Consistency is a good foundation for financial planning.`,
              tone: "positive"
            };
          } else if (change > 0) {
            return {
              message: `Your spending increased by ${change.toFixed(0)}% this week compared to last week. This might be due to one-time expenses. Review your transactions to understand what changed.`,
              tone: "neutral"
            };
          } else {
            return {
              message: `Great news! Your spending decreased by ${Math.abs(change).toFixed(0)}% this week. You're moving in the right direction. Keep this momentum going.`,
              tone: "positive"
            };
          }
        }
        return {
          message: "I need a bit more data to show you spending trends. Keep tracking your expenses for a couple of weeks, and I'll be able to identify patterns and trends.",
          tone: "supportive"
        };

      case "Should I be worried about my expenses?":
        if (metrics.balance < 0) {
          return {
            message: `You're spending more than you earn, which needs attention. But don't worry - awareness is the first step. Let's work together to create a plan. Start by identifying your essential expenses versus discretionary ones.`,
            tone: "calm"
          };
        } else if (metrics.savingsRate < 5) {
          return {
            message: `You're not in a crisis, but building a savings buffer would give you more financial security. Aim to save at least 10% of your income. Start small and increase gradually.`,
            tone: "supportive"
          };
        } else {
          return {
            message: `No need to worry. You're managing your finances responsibly. You're saving ${metrics.savingsRate.toFixed(1)}% of your income, which shows good financial discipline. Keep it up!`,
            tone: "reassuring"
          };
        }

      case "How does my spending compare to my income?":
        if (metrics.totalIncome === 0) {
          return {
            message: "I don't see any income data yet. Add your income sources so I can give you a complete picture of your financial health.",
            tone: "supportive"
          };
        }
        const expenseRatio = (metrics.totalExpenses / metrics.totalIncome) * 100;
        if (expenseRatio <= 70) {
          return {
            message: `Excellent! You're spending only ${expenseRatio.toFixed(0)}% of your income, which means you're saving ${(100 - expenseRatio).toFixed(0)}%. This is a strong financial position.`,
            tone: "positive"
          };
        } else if (expenseRatio <= 90) {
          return {
            message: `You're spending ${expenseRatio.toFixed(0)}% of your income. You have some savings, which is good. Consider increasing your savings rate gradually for better financial security.`,
            tone: "encouraging"
          };
        } else if (expenseRatio <= 100) {
          return {
            message: `You're spending ${expenseRatio.toFixed(0)}% of your income, leaving little room for savings. Try to reduce expenses by 10-15% to build a financial cushion.`,
            tone: "supportive"
          };
        } else {
          return {
            message: `You're spending ${expenseRatio.toFixed(0)}% of your income, which means you're using more than you earn. Let's work on bringing this down. Review your expenses and prioritize what's truly essential.`,
            tone: "gentle"
          };
        }

      case "What's one thing I should focus on?":
        if (metrics.balance < 0) {
          return {
            message: `Focus on bringing your spending in line with your income. Start by tracking every expense for a week - awareness often leads to better decisions naturally.`,
            tone: "coaching"
          };
        } else if (metrics.topCategory && (metrics.topCategory.amount / metrics.totalExpenses) >= 0.4) {
          return {
            message: `Focus on ${metrics.topCategory.category} spending. It's your largest category. Set a monthly budget for it and track your progress. Small adjustments here will have the biggest impact.`,
            tone: "coaching"
          };
        } else if (metrics.savingsRate < 10) {
          return {
            message: `Focus on building your savings habit. Set a goal to save at least 10% of your income. Start with whatever amount feels comfortable, then increase it gradually each month.`,
            tone: "coaching"
          };
        } else {
          return {
            message: `You're doing well! Focus on maintaining your current financial habits. Consider setting a savings goal to give your money a purpose and keep you motivated.`,
            tone: "positive"
          };
        }

      default:
        return {
          message: "I'm here to help you understand your finances better. Choose a question above to get started.",
          tone: "supportive"
        };
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    const coachResponse = generateResponse(question);
    setResponse(coachResponse);
  };

  return (
    <div className="glass-card rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <DashboardIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Coach</h2>
          <p className="text-sm text-slate-400 font-normal mt-1">Ask me anything about your finances</p>
        </div>
      </div>

      {/* Response Display */}
      {response && (
        <div className={`mb-6 p-6 rounded-xl border ${
          response.tone === 'positive' ? 'bg-green-500/10 border-green-500/20' :
          response.tone === 'encouraging' ? 'bg-blue-500/10 border-blue-500/20' :
          response.tone === 'gentle' ? 'bg-yellow-500/10 border-yellow-500/20' :
          response.tone === 'calm' ? 'bg-cyan-500/10 border-cyan-500/20' :
          'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-lg">💬</span>
            </div>
            <div className="flex-1">
              <p className="text-slate-200 text-base font-normal leading-relaxed">
                {response.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Buttons */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400 font-medium mb-4">Choose a question:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(question)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedQuestion === question
                  ? 'bg-purple-500/20 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/8 hover:border-purple-500/30'
              }`}
            >
              <span className="text-sm font-normal">{question}</span>
            </button>
          ))}
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-400 text-center">
            💡 Add some expenses to get personalized coaching insights
          </p>
        </div>
      )}
    </div>
  );
};

export default AICoach;

