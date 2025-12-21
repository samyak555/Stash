import { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { GoalsIcon } from '../components/Icons';
import Logo from '../components/Logo';
import ProgressInput from '../components/ProgressInput';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    description: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getAll();
      setGoals(response.data || []);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalAPI.update(editingGoal._id, formData);
        toast.success('Goal updated successfully');
      } else {
        await goalAPI.create(formData);
        toast.success('Goal created successfully');
      }
      fetchGoals();
      resetForm();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount,
      deadline: new Date(goal.deadline).toISOString().split('T')[0],
      description: goal.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalAPI.delete(id);
        toast.success('Goal deleted successfully');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const handleAddProgress = async (goalId, amount) => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const goal = goals.find(g => g._id === goalId);
      if (!goal) return;
      const newAmount = (goal.currentAmount || 0) + amount;
      await goalAPI.update(goalId, { currentAmount: newAmount });
      toast.success('Progress added successfully');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to add progress');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      targetAmount: '',
      deadline: '',
      description: '',
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  // Calculate goal status
  const getGoalStatus = (goal) => {
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const progress = ((goal.currentAmount || 0) / parseFloat(goal.targetAmount)) * 100;
    
    if (progress >= 100) return { status: 'completed', color: 'green', text: 'Completed' };
    if (deadline < now) return { status: 'expired', color: 'red', text: 'Expired' };
    return { status: 'active', color: 'blue', text: 'Active' };
  };

  if (loading) {
    return <div className="text-center py-8 text-white">Loading goals...</div>;
  }

  return (
    <div className="px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mr-4">
                <GoalsIcon className="w-7 h-7 text-yellow-400" />
              </div>
              Goals
            </h1>
            <p className="text-slate-400 text-lg font-normal">Set and achieve your financial goals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-premium text-white px-6 py-3.5 rounded-xl font-semibold flex items-center text-base whitespace-nowrap"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Create Goal'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl mb-10 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">Goal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="e.g., New Laptop"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">Target Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 tracking-tight">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="Describe your goal..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-premium text-white px-6 py-3.5 rounded-xl font-semibold">
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
            {editingGoal && (
              <button type="button" onClick={resetForm} className="px-6 py-3.5 rounded-xl font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center border border-white/10">
            <GoalsIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-normal">No goals created yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first savings goal!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const status = getGoalStatus(goal);
            const progress = ((goal.currentAmount || 0) / parseFloat(goal.targetAmount)) * 100;
            const [progressAmount, setProgressAmount] = useState('');

            return (
              <div
                key={goal._id}
                className={`glass-card rounded-2xl p-6 border ${
                  status.status === 'completed' ? 'border-green-500/30' :
                  status.status === 'expired' ? 'border-red-500/30' :
                  'border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-slate-400">{goal.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${status.color === 'green' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : status.color === 'red' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-bold text-white">₹{parseFloat(goal.targetAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saved:</span>
                    <span className="font-bold text-green-400">₹{(goal.currentAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining:</span>
                    <span className="font-bold text-yellow-400">
                      ₹{(parseFloat(goal.targetAmount) - (goal.currentAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deadline:</span>
                    <span className="text-slate-200">{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-white/5 rounded-full h-3 mb-3 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status.status === 'completed' ? 'bg-green-500/80' :
                        status.status === 'expired' ? 'bg-red-500/80' :
                        'bg-cyan-500/80'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="mb-2">
                  <ProgressInput onAdd={handleAddProgress} goalId={goal._id} />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;
