import { apiClient } from '../lib/api-client';
import type { Comment, NewComment, CommentFilters } from '../types/comment';

export const commentService = {
  /**
   * 获取评论列表
   */
  async getComments(filters?: CommentFilters): Promise<Comment[]> {
    const params = new URLSearchParams();

    if (filters?.taskId) {
      params.append('taskId', filters.taskId.toString());
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.targetUserId) {
      params.append('targetUserId', filters.targetUserId.toString());
    }
    if (filters?.isDailyComment !== undefined) {
      params.append('isDailyComment', filters.isDailyComment.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/api/comments?${queryString}` : '/api/comments';

    const response = await apiClient.get<Comment[]>(url);
    return response.data;
  },

  /**
   * 创建评论
   */
  async createComment(data: NewComment): Promise<Comment> {
    const response = await apiClient.post<Comment>('/api/comments', data);
    return response.data;
  },

  /**
   * 更新评论
   */
  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/api/comments/${id}`, {
      content,
    });
    return response.data;
  },

  /**
   * 删除评论
   */
  async deleteComment(id: number): Promise<void> {
    await apiClient.delete(`/api/comments/${id}`);
  },
};
