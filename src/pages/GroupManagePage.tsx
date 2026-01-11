/**
 * 群组管理页面
 * 支持创建群组、加入群组、查看群组列表、管理群组
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/group.service';
import { useAuth } from '../contexts/AuthContext';
import type { Group, GroupInvite } from '../types/group';

type ViewMode = 'list' | 'create' | 'join';

export function GroupManagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 创建群组表单
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  });

  // 加入群组表单
  const [joinForm, setJoinForm] = useState({
    inviteCode: '',
  });

  // 邀请码管理
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<
    number | null
  >(null);
  const [generatedInvite, setGeneratedInvite] = useState<GroupInvite | null>(
    null
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await groupService.getMyGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取群组列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setError('请输入群组名称');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await groupService.createGroup({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
      });
      setSuccessMessage('群组创建成功！');
      setCreateForm({ name: '', description: '' });
      setViewMode('list');
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || '创建群组失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.inviteCode.trim()) {
      setError('请输入邀请码');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await groupService.joinGroup({ inviteCode: joinForm.inviteCode.trim() });
      setSuccessMessage('成功加入群组！');
      setJoinForm({ inviteCode: '' });
      setViewMode('list');
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || '加入群组失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvite = async (groupId: number) => {
    try {
      setIsLoading(true);
      setError('');
      const invite = await groupService.generateInviteCode(groupId);
      setGeneratedInvite(invite);
      setSelectedGroupForInvite(groupId);
    } catch (err: any) {
      setError(err.response?.data?.message || '生成邀请码失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`确定要退出群组 "${groupName}" 吗？`)) return;

    try {
      setIsLoading(true);
      setError('');
      await groupService.leaveGroup(groupId);
      setSuccessMessage('已退出群组');
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || '退出群组失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`确定要删除群组 "${groupName}" 吗？此操作无法撤销！`)) return;

    try {
      setIsLoading(true);
      setError('');
      await groupService.deleteGroup(groupId);
      setSuccessMessage('群组已删除');
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || '删除群组失败');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (generatedInvite) {
      navigator.clipboard.writeText(generatedInvite.code);
      setSuccessMessage('邀请码已复制到剪贴板');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 返回主页
            </button>
            <h1 className="text-xl font-bold text-gray-800">群组管理</h1>
          </div>
          <div className="text-sm text-gray-600">{user?.username}</div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 消息提示 */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            我的群组
          </button>
          <button
            onClick={() => {
              setViewMode('create');
              setError('');
              setSuccessMessage('');
            }}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            创建群组
          </button>
          <button
            onClick={() => {
              setViewMode('join');
              setError('');
              setSuccessMessage('');
            }}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'join'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            加入群组
          </button>
        </div>

        {/* 群组列表视图 */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                还没有加入任何群组，创建或加入一个吧！
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {group.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        创建于{' '}
                        {new Date(group.createdAt).toLocaleDateString('zh-CN')} · 成员可互相督促
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate('/', { state: { groupId: group.id } })
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        进入
                      </button>
                      <button
                        onClick={() => handleGenerateInvite(group.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        邀请
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(group.id, group.name)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                      >
                        退出
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 创建群组视图 */}
        {viewMode === 'create' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              创建新群组
            </h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  群组名称 *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入群组名称"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  群组描述
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述群组用途（可选）"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? '创建中...' : '创建群组'}
              </button>
            </form>
          </div>
        )}

        {/* 加入群组视图 */}
        {viewMode === 'join' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              加入群组
            </h2>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邀请码 *
                </label>
                <input
                  type="text"
                  value={joinForm.inviteCode}
                  onChange={(e) =>
                    setJoinForm({ ...joinForm, inviteCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入邀请码"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? '加入中...' : '加入群组'}
              </button>
            </form>
          </div>
        )}

        {/* 邀请码弹窗 */}
        {generatedInvite && selectedGroupForInvite && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                群组邀请码
              </h3>
              <div className="bg-gray-100 rounded p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-blue-600">
                    {generatedInvite.code}
                  </code>
                  <button
                    onClick={copyInviteCode}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    复制
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                将此邀请码分享给需要加入群组的成员
              </p>
              <button
                onClick={() => {
                  setGeneratedInvite(null);
                  setSelectedGroupForInvite(null);
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
