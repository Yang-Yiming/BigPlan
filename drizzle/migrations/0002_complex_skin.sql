ALTER TABLE `tasks` ADD `max_occurrences` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `parent_task_id` integer REFERENCES tasks(id);--> statement-breakpoint
CREATE INDEX `idx_tasks_parent` ON `tasks` (`parent_task_id`);