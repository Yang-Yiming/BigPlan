import { useState, useEffect, useCallback } from 'react';
import type { Comment, NewComment, CommentFilters } from '../types/comment';
import { commentService } from '../services/comment.service';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmDialogContext';

interface CommentListProps {
  filters: CommentFilters;
  currentUserId: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // 自动刷新间隔（毫秒）
  showForm?: boolean;
  onCommentAdded?: () => void;
}

export function CommentList({
  filters,
  currentUserId,
  autoRefresh = false,
  refreshInterval = 10000, // 默认10秒
  showForm = true,
  onCommentAdded,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // 加载评论
  const loadComments = useCallback(async () => {
    try {
      setError(null);
      const data = await commentService.getComments(filters);
      setComments(data);
    } catch (err) {
      console.error('加载评论失败:', err);
      setError('加载评论失败');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 初始加载
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      loadComments();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadComments]);

  // 创建评论
  const handleCreateComment = async (content: string) => {
    try {
      const newComment: NewComment = {
        targetUserId: filters.targetUserId || currentUserId,
        taskId: filters.taskId,
        date: filters.date || new Date().toISOString().split('T')[0],
        content,
        isDailyComment: filters.isDailyComment || false,
      };

      await commentService.createComment(newComment);
      await loadComments();
      onCommentAdded?.();
      showToast('评论已添加', 'success', 2000);
    } catch (err) {
      showToast('添加评论失败', 'error');
    }
  };

  // 删除评论
  const handleDeleteComment = async (id: number) => {
    const confirmed = await confirm({
      title: '删除评论',
      message: '确定要删除这条评论吗？',
      confirmText: '删除',
      cancelText: '取消',
      type: 'warning',
    });

    if (!confirmed) return;

    try {
      await commentService.deleteComment(id);
      await loadComments();
      showToast('评论已删除', 'success');
    } catch (err) {
      showToast('删除评论失败', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => loadComments()}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 评论表单 */}
      {showForm && (
        <div className="pb-3 border-b border-gray-200">
          <CommentForm onSubmit={handleCreateComment} />
        </div>
      )}

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          还没有评论，来发表第一条评论吧
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
