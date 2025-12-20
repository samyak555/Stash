import { useState, useEffect } from 'react';
import { groupAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FamilyIcon } from '../components/Icons';
import Logo from '../components/Logo';

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
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Logo size="default" showText={true} className="mb-4" />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 flex items-center">
              <FamilyIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-pink-400" />
              Family & Groups
            </h1>
            <p className="text-slate-400">Share expenses with family and friends</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center text-sm sm:text-base"
          >
            <span className="mr-2">{showCreateForm ? '✕' : '+'}</span>
            {showCreateForm ? 'Cancel' : 'Create Group'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateGroup} className="glass-light p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Group Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., Family Budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Describe the group..."
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium">
            Create Group
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full glass-light rounded-xl p-12 text-center">
            <FamilyIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No groups created yet</p>
            <p className="text-slate-500 text-sm mt-2">Create a group to start sharing expenses!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="glass-light rounded-xl p-6 border border-slate-700/50">
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
                <button
                  onClick={() => setShowInviteForm(group._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Invite
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  View
                </button>
              </div>

              {showInviteForm === group._id && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white text-sm mb-2"
                  >
                    <option value="">Select a user</option>
                    {users.filter(u => !group.members?.includes(u._id)).map(user => (
                      <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvite(group._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => {
                        setShowInviteForm(null);
                        setSelectedUserId('');
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
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
