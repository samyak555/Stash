import { DashboardIcon } from './Icons';

const StashScore = ({ expenses = [], incomes = [] }) => {
  // Calculate Stash Score (0-100)
  const calculateStashScore = () => {
    if (expenses.length === 0) {
      return {
        score: 50,
        explanation: "Start tracking expenses to get your personalized Stash Score"
      };
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    let score = 50; // Base score

    // Factor 1: Savings Rate (0-40 points)
    if (savingsRate >= 30) {
      score += 40;
    } else if (savingsRate >= 20) {
      score += 30;
    } else if (savingsRate >= 10) {
      score += 20;
    } else if (savingsRate >= 0) {
      score += 10;
    } else {
      score -= 20; // Negative savings
    }

    // Factor 2: Spending Consistency (0-30 points)
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

    if (lastWeekExpenses > 0) {
      const changePercent = Math.abs(((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100);
      if (changePercent < 10) {
        score += 30; // Very consistent
      } else if (changePercent < 20) {
        score += 20; // Consistent
      } else if (changePercent < 30) {
        score += 10; // Somewhat consistent
      }
      // Large variations don't add points
    }

    // Factor 3: No Spending Spikes (0-20 points)
    const daysWithExpenses = new Set(expenses.map(e => new Date(e.date).toDateString())).size;
    const avgDailySpending = daysWithExpenses > 0 ? (totalExpenses / daysWithExpenses) : 0;
    
    // Check for spikes (days with spending > 2x average)
    const dailySpending = {};
    expenses.forEach(expense => {
      const dateStr = new Date(expense.date).toDateString();
      dailySpending[dateStr] = (dailySpending[dateStr] || 0) + parseFloat(expense.amount || 0);
    });

    const spikeDays = Object.values(dailySpending).filter(amount => amount > avgDailySpending * 2).length;
    const totalDays = Object.keys(dailySpending).length;
    
    if (totalDays > 0) {
      const spikeRatio = spikeDays / totalDays;
      if (spikeRatio < 0.1) {
        score += 20; // Very few spikes
      } else if (spikeRatio < 0.2) {
        score += 10; // Some spikes
      }
      // Many spikes don't add points
    }

    // Factor 4: Positive Balance (0-10 points)
    if (balance > 0) {
      score += 10;
    } else if (balance < 0) {
      score -= 10;
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Generate explanation
    let explanation = "";
    if (score >= 80) {
      explanation = "Excellent! You're managing your finances very well with consistent spending and good savings.";
    } else if (score >= 60) {
      explanation = "Good job! You're on the right track with your financial habits.";
    } else if (score >= 40) {
      explanation = "You're making progress. Focus on building consistent spending habits.";
    } else {
      explanation = "There's room for improvement. Start by tracking expenses regularly and building savings.";
    }

    // Calculate previous period score for comparison
    let previousScore = null;
    if (lastWeekExpenses > 0 && expenses.length > 0) {
      // Simplified previous score calculation
      const previousBalance = totalIncome - (totalExpenses - thisWeekExpenses + lastWeekExpenses);
      const previousSavingsRate = totalIncome > 0 ? ((previousBalance / totalIncome) * 100) : 0;
      
      let prevScore = 50;
      if (previousSavingsRate >= 30) prevScore += 40;
      else if (previousSavingsRate >= 20) prevScore += 30;
      else if (previousSavingsRate >= 10) prevScore += 20;
      else if (previousSavingsRate >= 0) prevScore += 10;
      else prevScore -= 20;

      if (previousBalance > 0) prevScore += 10;
      else if (previousBalance < 0) prevScore -= 10;

      previousScore = Math.max(0, Math.min(100, Math.round(prevScore)));
    }

    return { score, explanation, previousScore };
  };

  const { score, explanation, previousScore } = calculateStashScore();
  const scoreChange = previousScore !== null ? score - previousScore : null;

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = () => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/20';
    if (score >= 60) return 'from-blue-500/20 to-cyan-500/20';
    if (score >= 40) return 'from-yellow-500/20 to-amber-500/20';
    return 'from-orange-500/20 to-red-500/20';
  };

  return (
    <div className={`glass-card rounded-2xl p-8 border border-white/10 bg-gradient-to-br ${getScoreBgColor()}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <DashboardIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Stash Score</h2>
          <p className="text-sm text-slate-400 font-normal mt-1">Your financial health at a glance</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <span className={`text-6xl font-bold ${getScoreColor()}`}>{score}</span>
          <span className="text-2xl text-slate-400 font-normal">/ 100</span>
        </div>
        {scoreChange !== null && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            scoreChange > 0 ? 'bg-green-500/20 text-green-400' : 
            scoreChange < 0 ? 'bg-red-500/20 text-red-400' : 
            'bg-slate-500/20 text-slate-400'
          }`}>
            {scoreChange > 0 ? '↑' : scoreChange < 0 ? '↓' : '→'}
            <span className="text-sm font-medium">{Math.abs(scoreChange)}</span>
          </div>
        )}
      </div>

      <p className="text-base text-slate-200 font-normal leading-relaxed mb-4">
        {explanation}
      </p>

      {previousScore !== null && (
        <p className="text-sm text-slate-400 font-normal">
          {scoreChange > 0 ? 'Improved' : scoreChange < 0 ? 'Decreased' : 'Stable'} from last week
        </p>
      )}
    </div>
  );
};

export default StashScore;

