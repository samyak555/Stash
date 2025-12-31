import { useState, useEffect } from 'react';
import { groupAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FamilyIcon } from '../components/Icons';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';

const Family = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getAll();
      setGroups(response.data || []);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.create(formData);
      toast.success('Group created successfully!');
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleInvite = async (groupId) => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    try {
      await groupAPI.invite(groupId, { userId: selectedUserId });
      toast.success('Invitation sent!');
      setShowInviteForm(null);
      setSelectedUserId('');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-white">Loading groups...</div>;
  }

  return (
    <div className="px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center">
              <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 mr-4">
                <FamilyIcon className="w-7 h-7 text-pink-400" />
              </div>
              Family & Groups
            </h1>
            <p className="text-slate-400 text-lg font-normal">Share expenses with family and friends</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
            leftIcon={<span>{showCreateForm ? '✕' : '+'}</span>}
            className="whitespace-nowrap"
          >
            {showCreateForm ? 'Cancel' : 'Create Group'}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateGroup} className="glass-card p-8 rounded-2xl mb-10 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Create New Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Group Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="e.g., Family Budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all text-base font-normal"
                placeholder="Describe the group..."
              />
            </div>
          </div>
          <Button type="submit" variant="primary" className="mt-4">
            Create Group
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center border border-white/10">
            <FamilyIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No groups created yet</p>
            <p className="text-slate-500 text-sm mt-2">Create a group to start sharing expenses!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-slate-400">{group.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Members:</span>
                  <span className="text-white">{group.members?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pending Invites:</span>
                  <span className="text-yellow-400">{group.invitations?.length || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowInviteForm(group._id)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  Invite
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  View
                </Button>
              </div>

              {showInviteForm === group._id && (
                <div className="mt-4 p-5 bg-white/5 rounded-xl border border-white/10">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm mb-3 focus:outline-none focus:border-cyan-400/50 focus:bg-white/8 transition-all font-normal"
                  >
                    <option value="">Select a user</option>
                    {users.filter(u => !group.members?.includes(u._id)).map(user => (
                      <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleInvite(group._id)}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Send
                    </Button>
                    <Button
                      onClick={() => {
                        setShowInviteForm(null);
                        setSelectedUserId('');
                      }}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Family;
