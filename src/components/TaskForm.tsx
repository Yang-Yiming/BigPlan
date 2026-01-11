import { useState, useEffect } from 'react';
import type {
  Task,
  ProgressType,
  RecurrenceFrequency,
  RecurrencePattern,
} from '../types';

interface TaskFormProps {
  task?: Task;
  selectedDate: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export interface TaskFormData {
  title: string;
  description?: string;
  date: string;
  progressType: ProgressType;
  maxProgress?: number;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export function TaskForm({
  task,
  selectedDate,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState(task?.date || selectedDate);
  const [progressType, setProgressType] = useState<ProgressType>(
    task?.progressType || 'boolean'
  );
  const [maxProgress, setMaxProgress] = useState<number>(
    task?.maxProgress || 10
  );
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task?.recurrencePattern) {
      try {
        const pattern = JSON.parse(task.recurrencePattern) as RecurrencePattern;
        setRecurrenceFrequency(pattern.frequency);
        setRecurrenceInterval(pattern.interval);
      } catch (e) {
        console.error('Failed to parse recurrence pattern:', e);
      }
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }

    if (progressType !== 'boolean' && (!maxProgress || maxProgress < 1)) {
      setError('请输入有效的最大进度值');
      return;
    }

    setIsLoading(true);

    try {
      const formData: TaskFormData = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        progressType,
        maxProgress:
          progressType === 'boolean' ? undefined : maxProgress,
        isRecurring,
        recurrencePattern: isRecurring
          ? {
              frequency: recurrenceFrequency,
              interval: recurrenceInterval,
            }
          : undefined,
      };

      await onSubmit(formData);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || '操作失败');
      } else {
        setError('操作失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {task ? '编辑任务' : '创建任务'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任务标题 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="输入任务标题"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任务描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
                placeholder="输入任务描述（可选）"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日期 *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                进度类型 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProgressType('boolean')}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    progressType === 'boolean'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={isLoading}
                >
                  完成/未完成
                </button>
                <button
                  type="button"
                  onClick={() => setProgressType('numeric')}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    progressType === 'numeric'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={isLoading}
                >
                  离散格子
                </button>
                <button
                  type="button"
                  onClick={() => setProgressType('percentage')}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    progressType === 'percentage'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={isLoading}
                >
                  连续进度条
                </button>
              </div>
            </div>

            {progressType !== 'boolean' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {progressType === 'numeric' ? '格子数量' : '最大值'} *
                </label>
                <input
                  type="number"
                  value={maxProgress}
                  onChange={(e) => setMaxProgress(parseInt(e.target.value) || 0)}
                  min="1"
                  max={progressType === 'numeric' ? '20' : '1000'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700">
                  设为周期性任务
                </span>
              </label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-4 border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    重复频率
                  </label>
                  <select
                    value={recurrenceFrequency}
                    onChange={(e) =>
                      setRecurrenceFrequency(
                        e.target.value as RecurrenceFrequency
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isLoading}
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    间隔
                  </label>
                  <input
                    type="number"
                    value={recurrenceInterval}
                    onChange={(e) =>
                      setRecurrenceInterval(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '处理中...' : task ? '更新任务' : '创建任务'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
