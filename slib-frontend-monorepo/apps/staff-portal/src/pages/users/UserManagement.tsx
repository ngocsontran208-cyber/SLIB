import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Users, Shield, UserX, UserCheck } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/api/RoleManager/users'),
        api.get('/api/RoleManager/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      if (rolesRes.data.length > 0) {
        setSelectedRoleId(rolesRes.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch Users data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/api/RoleManager/users/${user.id}/active`, !user.isActive, {
        headers: { 'Content-Type': 'application/json' }
      });
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch (error) {
      console.error("Failed to toggle user status", error);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/api/RoleManager/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
      await fetchData(); // Refresh data to show new roles
      setShowRoleModal(false);
    } catch (error) {
      console.error("Failed to assign role", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/RoleManager/roles', { name: newRoleName, description: newRoleDesc });
      await fetchData(); // Refresh data
      setShowCreateRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
    } catch (error: any) {
      alert(error.response?.data || "Failed to create role");
      console.error("Failed to create role", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRoleModal = (userId: number) => {
    setSelectedUserId(userId);
    setShowRoleModal(true);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary-500" />
            {t('user_config_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('user_config_desc')}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateRoleModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          + Create Role
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('username')}</th>
                <th className="px-6 py-4 font-medium">{t('fullname')}</th>
                <th className="px-6 py-4 font-medium">{t('roles')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">{t('no_data')}</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {user.username}
                      <div className="text-xs text-slate-400 font-normal">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map(role => (
                            <span key={role} className="px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 rounded text-xs">
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No Roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        }`}
                      >
                        {user.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => openRoleModal(user.id)}
                        className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium flex items-center gap-1 transition-colors"
                        title={t('assign_role')}
                      >
                        <Shield size={14} />
                        {t('assign_role')}
                      </button>
                      <button 
                        onClick={() => handleToggleActive(user)}
                        className={`p-1.5 rounded transition-colors ${
                          user.isActive 
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                            : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                        }`}
                        title={user.isActive ? t('ban_user') : t('unban_user')}
                      >
                        {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">{t('assign_role')}</h2>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAssignRole} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('select_role')}</label>
                <select 
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500"
                  required
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? '...' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">Create New Role</h2>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateRole} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role Name</label>
                <input 
                  type="text" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text" 
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateRoleModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded">
                  {isSubmitting ? '...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
