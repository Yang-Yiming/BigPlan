ALTER TABLE `groups` ADD `owner_id` integer NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_tasks_user_date` ON `tasks` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_tasks_user_recurring` ON `tasks` (`user_id`,`is_recurring`);--> statement-breakpoint
CREATE INDEX `idx_tasks_created_at` ON `tasks` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_target_date` ON `comments` (`target_user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_comments_task` ON `comments` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_daily` ON `comments` (`target_user_id`,`is_daily_comment`,`date`);