export type ProgressType = 'boolean' | 'numeric' | 'percentage';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  progressType: ProgressType;
  progressValue: number;
  maxProgress?: number | null;
  isRecurring: boolean;
  recurrencePattern?: string | null; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  date: string;
  progressType: ProgressType;
  maxProgress?: number;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  date?: string;
  progressType?: ProgressType;
  progressValue?: number;
  maxProgress?: number;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}
