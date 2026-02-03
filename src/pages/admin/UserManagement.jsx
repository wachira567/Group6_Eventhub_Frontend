import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Ban, CheckCircle, ChevronLeft, Shield, Mail, Download, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { apiGet, apiPost } from '../../utils/api';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      
      const response = await apiGet(`/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredUsers = data.users || [];
        
        // Apply status filter on client side since it's_active isn't in the API query
        if (statusFilter !== 'all') {
          const statusMap = {
            'active': true,
            'inactive': false,
            'suspended': false // suspended would be inactive in our model
          };
          filteredUsers = filteredUsers.filter(u => u.is_active === statusMap[statusFilter]);
        }
        
        setUsers(filteredUsers);
        setTotalUsers(data.total || filteredUsers.length);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleBan = async (userId) => {
    try {
      const response = await apiPost(`/users/${userId}/ban`, {});
      if (response.ok) {
        toast.success('User banned successfully');
        fetchUsers();
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to ban user');
      }
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const response = await apiPost(`/users/${userId}/activate`, {});
      if (response.ok) {
        toast.success('User activated successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to activate user');
      }
    } catch (error) {
      toast.error('Error activating user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await apiPost(`/users/${userId}/promote`, { role: newRole });
      if (response.ok) {
        toast.success('User role updated successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  const getStatus = (user) => {
    if (!user.is_active) return 'inactive';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users; // Already filtered by API and client

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[#6F7287] hover:text-[#F05537] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-[#E6E5E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1E0A3C]">User Management</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6F7287]">{totalUsers} users</span>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9A8B3]" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
              >
                <option value="all">All Roles</option>
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-[#D2D2D6] rounded-lg focus:ring-2 focus:ring-[#F05537] outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#F05537]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E5E8] bg-[#F8F7FA]">
                    <th className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-[#F05537] rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Role</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#6F7287]">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6F7287]">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6F7287]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#E6E5E8] last:border-0 hover:bg-[#F8F7FA]">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 text-[#F05537] rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F05537] rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-[#39364F]">{user.name || 'Unknown'}</p>
                            <p className="text-sm text-[#6F7287]">{user.email}</p>
                            {user.phone && <p className="text-sm text-[#A9A8B3]">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className="px-3 py-1 border border-[#D2D2D6] rounded-lg text-sm focus:ring-2 focus:ring-[#F05537] outline-none"
                        >
                          <option value="attendee">Attendee</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          getStatus(user) === 'active' ? 'bg-green-100 text-green-700' :
                          getStatus(user) === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatus(user)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6F7287]">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getStatus(user) === 'active' ? (
                            <button
                              onClick={() => handleBan(user.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Ban User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                              title="Activate User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#A9A8B3] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1E0A3C] mb-2">No users found</h3>
              <p className="text-[#6F7287]">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;