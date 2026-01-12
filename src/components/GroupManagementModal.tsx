/**
 * 群组管理模态框
 * 提供我的群组列表、创建群组、加入群组功能
 */

import { useState, useEffect } from 'react';
import { groupService } from '../services/group.service';
import type { Group, GroupInvite } from '../types/group';

interface GroupManagementModalProps {
  isOpen: boolean;
  mode: 'list' | 'create' | 'join';
  currentUserId: number;
  onClose: () => void;
  onGroupCreated?: () => void;
  onGroupJoined?: () => void;
  onGroupSelected?: (groupId: number) => void;
}

export function GroupManagementModal({
  isOpen,
  mode: initialMode,
  currentUserId,
  onClose,
  onGroupCreated,
  onGroupJoined,
  onGroupSelected,
}: GroupManagementModalProps) {
  const [mode, setMode] = useState(initialMode);
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
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<number | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<GroupInvite | null>(null);

  // 同步 mode
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 加载群组列表
  useEffect(() => {
    if (isOpen && mode === 'list') {
      fetchGroups();
    }
  }, [isOpen, mode]);

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
      onGroupCreated?.();
      setTimeout(() => {
        setMode('list');
        setSuccessMessage('');
      }, 1500);
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
      onGroupJoined?.();
      setTimeout(() => {
        setMode('list');
        setSuccessMessage('');
      }, 1500);
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

  const copyInviteCode = () => {
    if (generatedInvite) {
      navigator.clipboard.writeText(generatedInvite.code);
      setSuccessMessage('邀请码已复制到剪贴板');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 modal-backdrop z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'list' && '我的群组'}
              {mode === 'create' && '创建群组'}
              {mode === 'join' && '加入群组'}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 消息提示 */}
          {error && (
            <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          {/* 内容 */}
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* 群组列表视图 */}
            {mode === 'list' && (
              <div className="space-y-4">
                {/* 快捷操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMode('create');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    创建新群组
                  </button>
                  <button
                    onClick={() => {
                      setMode('join');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors font-medium"
                  >
                    加入群组
                  </button>
                </div>

                {/* 群组列表 */}
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
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {group.name}
                          </h3>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {group.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            创建于 {new Date(group.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          <button
                            onClick={() => {
                              onGroupSelected?.(group.id);
                              handleClose();
                            }}
                            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                          >
                            进入
                          </button>
                          <button
                            onClick={() => handleGenerateInvite(group.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            邀请
                          </button>
                          <button
                            onClick={() => handleLeaveGroup(group.id, group.name)}
                            className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
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
            {mode === 'create' && (
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    群组名称 *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="输入群组名称"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="描述群组用途（可选）"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    返回列表
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {isLoading ? '创建中...' : '创建群组'}
                  </button>
                </div>
              </form>
            )}

            {/* 加入群组视图 */}
            {mode === 'join' && (
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邀请码 *
                  </label>
                  <input
                    type="text"
                    value={joinForm.inviteCode}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, inviteCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="输入邀请码"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    返回列表
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {isLoading ? '加入中...' : '加入群组'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 邀请码弹窗 */}
      {generatedInvite && selectedGroupForInvite && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[60] animate-fade-in">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              群组邀请码
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-primary-600">
                  {generatedInvite.code}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="ml-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
