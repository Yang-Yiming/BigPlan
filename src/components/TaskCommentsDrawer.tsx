import type { Task } from '../types/task';
import { CommentList } from './CommentList';

interface TaskCommentsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  targetUserId: number;
  selectedDate: string;
}

export function TaskCommentsDrawer({
  task,
  isOpen,
  onClose,
  currentUserId,
  targetUserId,
  selectedDate,
}: TaskCommentsDrawerProps) {
  if (!task) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[85%] max-w-md
          bg-white shadow-2xl z-50 transform transition-transform duration-300
          lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Close comments"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Comments Content */}
        <div className="h-[calc(100vh-88px)] overflow-y-auto p-4">
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
    </>
  );
}
