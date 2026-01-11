// KISS Reflection types
export interface KissReflection {
  id: number;
  userId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  keep: string | null; // What went well
  improve: string | null; // What could be improved
  start: string | null; // What to start doing
  stop: string | null; // What to stop doing
  createdAt: Date | string;
}

export interface CreateKissReflectionInput {
  date: string;
  keep?: string;
  improve?: string;
  start?: string;
  stop?: string;
}

export interface UpdateKissReflectionInput {
  keep?: string;
  improve?: string;
  start?: string;
  stop?: string;
}

export interface KissReflectionResponse {
  reflection: KissReflection | null;
}

export interface KissUnlockStatus {
  isUnlocked: boolean;
  totalTasks: number;
  completedTasks: number;
  canRetroactivelyFill: boolean;
}

export interface CreateKissReflectionResponse {
  message: string;
  reflection: KissReflection;
}
