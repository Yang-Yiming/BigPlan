import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DatePicker,
  TaskCard,
  TaskForm,
  KissForm,
  MemberAvatarList,
  CommentList,
  TopNavbar,
  TaskListSkeleton,
  KissFormSkeleton,
  EmptyState,
  EmptyStateIcons,
  TaskCommentsPanel,
  TaskCommentsDrawer,
} from '../components';
import { taskService } from '../services/task.service';
import { kissService } from '../services/kiss.service';
import { groupService } from '../services/group.service';
import type { Task, KissReflection, KissUnlockStatus } from '../types';
import type { TaskFormData } from '../components/TaskForm';
import type { KissFormData } from '../components/KissForm';
import type { GroupMember, Group } from '../types/group';
import { getLocalDateString } from '../utils/date';

type TabType = 'tasks' | 'kiss' | 'comments';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // KISS reflection state
  const [kissReflection, setKissReflection] = useState<KissReflection | null>(null);
  const [kissUnlockStatus, setKissUnlockStatus] = useState<KissUnlockStatus>({
    isUnlocked: false,
    totalTasks: 0,
    completedTasks: 0,
    canRetroactivelyFill: false,
  });
  const [kissLoading, setKissLoading] = useState(false);

  // Group state
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberKissSettings, setMemberKissSettings] = useState<Map<number, boolean>>(new Map());
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

  // Task interaction state (for two-column layout)
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
    setKissLoading(true);
    try {
      const reflection = userId
        ? await kissService.getUserReflectionByDate(userId, date)
        : await kissService.getReflectionByDate(date);
      setKissReflection(reflection);
    } catch (err) {
      console.error('Failed to fetch KISS reflection:', err);
      setError('加载复盘失败');
    } finally {
      setKissLoading(false);
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
    setShowMobileSidebar(false); // Close sidebar on mobile after selection
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

  // Task interaction handlers for two-column layout
  const handleTaskHover = (taskId: number | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (selectedTaskId) return; // Don't update hover when task is selected

    if (taskId === null) {
      setHoveredTaskId(null);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredTaskId(taskId);
      }, 50); // 50ms delay to avoid flickering
    }
  };

  const handleTaskSelect = (taskId: number) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null); // Deselect if clicking same task
    } else {
      setSelectedTaskId(taskId);
    }
  };

  // Auto-deselect if selected task is deleted
  useEffect(() => {
    if (selectedTaskId && !tasks.find(t => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  // Keyboard handler: Escape to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTaskId) {
        setSelectedTaskId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId]);

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
    const nextDateString = getLocalDateString(nextDate);
    setSelectedDate(nextDateString);
    setActiveTab('tasks');
  };

  const isViewingOwnData = selectedMemberId === null;
  const currentViewUserId = isViewingOwnData ? user!.id : selectedMemberId!;
  const currentViewUsername = isViewingOwnData
    ? user?.username
    : groupMembers.find(m => m.userId === selectedMemberId)?.username;

  const showKissTab = isViewingOwnData || memberKissSettings.get(selectedMemberId!);

  // Determine which task's comments to show in the panel
  const activeTaskId = selectedTaskId || hoveredTaskId;
  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top Navigation */}
      <TopNavbar
        username={user?.username || ''}
        currentGroup={currentGroup}
        availableGroups={availableGroups}
        isViewingOwnData={isViewingOwnData}
        currentViewUsername={currentViewUsername}
        onGroupChange={handleGroupChange}
        onLogout={handleLogout}
        onMobileMenuToggle={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && currentGroup && (
        <div
          className="fixed inset-0 modal-backdrop z-30 md:hidden animate-fade-in"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="bg-white w-64 h-full border-r border-[#e4e4e7] animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">成员列表</h2>
            </div>
            <MemberAvatarList
              members={groupMembers}
              currentUserId={user?.id || null}
              selectedMemberId={selectedMemberId}
              onMemberSelect={handleMemberSelect}
              memberKissSettings={memberKissSettings}
              onToggleKiss={handleToggleKiss}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Member avatars (only show when in a group) */}
      {currentGroup && (
        <div className="hidden md:block">
          <MemberAvatarList
            members={groupMembers}
            currentUserId={user?.id || null}
            selectedMemberId={selectedMemberId}
            onMemberSelect={handleMemberSelect}
            memberKissSettings={memberKissSettings}
            onToggleKiss={handleToggleKiss}
          />
        </div>
      )}

      {/* Main content - offset when sidebar is visible */}
      <div className={`pt-16 ${currentGroup ? 'md:ml-20' : ''}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Date Picker */}
          <div className="mb-6 animate-slide-up">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200 animate-slide-up">
            <nav className="-mb-px flex gap-4 md:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-3 md:py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 任务列表
              </button>
              {showKissTab && (
                <button
                  onClick={() => setActiveTab('kiss')}
                  className={`py-3 md:py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-all duration-300 relative whitespace-nowrap ${
                    activeTab === 'kiss'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🎯 KISS 复盘
                  {!kissUnlockStatus.isUnlocked && (
                    <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 md:py-4 px-2 border-b-2 font-medium text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'comments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 全天评论
              </button>
            </nav>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3 animate-slide-up">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">{error}</div>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Tasks Tab Content */}
          {activeTab === 'tasks' && (
            <div className="animate-fade-in">
              {isViewingOwnData && (
                <div className="mb-6 flex items-center justify-between md:justify-end">
                  <button
                    onClick={handleCreateTask}
                    className="px-4 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] active:scale-[0.98] tracking-tight"
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
                    <span className="hidden sm:inline">创建任务</span>
                    <span className="sm:hidden">创建</span>
                  </button>
                </div>
              )}

              {isLoading ? (
                <TaskListSkeleton count={3} />
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={EmptyStateIcons.Tasks}
                  title={isViewingOwnData ? '这一天还没有任务' : `${currentViewUsername} 这一天还没有任务`}
                  description={isViewingOwnData ? '点击"创建任务"按钮添加你的第一个任务，开始高效的一天！' : undefined}
                  action={isViewingOwnData ? {
                    label: '创建任务',
                    onClick: handleCreateTask,
                  } : undefined}
                />
              ) : (
                <>
                  {/* Desktop: Two-column grid */}
                  <div className="hidden lg:grid lg:grid-cols-10 gap-6">
                    {/* Left Column - Task List (60%) */}
                    <div className="lg:col-span-6 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 px-1 py-2">
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
                          isHovered={hoveredTaskId === task.id}
                          isSelected={selectedTaskId === task.id}
                          onHover={handleTaskHover}
                          onSelect={handleTaskSelect}
                        />
                      ))}
                    </div>

                    {/* Right Column - Comments Panel (40%) */}
                    <div className="lg:col-span-4">
                      <TaskCommentsPanel
                        task={activeTask}
                        currentUserId={user!.id}
                        targetUserId={currentViewUserId}
                        selectedDate={selectedDate}
                        isSelected={selectedTaskId !== null}
                      />
                    </div>
                  </div>

                  {/* Mobile: Single column with drawer */}
                  <div className="lg:hidden space-y-4">
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
                        isSelected={selectedTaskId === task.id}
                        onSelect={handleTaskSelect}
                        // No onHover on mobile
                      />
                    ))}
                  </div>

                  {/* Mobile Comments Drawer */}
                  <TaskCommentsDrawer
                    task={activeTask}
                    isOpen={selectedTaskId !== null}
                    onClose={() => setSelectedTaskId(null)}
                    currentUserId={user!.id}
                    targetUserId={currentViewUserId}
                    selectedDate={selectedDate}
                  />
                </>
              )}
            </div>
          )}

          {/* KISS Tab Content */}
          {activeTab === 'kiss' && showKissTab && (
            <div className="bg-white rounded-lg border border-[#e4e4e7] p-4 md:p-6 animate-fade-in">
              {!isViewingOwnData && (
                <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-primary-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>正在查看 <strong>{currentViewUsername}</strong> 的 KISS 复盘</span>
                </div>
              )}
              {kissLoading ? (
                <KissFormSkeleton />
              ) : (
                <KissForm
                  reflection={kissReflection}
                  selectedDate={selectedDate}
                  unlockStatus={kissUnlockStatus}
                  onSubmit={isViewingOwnData ? handleKissFormSubmit : undefined}
                  onPlanNextDay={isViewingOwnData ? handlePlanNextDay : undefined}
                  readOnly={!isViewingOwnData}
                />
              )}
            </div>
          )}

          {/* Comments Tab Content */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-lg border border-[#e4e4e7] p-4 md:p-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <span>💬</span>
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
