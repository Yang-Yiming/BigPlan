import { apiClient } from '../lib/api-client';
import type { Comment, NewComment, CommentFilters } from '../types/comment';

export const commentService = {
  /**
   * 获取评论列表
   */
  async getComments(filters?: CommentFilters): Promise<Comment[]> {
    // 如果是全天评论，使用 /daily 端点
    if (filters?.isDailyComment) {
      const params = new URLSearchParams();

      if (filters.targetUserId) {
        params.append('userId', filters.targetUserId.toString());
      }
      if (filters.date) {
        params.append('date', filters.date);
      }

      const response = await apiClient.get<{ comments: Comment[] }>(`/comments/daily?${params.toString()}`);
      return response.data.comments;
    }

    // 如果是任务评论，使用 /task/:taskId 端点
    if (filters?.taskId) {
      const response = await apiClient.get<{ comments: Comment[] }>(`/comments/task/${filters.taskId}`);
      return response.data.comments;
    }

    // 默认返回空数组
    return [];
  },

  /**
   * 创建评论
   */
  async createComment(data: NewComment): Promise<Comment> {
    const response = await apiClient.post<Comment>('/comments', data);
    return response.data;
  },

  /**
   * 更新评论
   */
  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/comments/${id}`, {
      content,
    });
    return response.data;
  },

  /**
   * 删除评论
   */
  async deleteComment(id: number): Promise<void> {
    await apiClient.delete(`/comments/${id}`);
  },
};
