# Expense Logic Documentation

This document explains all the logic, calculations, and algorithms used for expense analysis throughout the application.

## Table of Contents
1. [Expense Data Structure](#expense-data-structure)
2. [Financial Metrics Calculations](#financial-metrics-calculations)
3. [Insights Generation Logic](#insights-generation-logic)
4. [AI Coach Response Logic](#ai-coach-response-logic)
5. [Category Analysis](#category-analysis)
6. [Time-Based Analysis](#time-based-analysis)
7. [Trend Calculations](#trend-calculations)

---

## Expense Data Structure

### Basic Expense Object
```javascript
{
  _id: string,           // Unique identifier
  user: string,           // User ID
  amount: number,        // Expense amount
  category: string,       // Expense category (Food, Travel, etc.)
  date: string,          // ISO date string
  description: string,   // Optional description
  createdAt: string,     // Creation timestamp
  updatedAt: string      // Last update timestamp
}
```

### Categories
Default categories: Food, Travel, Movie, Clothes, Shopping, Others

---

## Financial Metrics Calculations

### 1. Total Expenses
```javascript
totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
```
- Sums all expense amounts
- Handles missing/null amounts by defaulting to 0

### 2. Total Income
```javascript
totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)
```
- Sums all income amounts
- Similar null-safety handling

### 3. Balance
```javascript
balance = totalIncome - totalExpenses
```
- Positive: User has savings
- Negative: User is spending more than earning

### 4. Savings Rate
```javascript
savingsRate = totalIncome > 0 
  ? ((balance / totalIncome) * 100).toFixed(1) 
  : 0
```
- Percentage of income saved
- Only calculated if income > 0
- Formula: (Balance / Total Income) × 100

### 5. Average Daily Spending
```javascript
daysWithExpenses = new Set(expenses.map(e => new Date(e.date).toDateString())).size
avgDailySpending = daysWithExpenses > 0 
  ? (totalExpenses / daysWithExpenses).toFixed(2) 
  : 0
```
- Calculates unique days with expenses
- Divides total expenses by number of days
- Uses Set to count unique dates

### 6. Spending Velocity
```javascript
firstExpense = expenses.length > 0 
  ? new Date(Math.min(...expenses.map(e => new Date(e.date)))) 
  : new Date()
daysSinceFirst = Math.max(1, Math.ceil((new Date() - firstExpense) / (1000 * 60 * 60 * 24)))
spendingVelocity = (totalExpenses / daysSinceFirst).toFixed(2)
```
- Calculates expenses per day since first expense
- Uses milliseconds to days conversion: (ms) / (1000 × 60 × 60 × 24)
- Minimum 1 day to avoid division by zero

---

## Category Analysis

### Category Breakdown
```javascript
categoryBreakdown = expenses.reduce((acc, expense) => {
  const cat = expense.category || 'Others'
  acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount || 0)
  return acc
}, {})
```
- Groups expenses by category
- Defaults to 'Others' if category is missing
- Accumulates amounts per category

### Category Data Array
```javascript
categoryData = Object.entries(categoryBreakdown)
  .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }))
  .sort((a, b) => b.amount - a.amount)
```
- Converts object to array
- Sorts by amount (descending)
- Rounds to 2 decimal places

### Top Category Percentage
```javascript
topCategoryPercent = (topCategory.amount / totalExpenses) * 100
```
- Calculates what percentage of total spending goes to top category
- Used to identify dominant spending areas

---

## Time-Based Analysis

### Monthly Spending
```javascript
monthlyData = expenses.reduce((acc, expense) => {
  const date = new Date(expense.date)
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' })
  if (!acc[monthKey]) {
    acc[monthKey] = { month: monthLabel, amount: 0, key: monthKey }
  }
  acc[monthKey].amount += parseFloat(expense.amount || 0)
  return acc
}, {})
```
- Groups expenses by month
- Uses YYYY-MM format as key
- Creates readable month labels

### Last 12 Months
```javascript
for (let i = 11; i >= 0; i--) {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  // ... add to array
}
```
- Generates array of last 12 months
- Iterates backwards from current month
- Ensures consistent month ordering

### Weekly Spending
```javascript
weeklyData = expenses.reduce((acc, expense) => {
  const date = new Date(expense.date)
  const week = `Week ${Math.ceil(date.getDate() / 7)}`
  acc[week] = (acc[week] || 0) + parseFloat(expense.amount || 0)
  return acc
}, {})
```
- Groups by week of month
- Week 1: Days 1-7, Week 2: Days 8-14, etc.
- Uses Math.ceil for week calculation

### Daily Spending (Last 30 Days)
```javascript
dailyData = expenses.reduce((acc, expense) => {
  const date = new Date(expense.date)
  const today = new Date()
  const diffTime = Math.abs(today - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 30) {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[dateStr] = (acc[dateStr] || 0) + parseFloat(expense.amount || 0)
  }
  return acc
}, {})
```
- Filters expenses from last 30 days
- Groups by date string
- Calculates day difference using absolute time difference

### Day of Week Analysis
```javascript
dayOfWeekSpending = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } // Sun-Sat
expenses.forEach(expense => {
  const day = new Date(expense.date).getDay()
  dayOfWeekSpending[day] += parseFloat(expense.amount || 0)
})

weekendSpending = dayOfWeekSpending[0] + dayOfWeekSpending[6] // Sun + Sat
weekdaySpending = dayOfWeekSpending[1] + ... + dayOfWeekSpending[5]
weekendPercent = (weekendSpending / totalWeekSpending) * 100
```
- Maps expenses to day of week (0=Sunday, 6=Saturday)
- Calculates weekend vs weekday spending
- Determines spending pattern preference

---

## Insights Generation Logic

### Insight 1: Week-over-Week Comparison
```javascript
thisWeekExpenses = expenses filtered for last 7 days
lastWeekExpenses = expenses filtered for 7-14 days ago
changePercent = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100

if (Math.abs(changePercent) >= 10) {
  // Generate insight about increase/decrease
}
```
- **Threshold**: 10% change triggers insight
- **Comparison**: Current week vs previous week
- **Logic**: Only shows if change is significant (≥10%)

### Insight 2: Top Category Analysis
```javascript
topCategoryPercent = (topCategory.amount / totalExpenses) * 100
if (topCategoryPercent >= 30) {
  // "Most of your spending (X%) is on [Category]"
}
```
- **Threshold**: 30% of total spending
- **Purpose**: Identifies dominant spending category
- **Logic**: Only triggers if category is significant portion

### Insight 3: Day of Week Pattern
```javascript
weekendPercent = (weekendSpending / totalWeekSpending) * 100
if (weekendPercent >= 40) {
  // "Most of your expenses happen on weekends"
} else if (weekendPercent <= 20) {
  // "Most of your expenses happen on weekdays"
}
```
- **Weekend Threshold**: ≥40% of spending
- **Weekday Threshold**: ≤20% of spending
- **Logic**: Identifies clear spending pattern

### Insight 4: Today vs Average
```javascript
todayExpenses = expenses filtered for today
todayVsAvg = (todayExpenses / avgDailySpending) * 100

if (todayVsAvg < 70) {
  // "You spent less than your usual daily average today"
} else if (todayVsAvg > 130) {
  // "You spent more than your usual daily average today"
}
```
- **Low Threshold**: <70% of average
- **High Threshold**: >130% of average
- **Logic**: Compares today's spending to historical average

---

## AI Coach Response Logic

### Question: "How am I doing with my spending?"

**Response Logic:**
```javascript
if (savingsRate >= 20) {
  // "You're doing great! You're saving X%..."
  tone: "positive"
} else if (savingsRate >= 10) {
  // "You're on a good track..."
  tone: "encouraging"
} else if (balance >= 0) {
  // "You're spending within your means..."
  tone: "supportive"
} else {
  // "I notice you're spending more than you're earning..."
  tone: "gentle"
}
```

**Thresholds:**
- Excellent: ≥20% savings rate
- Good: ≥10% savings rate
- Acceptable: Balance ≥ 0
- Needs Attention: Balance < 0

### Question: "What's my biggest spending category?"

**Response Logic:**
```javascript
if (topCategory exists) {
  percentage = (topCategory.amount / totalExpenses) * 100
  // "Your biggest spending category is [Category], making up X%..."
}
```

**Data Used:**
- Sorted category data (highest first)
- Percentage calculation
- Absolute amount

### Question: "Am I spending too much?"

**Response Logic:**
```javascript
if (balance < 0) {
  // "You're currently spending more than you earn..."
  tone: "gentle"
} else if (savingsRate < 10) {
  // "Your spending is within your income, but..."
  tone: "supportive"
} else {
  // "No, you're not spending too much..."
  tone: "positive"
}
```

**Thresholds:**
- Critical: Balance < 0
- Warning: Savings rate < 10%
- Healthy: Savings rate ≥ 10%

### Question: "How can I save more money?"

**Response Logic:**
```javascript
if (topCategoryPercent >= 40) {
  // Focus on reducing top category
} else if (avgDailySpending > 0) {
  // Suggest daily spending limit reduction
} else {
  // General savings advice
}
```

**Strategy:**
1. If one category dominates (≥40%), target that
2. If daily average exists, suggest 10-15% reduction
3. Otherwise, provide general guidance

### Question: "What's my spending trend?"

**Response Logic:**
```javascript
change = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100

if (Math.abs(change) < 5) {
  // "Your spending has been relatively stable..."
  tone: "positive"
} else if (change > 0) {
  // "Your spending increased by X%..."
  tone: "neutral"
} else {
  // "Great news! Your spending decreased..."
  tone: "positive"
}
```

**Thresholds:**
- Stable: <5% change
- Increase: >0%
- Decrease: <0%

### Question: "Should I be worried about my expenses?"

**Response Logic:**
```javascript
if (balance < 0) {
  // "You're spending more than you earn, which needs attention..."
  tone: "calm"
} else if (savingsRate < 5) {
  // "You're not in a crisis, but..."
  tone: "supportive"
} else {
  // "No need to worry..."
  tone: "reassuring"
}
```

**Thresholds:**
- Critical: Balance < 0
- Caution: Savings rate < 5%
- Healthy: Savings rate ≥ 5%

### Question: "How does my spending compare to my income?"

**Response Logic:**
```javascript
expenseRatio = (totalExpenses / totalIncome) * 100

if (expenseRatio <= 70) {
  // "Excellent! You're spending only X%..."
  tone: "positive"
} else if (expenseRatio <= 90) {
  // "You're spending X% of your income..."
  tone: "encouraging"
} else if (expenseRatio <= 100) {
  // "You're spending X% of your income..."
  tone: "supportive"
} else {
  // "You're spending X% of your income..."
  tone: "gentle"
}
```

**Thresholds:**
- Excellent: ≤70% (saving ≥30%)
- Good: ≤90% (saving ≥10%)
- Acceptable: ≤100% (breaking even)
- Critical: >100% (spending more than earning)

### Question: "What's one thing I should focus on?"

**Response Logic:**
```javascript
if (balance < 0) {
  // Focus on bringing spending in line with income
} else if (topCategoryPercent >= 40) {
  // Focus on top category
} else if (savingsRate < 10) {
  // Focus on building savings habit
} else {
  // Focus on maintaining current habits
}
```

**Priority Order:**
1. Negative balance (critical)
2. Dominant category (≥40%)
3. Low savings rate (<10%)
4. Maintenance (all good)

---

## Trend Calculations

### Income vs Expenses Trend
```javascript
incomeExpenseTrend = {}

// Process expenses
expenses.forEach(expense => {
  const monthKey = getMonthKey(expense.date)
  if (!incomeExpenseTrend[monthKey]) {
    incomeExpenseTrend[monthKey] = { income: 0, expenses: 0, month: monthLabel }
  }
  incomeExpenseTrend[monthKey].expenses += parseFloat(expense.amount || 0)
})

// Process incomes
incomes.forEach(income => {
  const monthKey = getMonthKey(income.date)
  if (!incomeExpenseTrend[monthKey]) {
    incomeExpenseTrend[monthKey] = { income: 0, expenses: 0, month: monthLabel }
  }
  incomeExpenseTrend[monthKey].income += parseFloat(income.amount || 0)
})
```
- Combines income and expense data by month
- Creates unified trend visualization
- Handles missing months gracefully

---

## Edge Cases & Safety

### Empty Data Handling
- All calculations check for empty arrays
- Default to 0 or empty strings
- Graceful degradation with helpful messages

### Date Handling
- Uses `new Date()` for parsing
- Handles timezone differences
- Normalizes dates to start of day for comparisons

### Null/Undefined Safety
- Uses `|| 0` for missing amounts
- Uses `|| 'Others'` for missing categories
- Uses `?.` optional chaining where appropriate

### Division by Zero
- Checks denominators before division
- Uses `Math.max(1, value)` for minimum values
- Returns 0 or default when calculation impossible

---

## Performance Considerations

### Data Processing
- Uses `reduce()` for efficient aggregation
- Single-pass algorithms where possible
- Memoizes calculated values when reused

### Date Calculations
- Caches date objects when used multiple times
- Uses Set for unique date counting
- Minimizes date parsing operations

---

## Future Enhancements

### Potential Additions
1. Budget vs Actual comparisons
2. Seasonal spending patterns
3. Predictive spending forecasts
4. Anomaly detection (unusual spending)
5. Category-specific trends
6. Multi-currency support
7. Recurring expense detection

---

## Notes

- All monetary values are in INR (₹)
- Dates use ISO 8601 format
- Percentages rounded to 1 decimal place
- Amounts rounded to 2 decimal places
- Time calculations use UTC internally
- Display uses local timezone

