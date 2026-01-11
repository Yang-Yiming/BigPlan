import type { DbClient } from '../../db/client';
import { tasks, type Task } from '../../db/schema/tasks';
import { eq, and, sql } from 'drizzle-orm';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
}

/**
 * 计算下一个周期性任务的日期
 * @param currentDate 当前日期 (YYYY-MM-DD)
 * @param pattern 周期性模式
 * @returns 下一个任务日期 (YYYY-MM-DD)
 */
export function calculateNextDate(
  currentDate: string,
  pattern: RecurrencePattern
): string {
  const date = new Date(currentDate);

  switch (pattern.frequency) {
    case 'daily':
      date.setDate(date.getDate() + pattern.interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + pattern.interval * 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + pattern.interval);
      break;
  }

  return date.toISOString().split('T')[0];
}

/**
 * 为指定日期生成周期性任务
 * @param db 数据库客户端
 * @param userId 用户 ID
 * @param targetDate 目标日期 (YYYY-MM-DD)
 */
export async function generateRecurringTasksForDate(
  db: DbClient,
  userId: number,
  targetDate: string
): Promise<Task[]> {
  // 获取所有周期性任务
  const recurringTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.isRecurring, true)));

  const generatedTasks: Task[] = [];

  for (const recurringTask of recurringTasks) {
    if (!recurringTask.recurrencePattern) continue;

    try {
      const pattern: RecurrencePattern = JSON.parse(
        recurringTask.recurrencePattern
      );

      // 检查目标日期是否应该生成任务
      if (shouldGenerateTask(recurringTask.date, targetDate, pattern)) {
        // 检查该日期是否已存在该任务的实例
        const existingTask = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, userId),
              eq(tasks.date, targetDate),
              eq(tasks.title, recurringTask.title),
              eq(tasks.isRecurring, false) // 只检查生成的任务实例
            )
          )
          .limit(1);

        if (existingTask.length === 0) {
          // 创建新的任务实例
          const [newTask] = await db
            .insert(tasks)
            .values({
              userId: recurringTask.userId,
              title: recurringTask.title,
              description: recurringTask.description,
              date: targetDate,
              progressType: recurringTask.progressType,
              progressValue: 0, // 重置进度
              maxProgress: recurringTask.maxProgress,
              isRecurring: false, // 生成的任务不是周期性的
              recurrencePattern: null,
            })
            .returning();

          generatedTasks.push(newTask);
        }
      }
    } catch (error) {
      console.error(
        `Error generating recurring task ${recurringTask.id}:`,
        error
      );
    }
  }

  return generatedTasks;
}

/**
 * 判断在目标日期是否应该生成周期性任务
 * @param startDate 任务开始日期
 * @param targetDate 目标日期
 * @param pattern 周期性模式
 * @returns 是否应该生成
 */
function shouldGenerateTask(
  startDate: string,
  targetDate: string,
  pattern: RecurrencePattern
): boolean {
  const start = new Date(startDate);
  const target = new Date(targetDate);

  // 如果目标日期在开始日期之前，不生成
  if (target < start) {
    return false;
  }

  // 如果是同一天，应该生成
  if (startDate === targetDate) {
    return true;
  }

  // 计算天数差
  const daysDiff = Math.floor(
    (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (pattern.frequency) {
    case 'daily':
      return daysDiff % pattern.interval === 0;

    case 'weekly':
      return daysDiff % (pattern.interval * 7) === 0;

    case 'monthly':
      // 对于月度任务，检查是否是相同的日期
      const monthsDiff =
        (target.getFullYear() - start.getFullYear()) * 12 +
        (target.getMonth() - start.getMonth());
      return (
        monthsDiff % pattern.interval === 0 &&
        target.getDate() === start.getDate()
      );

    default:
      return false;
  }
}

/**
 * 为日期范围生成周期性任务
 * @param db 数据库客户端
 * @param userId 用户 ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 */
export async function generateRecurringTasksForRange(
  db: DbClient,
  userId: number,
  startDate: string,
  endDate: string
): Promise<Task[]> {
  const allGeneratedTasks: Task[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const generatedTasks = await generateRecurringTasksForDate(
      db,
      userId,
      dateStr
    );
    allGeneratedTasks.push(...generatedTasks);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allGeneratedTasks;
}
