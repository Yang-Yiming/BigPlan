import type { Comment } from '../types/comment';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
  currentUserId: number;
  onDelete: (id: number) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: CommentItemProps) {
  const isOwnComment = comment.userId === currentUserId;

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      {/* 用户头像 */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* 评论内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {comment.user?.username || '未知用户'}
          </span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* 删除按钮 */}
      {isOwnComment && (
        <button
          onClick={() => onDelete(comment.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
          title="删除评论"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
