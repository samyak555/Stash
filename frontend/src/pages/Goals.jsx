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
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Logo size="default" showText={true} className="mb-4" />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 flex items-center">
              <GoalsIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-400" />
              Goals
            </h1>
            <p className="text-gray-400">Set and achieve your financial goals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center text-sm sm:text-base"
          >
            <span className="mr-2">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Create Goal'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-light p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., New Laptop"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Describe your goal..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium">
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
            {editingGoal && (
              <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full glass-light rounded-xl p-12 text-center">
            <GoalsIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No goals created yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first savings goal!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const status = getGoalStatus(goal);
            const progress = ((goal.currentAmount || 0) / parseFloat(goal.targetAmount)) * 100;
            const [progressAmount, setProgressAmount] = useState('');

            return (
              <div
                key={goal._id}
                className={`glass-light rounded-xl p-6 border ${
                  status.status === 'completed' ? 'border-green-500/50' :
                  status.status === 'expired' ? 'border-red-500/50' :
                  'border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-400">{goal.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${status.color === 'green' ? 'bg-green-500/20 text-green-400' : status.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target:</span>
                    <span className="font-bold text-white">₹{parseFloat(goal.targetAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saved:</span>
                    <span className="font-bold text-green-400">₹{(goal.currentAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="font-bold text-yellow-400">
                      ₹{(parseFloat(goal.targetAmount) - (goal.currentAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Deadline:</span>
                    <span className="text-gray-300">{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full ${
                        status.status === 'completed' ? 'bg-green-500' :
                        status.status === 'expired' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
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
