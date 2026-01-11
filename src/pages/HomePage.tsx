import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DatePicker,
  TaskCard,
  TaskForm,
  KissForm,
  MemberAvatarList,
  CommentList,
} from '../components';
import { taskService } from '../services/task.service';
import { kissService } from '../services/kiss.service';
import { groupService } from '../services/group.service';
import type { Task, KissReflection, KissUnlockStatus } from '../types';
import type { TaskFormData } from '../components/TaskForm';
import type { KissFormData } from '../components/KissForm';
import type { GroupMember, Group } from '../types/group';

type TabType = 'tasks' | 'kiss' | 'comments';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // KISS reflection state
  const [kissReflection, setKissReflection] = useState<KissReflection | null>(null);
  const [kissUnlockStatus, setKissUnlockStatus] = useState<KissUnlockStatus>({
    isUnlocked: false,
    totalTasks: 0,
    completedTasks: 0,
    canRetroactivelyFill: false,
  });

  // Group state
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberKissSettings, setMemberKissSettings] = useState<Map<number, boolean>>(new Map());
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  // Check if user came from group management page with a group ID
  useEffect(() => {
    const state = location.state as { groupId?: number } | null;
    if (state?.groupId) {
      loadGroup(state.groupId);
    } else {
      loadAvailableGroups();
    }
  }, [location]);

  const loadAvailableGroups = async () => {
    try {
      const groups = await groupService.getMyGroups();
      setAvailableGroups(groups);
      if (groups.length > 0 && !currentGroup) {
        // Auto-load first group
        await loadGroup(groups[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const loadGroup = async (groupId: number) => {
    try {
      const groupData = await groupService.getGroup(groupId);
      setCurrentGroup(groupData);
      setGroupMembers(groupData.members);

      // Initialize KISS settings (all visible by default)
      const settings = new Map<number, boolean>();
      groupData.members.forEach(member => {
        settings.set(member.userId, true);
      });
      setMemberKissSettings(settings);
    } catch (err) {
      console.error('Failed to load group:', err);
      setError('加载群组失败');
    }
  };

  const handleGroupChange = (groupId: number) => {
    loadGroup(groupId);
    setShowGroupSelector(false);
    setSelectedMemberId(null); // Reset to viewing own data
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTasks = async (date: string, userId?: number) => {
    setIsLoading(true);
    setError('');
    try {
      const fetchedTasks = userId
        ? await taskService.getUserTasksByDate(userId, date)
        : await taskService.getTasksByDate(date);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('加载任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKissReflection = async (date: string, userId?: number) => {
    try {
      const reflection = userId
        ? await kissService.getUserReflectionByDate(userId, date)
        : await kissService.getReflectionByDate(date);
      setKissReflection(reflection);
    } catch (err) {
      console.error('Failed to fetch KISS reflection:', err);
      setError('加载复盘失败');
    }
  };

  const fetchKissUnlockStatus = async (date: string, userId?: number) => {
    try {
      const status = userId
        ? await kissService.checkUserUnlockStatus(userId, date)
        : await kissService.checkUnlockStatus(date);
      setKissUnlockStatus(status);
    } catch (err) {
      console.error('Failed to check unlock status:', err);
    }
  };

  useEffect(() => {
    const targetUserId = selectedMemberId || undefined;
    fetchTasks(selectedDate, targetUserId);
    fetchKissReflection(selectedDate, targetUserId);
    fetchKissUnlockStatus(selectedDate, targetUserId);
  }, [selectedDate, selectedMemberId]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleMemberSelect = (memberId: number | null) => {
    setSelectedMemberId(memberId);
  };

  const handleToggleKiss = (userId: number) => {
    setMemberKissSettings(prev => {
      const newSettings = new Map(prev);
      newSettings.set(userId, !prev.get(userId));
      return newSettings;
    });
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskFormSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, formData);
    } else {
      await taskService.createTask(formData);
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
    await fetchTasks(selectedDate);
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleUpdateProgress = async (taskId: number, progressValue: number) => {
    try {
      await taskService.updateProgress(taskId, progressValue);
      await fetchTasks(selectedDate);
      // Re-check unlock status after updating task progress
      await fetchKissUnlockStatus(selectedDate);
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError('更新进度失败');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks(selectedDate);
      // Re-check unlock status after deleting task
      await fetchKissUnlockStatus(selectedDate);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('删除任务失败');
    }
  };

  const handleKissFormSubmit = async (formData: KissFormData) => {
    try {
      await kissService.saveReflection(formData);
      await fetchKissReflection(selectedDate);
    } catch (err) {
      console.error('Failed to save KISS reflection:', err);
      throw err;
    }
  };

  const handlePlanNextDay = () => {
    // Navigate to next day and switch to tasks tab
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split('T')[0];
    setSelectedDate(nextDateString);
    setActiveTab('tasks');
  };

  const isViewingOwnData = selectedMemberId === null;
  const currentViewUserId = isViewingOwnData ? user!.id : selectedMemberId!;
  const currentViewUsername = isViewingOwnData
    ? user?.username
    : groupMembers.find(m => m.userId === selectedMemberId)?.username;

  const showKissTab = isViewingOwnData || memberKissSettings.get(selectedMemberId!);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left sidebar - Member avatars (only show when in a group) */}
      {currentGroup && (
        <MemberAvatarList
          members={groupMembers}
          currentUserId={user?.id || null}
          selectedMemberId={selectedMemberId}
          onMemberSelect={handleMemberSelect}
          memberKissSettings={memberKissSettings}
          onToggleKiss={handleToggleKiss}
        />
      )}

      {/* Main content - offset when sidebar is visible */}
      <div className={currentGroup ? 'ml-20' : ''}>
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">BigPlans</h1>
                {currentGroup && (
                  <div className="relative">
                    <button
                      onClick={() => setShowGroupSelector(!showGroupSelector)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-sm font-medium">{currentGroup.name}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {showGroupSelector && availableGroups.length > 1 && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50">
                        {availableGroups.map(group => (
                          <button
                            key={group.id}
                            onClick={() => handleGroupChange(group.id)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${
                              group.id === currentGroup?.id ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            {group.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {!currentGroup && (
                  <button
                    onClick={() => navigate('/groups')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    群组管理
                  </button>
                )}
                <span className="text-gray-700">
                  欢迎, <span className="font-medium">{user?.username}</span>
                  {!isViewingOwnData && (
                    <span className="ml-2 text-sm text-blue-600">
                      (正在查看 {currentViewUsername} 的数据)
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date Picker */}
          <div className="mb-6">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                任务列表
              </button>
              {showKissTab && (
                <button
                  onClick={() => setActiveTab('kiss')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === 'kiss'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  KISS 复盘
                  {!kissUnlockStatus.isUnlocked && (
                    <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                全天评论
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Tasks Tab Content */}
          {activeTab === 'tasks' && (
            <>
              {isViewingOwnData && (
                <div className="mb-6 flex items-center justify-end">
                  <button
                    onClick={handleCreateTask}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    创建任务
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">
                    {isViewingOwnData ? '这一天还没有任务' : `${currentViewUsername} 这一天还没有任务`}
                  </p>
                  {isViewingOwnData && (
                    <p className="text-gray-400 text-sm">
                      点击"创建任务"按钮添加你的第一个任务
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUserId={user!.id}
                      targetUserId={currentViewUserId}
                      selectedDate={selectedDate}
                      onUpdate={isViewingOwnData ? handleUpdateProgress : undefined}
                      onEdit={isViewingOwnData ? handleEditTask : undefined}
                      onDelete={isViewingOwnData ? handleDeleteTask : undefined}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* KISS Tab Content */}
          {activeTab === 'kiss' && showKissTab && (
            <div className="bg-white rounded-lg shadow p-6">
              {!isViewingOwnData && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                  正在查看 {currentViewUsername} 的 KISS 复盘
                </div>
              )}
              <KissForm
                reflection={kissReflection}
                selectedDate={selectedDate}
                unlockStatus={kissUnlockStatus}
                onSubmit={isViewingOwnData ? handleKissFormSubmit : undefined}
                onPlanNextDay={isViewingOwnData ? handlePlanNextDay : undefined}
              />
            </div>
          )}

          {/* Comments Tab Content */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {isViewingOwnData
                  ? '全天评论'
                  : `${currentViewUsername} 的全天评论`}
              </h2>
              <CommentList
                filters={{
                  date: selectedDate,
                  targetUserId: currentViewUserId,
                  isDailyComment: true,
                }}
                currentUserId={user!.id}
                autoRefresh={true}
                refreshInterval={15000}
                showForm={true}
              />
            </div>
          )}
        </main>

        {showTaskForm && (
          <TaskForm
            task={editingTask}
            selectedDate={selectedDate}
            onSubmit={handleTaskFormSubmit}
            onCancel={handleTaskFormCancel}
          />
        )}
      </div>
    </div>
  );
}
