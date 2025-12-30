import { useState } from 'react';
import { DashboardIcon } from './Icons';

const GuidedCoach = ({ expenses = [], incomes = [], stashScore = 50 }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [response, setResponse] = useState(null);

  const questions = [
    "Why did I overspend?",
    "Am I doing okay this month?",
    "How can I improve next week?"
  ];

  const generateResponse = (question) => {
    if (expenses.length === 0) {
      return {
        message: "Start tracking your expenses to get personalized coaching insights. Add a few expenses and come back!",
        tone: "supportive"
      };
    }

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

    // Monthly comparison
    const currentMonthExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const lastMonthExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    switch (question) {
      case "Why did I overspend?":
        if (balance < 0) {
          if (topCategory && (topCategory.amount / totalExpenses) >= 0.4) {
            return {
              message: `You overspent mainly because ${topCategory.category} expenses make up ${((topCategory.amount / totalExpenses) * 100).toFixed(0)}% of your spending. Consider setting a monthly limit for this category to stay within your budget.`,
              tone: "coaching"
            };
          } else if (thisWeekExpenses > lastWeekExpenses && lastWeekExpenses > 0) {
            const increase = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;
            return {
              message: `Your spending increased by ${increase.toFixed(0)}% this week compared to last week. Review your recent transactions to identify what changed. Small adjustments can help you get back on track.`,
              tone: "coaching"
            };
          } else {
            return {
              message: `You're spending more than you earn. Your Stash Score is ${stashScore}, which suggests there's room for improvement. Start by tracking every expense and identifying non-essential spending.`,
              tone: "gentle"
            };
          }
        } else {
          return {
            message: `Actually, you're not overspending! You have a positive balance and your Stash Score is ${stashScore}. You're managing your finances well. Keep up the good work!`,
            tone: "positive"
          };
        }

      case "Am I doing okay this month?":
        if (stashScore >= 70) {
          return {
            message: `Yes, you're doing great! Your Stash Score is ${stashScore}, which shows you're managing your finances well. ${savingsRate > 0 ? `You're saving ${savingsRate.toFixed(1)}% of your income.` : 'Keep maintaining this balance.'}`,
            tone: "positive"
          };
        } else if (stashScore >= 50) {
          if (currentMonthExpenses > 0 && lastMonthExpenses > 0) {
            const change = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
            if (change < 0) {
              return {
                message: `You're doing well! Your Stash Score is ${stashScore} and you've reduced spending by ${Math.abs(change).toFixed(0)}% compared to last month. Keep this momentum going.`,
                tone: "encouraging"
              };
            } else {
              return {
                message: `You're doing okay. Your Stash Score is ${stashScore}. Your spending is ${change.toFixed(0)}% higher than last month. Focus on consistency to improve your score.`,
                tone: "supportive"
              };
            }
          }
          return {
            message: `You're doing okay. Your Stash Score is ${stashScore}. There's room for improvement, but you're on the right track. Focus on building consistent spending habits.`,
            tone: "supportive"
          };
        } else {
          const balanceMessage = balance < 0 ? 'You\'re spending more than you earn.' : 'Focus on building savings and reducing unnecessary expenses.';
          return {
            message: `Your Stash Score is ${stashScore}, which suggests there's room for improvement. ${balanceMessage} Start small and track your progress.`,
            tone: "gentle"
          };
        }

      case "How can I improve next week?":
        if (topCategory && (topCategory.amount / totalExpenses) >= 0.35) {
          return {
            message: `Focus on ${topCategory.category} spending next week. It's your largest category at ${((topCategory.amount / totalExpenses) * 100).toFixed(0)}% of total expenses. Try reducing it by 10-15% to see a meaningful impact on your Stash Score.`,
            tone: "coaching"
          };
        } else if (thisWeekExpenses > 0 && lastWeekExpenses > 0 && thisWeekExpenses > lastWeekExpenses) {
          const increase = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;
          return {
            message: `Your spending increased by ${increase.toFixed(0)}% this week. Next week, aim to spend 10% less than this week. Set a daily spending limit and track your progress. Small, consistent changes work best.`,
            tone: "coaching"
          };
        } else if (savingsRate < 10) {
          return {
            message: `Your savings rate is ${savingsRate.toFixed(1)}%. Next week, try to save at least 10% of your income. Start by identifying one category where you can cut back by ₹500-1000. Every bit helps.`,
            tone: "coaching"
          };
        } else {
          return {
            message: `You're already doing well with a Stash Score of ${stashScore}! To improve further, maintain consistency in your spending. Try to keep next week's expenses within 5% of this week's total.`,
            tone: "positive"
          };
        }

      default:
        return {
          message: "Choose a question above to get personalized coaching advice.",
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Guided Coach</h2>
          <p className="text-sm text-slate-400 font-normal mt-1">Get personalized financial guidance</p>
        </div>
      </div>

      {/* Response Display */}
      {response && (
        <div className={`mb-6 p-6 rounded-xl border ${
          response.tone === 'positive' ? 'bg-green-500/10 border-green-500/20' :
          response.tone === 'encouraging' ? 'bg-blue-500/10 border-blue-500/20' :
          response.tone === 'gentle' ? 'bg-yellow-500/10 border-yellow-500/20' :
          response.tone === 'coaching' ? 'bg-cyan-500/10 border-cyan-500/20' :
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
        <p className="text-sm text-slate-400 font-medium mb-4">Ask a question:</p>
        <div className="grid grid-cols-1 gap-3">
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
    </div>
  );
};

export default GuidedCoach;

