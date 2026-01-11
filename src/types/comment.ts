export interface Comment {
  id: number;
  userId: number;
  targetUserId: number;
  taskId?: number | null;
  date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  isDailyComment: boolean;
  createdAt: Date;
  // 关联的用户信息（后端可能会返回）
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface NewComment {
  targetUserId: number;
  taskId?: number | null;
  date: string;
  content: string;
  isDailyComment: boolean;
}

export interface CommentFilters {
  taskId?: number;
  date?: string;
  targetUserId?: number;
  isDailyComment?: boolean;
}
