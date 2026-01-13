import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { commentService } from '../services/comment.service';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmDialogContext';

interface TaskCardProps {
  task: Task;
  currentUserId: number;
  targetUserId: number;
  selectedDate: string;
  onUpdate?: (taskId: number, progressValue: number) => Promise<void>;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => Promise<void>;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (taskId: number | null) => void;
  onSelect?: (taskId: number) => void;
}

export function TaskCard({
  task,
  currentUserId: _currentUserId,
  targetUserId,
  selectedDate,
  onUpdate,
  onEdit,
  onDelete,
  isHovered = false,
  isSelected = false,
  onHover,
  onSelect,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const isReadOnly = !onUpdate || !onEdit || !onDelete;

  // 加载评论数量
  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const comments = await commentService.getComments({
          taskId: task.id,
          date: selectedDate,
          targetUserId,
        });
        setCommentCount(comments.length);
      } catch (error) {
        console.error('加载评论数量失败:', error);
      }
    };
    loadCommentCount();
  }, [task.id, selectedDate, targetUserId]);


  const handleProgressClick = async () => {
    if (task.progressType === 'boolean' && onUpdate) {
      try {
        const newValue = task.progressValue === 0 ? 1 : 0;
        await onUpdate(task.id, newValue);
        showToast(
          newValue === 1 ? '任务已完成' : '任务已标记为未完成',
          'success',
          2000
        );
      } catch {
        showToast('更新进度失败', 'error');
      }
    }
  };

  const handleNumericChange = async (value: number) => {
    if (onUpdate && task.maxProgress && value <= task.maxProgress && value >= 0) {
      try {
        await onUpdate(task.id, value);
        showToast('进度已更新', 'success', 2000);
      } catch {
        showToast('更新进度失败', 'error');
      }
    }
  };

  const handlePercentageChange = async (value: number) => {
    if (onUpdate && value <= 100 && value >= 0) {
      try {
        await onUpdate(task.id, value);
        showToast('进度已更新', 'success', 2000);
      } catch {
        showToast('更新进度失败', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = await confirm({
      title: '删除任务',
      message: `确定要删除任务"${task.title}"吗？此操作无法撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
    });

    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
        showToast('任务已删除', 'success');
      } catch {
        showToast('删除任务失败', 'error');
        setIsDeleting(false);
      }
    }
  };

  const renderProgressControl = () => {
    switch (task.progressType) {
      case 'boolean':
        return (
          <button
            onClick={handleProgressClick}
            disabled={isReadOnly}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              task.progressValue === 1
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-secondary-300 hover:border-primary-400'
            } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
            aria-label="Toggle completion"
          >
            {task.progressValue === 1 && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        );

      case 'numeric':
        return (
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={() =>
                  handleNumericChange(Math.max(0, task.progressValue - 1))
                }
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Decrease progress"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
            )}
            <div className="flex gap-1">
              {Array.from({ length: task.maxProgress || 0 }).map((_, index) => {
                const isCompleted = index < task.progressValue;
                return (
                  <button
                    key={index}
                    onClick={() => !isReadOnly && handleNumericChange(index + 1)}
                    disabled={isReadOnly}
                    className={`
                      w-6 h-6 rounded border-2 transition-all duration-300 ease-out
                      ${isCompleted
                        ? 'bg-primary-500 border-primary-500 scale-100'
                        : 'bg-white border-secondary-300 hover:border-primary-400 hover:scale-105'
                      }
                      ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    style={{
                      transitionDelay: isCompleted ? `${index * 30}ms` : '0ms',
                    }}
                    aria-label={`Set progress to ${index + 1}`}
                  />
                );
              })}
            </div>
            <span className="text-sm text-gray-600 min-w-[60px]">
              {task.progressValue} / {task.maxProgress}
            </span>
            {!isReadOnly && (
              <button
                onClick={() =>
                  handleNumericChange(
                    Math.min(task.maxProgress || 0, task.progressValue + 1)
                  )
                }
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Increase progress"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
            )}
          </div>
        );

      case 'percentage': {
        const percentage = task.maxProgress
          ? (task.progressValue / task.maxProgress) * 100
          : 0;
        return (
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 ease-out rounded-full relative"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
              </div>
            </div>
            <span className="text-sm text-gray-600 min-w-[50px] font-medium">
              {Math.round(percentage)}%
            </span>
            {!isReadOnly && (
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    handlePercentageChange(
                      Math.max(
                        0,
                        task.progressValue - (task.maxProgress || 100) / 10
                      )
                    )
                  }
                  className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Decrease progress"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    handlePercentageChange(
                      Math.min(
                        task.maxProgress || 100,
                        task.progressValue + (task.maxProgress || 100) / 10
                      )
                    )
                  }
                  className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Increase progress"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="relative">
      <div
        className={`
          bg-white rounded-2xl border-2 p-5
          transition-all duration-300 cursor-pointer
          ${isDeleting ? 'opacity-50' : ''}
          ${isSelected
            ? 'border-primary-500 shadow-lg shadow-primary-100 scale-[1.02] ring-2 ring-primary-200 ring-offset-2'
            : isHovered
              ? 'border-primary-300 shadow-md shadow-primary-50 scale-[1.01] -translate-y-0.5'
              : 'border-[#e4e4e7] hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5'
          }
        `}
        onMouseEnter={() => onHover?.(task.id)}
        onMouseLeave={() => onHover?.(null)}
        onClick={() => onSelect?.(task.id)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            {!isReadOnly && (
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => onEdit!(task)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label="Edit task"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  aria-label="Delete task"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}

          <div className="flex items-center gap-2">
            {renderProgressControl()}
          </div>

          {task.isRecurring && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>周期性任务</span>
              {task.recurrencePattern && (() => {
                try {
                  const pattern = JSON.parse(task.recurrencePattern);
                  if (pattern.maxOccurrences) {
                    return (
                      <span className="text-xs text-gray-400">
                        (最多 {pattern.maxOccurrences} 次)
                      </span>
                    );
                  }
                } catch {
                  // Ignore parse errors
                }
                return null;
              })()}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Comment Count Badge */}
      {commentCount > 0 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium border border-primary-200 pointer-events-none">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {commentCount}
        </div>
      )}
    </div>
  );
}
