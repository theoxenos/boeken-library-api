PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_to_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`book_id` integer NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'to-read' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	CONSTRAINT `fk_users_to_books_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_to_books_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_users_to_books`(`id`, `user_id`, `book_id`, `rating`, `status`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `book_id`, `rating`, `status`, `created_at`, `updated_at` FROM `users_to_books`;--> statement-breakpoint
DROP TABLE `users_to_books`;--> statement-breakpoint
ALTER TABLE `__new_users_to_books` RENAME TO `users_to_books`;--> statement-breakpoint
PRAGMA foreign_keys=ON;