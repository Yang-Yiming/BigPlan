import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DatePicker, TaskCard, TaskForm, KissForm } from '../components';
import { taskService } from '../services/task.service';
import { kissService } from '../services/kiss.service';
import type { Task, KissReflection, KissUnlockStatus } from '../types';
import type { TaskFormData } from '../components/TaskForm';
import type { KissFormData } from '../components/KissForm';

type TabType = 'tasks' | 'kiss';

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchTasks = async (date: string) => {
    setIsLoading(true);
    setError('');
    try {
      const fetchedTasks = await taskService.getTasksByDate(date);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('加载任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKissReflection = async (date: string) => {
    try {
      const reflection = await kissService.getReflectionByDate(date);
      setKissReflection(reflection);
    } catch (err) {
      console.error('Failed to fetch KISS reflection:', err);
      setError('加载复盘失败');
    }
  };

  const fetchKissUnlockStatus = async (date: string) => {
    try {
      const status = await kissService.checkUnlockStatus(date);
      setKissUnlockStatus(status);
    } catch (err) {
      console.error('Failed to check unlock status:', err);
    }
  };

  useEffect(() => {
    fetchTasks(selectedDate);
    fetchKissReflection(selectedDate);
    fetchKissUnlockStatus(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BigPlans</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                欢迎, <span className="font-medium">{user?.username}</span>
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
                <p className="text-gray-500 text-lg mb-2">这一天还没有任务</p>
                <p className="text-gray-400 text-sm">
                  点击"创建任务"按钮添加你的第一个任务
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateProgress}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* KISS Tab Content */}
        {activeTab === 'kiss' && (
          <div className="bg-white rounded-lg shadow p-6">
            <KissForm
              reflection={kissReflection}
              selectedDate={selectedDate}
              unlockStatus={kissUnlockStatus}
              onSubmit={handleKissFormSubmit}
              onPlanNextDay={handlePlanNextDay}
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
  );
}
