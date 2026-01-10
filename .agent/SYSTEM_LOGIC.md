# Stash System Logic & Architecture

## 1. Gamification & Streak System 🎮

### How Automatic Streaks Work
The streak system is designed to be frictionless, similar to social media apps.

**The Workflow:**
1.  **Trigger**: When the Dashboard loads, the `GamificationCard` component mounts and silently sends a `POST /api/gamification/check-in` request.
2.  **Date Validation (Backend)**:
    *   The server compares `user.lastActiveDate` with `Date.now()`.
    *   **Same Day**: Returns `{ success: true, alreadyCheckedIn: true }`. No database write needed for streak (saves DB performance).
    *   **Consecutive Day**: If `lastActiveDate` was yesterday, `currentStreak` increments (+1).
    *   **Broken Streak**: If `lastActiveDate` was >1 days ago, `currentStreak` resets to 1.
3.  **Point Prevention**: 
    *   Points are ONLY awarded if `alreadyCheckedIn` is `false`. This prevents users from refreshing the page to farm XP.
4.  **UI Feedback**:
    *   Web app shows a toast notification ("+10 XP") *only* on the first successful check-in of the day.
    *   Visual "Streak Active" badge appears instantly.

**Leveling Logic:**
*   Levels are calculated based on total XP using a progressive threshold array.
*   Badges (e.g., "Week Warrior") are automatically pushed to the `user.badges` array when specific streak milestones (7, 30, 100 days) are met during the check-in process.

---

## 2. Stash Insight (Unified Analytics) 🧠

### Concept
We merged separate "Analytics" and "AI" pages into one "Super Feature" to reduce clutter and synthesize data.

**Architecture:**
*   **Component**: `Insights.jsx`
*   **Data Aggregation**: This page makes parallel API calls to fetch:
    *   `aiAPI.getInsights()` (Gemini-powered text analysis)
    *   `expenseAPI.getAll()`
    *   `incomeAPI.getAll()`
*   **Tab System**: 
    *   **AI Coach**: Displays the textual advice and the circular "Financial Health Score" SVG.
    *   **Financial Health**: Detailed breakdown of score components.
    *   **Expenses/Budgets**: Visual charts (Bar/Pie charts) reusing the `Chart.js` components from the dashboard.

---

## 3. GST & Business Tools 💼

### Client-Side Validation (No API Key)
To keep the app free and fast, we use Algorithmic Validation instead of paid APIs for GST checks.

**Logic:**
*   **Regex Pattern**: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
*   **Decoding**:
    *   First 2 digits -> **State Code** (Mapped to a JSON list of Indian states).
    *   Next 10 chars -> **PAN Number**.
*   **Benefit**: Instant feedback, works offline, zero cost.

---

## 4. Frontend Architecture (React + Vite)
*   **Icon System**: We transitioned from Lucide-React to a custom SVG object system (`Icons.jsx`) to reduce bundle size and dependency conflicts.
*   **Routing**: Used `react-router-dom` with a `ProtectedRoute` wrapper to ensure unauthenticated users are bounced to Login.
*   **Global State**: `context` API (ExpenseContext, CardsContext) is used for data that needs to live everywhere (like your balance), so we don't have to re-fetch it on every page click.

---
*Created per user request for system transparency.*
