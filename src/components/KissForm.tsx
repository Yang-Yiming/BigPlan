import { useState, useEffect } from 'react';
import type { KissReflection, KissUnlockStatus } from '../types';

interface KissFormProps {
  reflection?: KissReflection | null;
  selectedDate: string;
  unlockStatus: KissUnlockStatus;
  onSubmit: (data: KissFormData) => Promise<void>;
  onPlanNextDay?: () => void;
}

export interface KissFormData {
  date: string;
  keep?: string;
  improve?: string;
  start?: string;
  stop?: string;
}

export function KissForm({
  reflection,
  selectedDate,
  unlockStatus,
  onSubmit,
  onPlanNextDay,
}: KissFormProps) {
  const [keep, setKeep] = useState(reflection?.keep || '');
  const [improve, setImprove] = useState(reflection?.improve || '');
  const [start, setStart] = useState(reflection?.start || '');
  const [stop, setStop] = useState(reflection?.stop || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update form when reflection changes
  useEffect(() => {
    if (reflection) {
      setKeep(reflection.keep || '');
      setImprove(reflection.improve || '');
      setStart(reflection.start || '');
      setStop(reflection.stop || '');
    } else {
      setKeep('');
      setImprove('');
      setStart('');
      setStop('');
    }
    setError('');
    setSuccessMessage('');
  }, [reflection, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!unlockStatus.isUnlocked) {
      setError('请先完成当天的任务才能解锁复盘功能');
      return;
    }

    // Check if all fields are empty
    if (!keep.trim() && !improve.trim() && !start.trim() && !stop.trim()) {
      setError('请至少填写一个复盘项');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        date: selectedDate,
        keep: keep.trim() || undefined,
        improve: improve.trim() || undefined,
        start: start.trim() || undefined,
        stop: stop.trim() || undefined,
      });
      setSuccessMessage('复盘保存成功！');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !unlockStatus.isUnlocked || isLoading;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Unlock Status Banner */}
      {!unlockStatus.isUnlocked && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                复盘功能已锁定
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {unlockStatus.totalTasks === 0
                  ? '当天没有任务，但你仍然可以记录复盘'
                  : `请完成当天的所有任务以解锁复盘功能（已完成 ${unlockStatus.completedTasks}/${unlockStatus.totalTasks}）`}
              </p>
              {unlockStatus.canRetroactivelyFill && (
                <p className="mt-1 text-sm text-yellow-700">
                  由于这是过去的日期，你可以补充填写复盘内容
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KISS Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            KISS 复盘方法
          </h3>
          <p className="text-sm text-blue-700">
            通过四个简单的问题进行每日复盘，持续改进你的工作和生活：
          </p>
        </div>

        {/* Keep Section */}
        <div>
          <label htmlFor="keep" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-green-600">Keep</span> - 今天做得好的事情，需要继续保持
          </label>
          <textarea
            id="keep"
            value={keep}
            onChange={(e) => setKeep(e.target.value)}
            disabled={isDisabled}
            placeholder="例如：早起锻炼让我精力充沛，专注工作2小时完成了重要任务..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Improve Section */}
        <div>
          <label htmlFor="improve" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-blue-600">Improve</span> - 今天可以改进的地方
          </label>
          <textarea
            id="improve"
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            disabled={isDisabled}
            placeholder="例如：会议时间可以更精简，减少被打断的次数..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Start Section */}
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-purple-600">Start</span> - 明天开始尝试的新事物
          </label>
          <textarea
            id="start"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={isDisabled}
            placeholder="例如：开始使用番茄工作法，尝试晚上阅读30分钟..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Stop Section */}
        <div>
          <label htmlFor="stop" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-600">Stop</span> - 明天停止或避免的事情
          </label>
          <textarea
            id="stop"
            value={stop}
            onChange={(e) => setStop(e.target.value)}
            disabled={isDisabled}
            placeholder="例如：停止睡前刷手机，避免午餐后立即工作..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '保存中...' : reflection ? '更新复盘' : '保存复盘'}
          </button>

          {unlockStatus.isUnlocked && onPlanNextDay && (
            <button
              type="button"
              onClick={onPlanNextDay}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              规划明天任务
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
