import type { Task } from '../types/task';
import { CommentList } from './CommentList';
import { EmptyState, EmptyStateIcons } from './EmptyState';

interface TaskCommentsPanelProps {
  task: Task | null;
  currentUserId: number;
  targetUserId: number;
  selectedDate: string;
  isSelected: boolean;
}

export function TaskCommentsPanel({
  task,
  currentUserId,
  targetUserId,
  selectedDate,
  isSelected,
}: TaskCommentsPanelProps) {
  if (!task) {
    return (
      <div className="sticky top-4">
        <EmptyState
          icon={EmptyStateIcons.Comments}
          title="选择一个任务"
          description="将鼠标悬停在任务上查看评论，点击任务可以固定显示"
        />
      </div>
    );
  }

  return (
    <div
      key={task.id}
      className={`animate-fade-in bg-white rounded-2xl border-2 transition-all duration-300 p-6 sticky top-4 ${
        isSelected
          ? 'border-primary-500 shadow-lg shadow-primary-100'
          : 'border-[#e4e4e7] shadow-md'
      }`}
    >
      {/* Task Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}
        {isSelected && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            已锁定
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto px-1 py-2">
        <CommentList
          filters={{
            taskId: task.id,
            date: selectedDate,
            targetUserId,
            isDailyComment: false,
          }}
          currentUserId={currentUserId}
          autoRefresh={true}
          refreshInterval={15000}
          showForm={true}
        />
      </div>
    </div>
  );
}
