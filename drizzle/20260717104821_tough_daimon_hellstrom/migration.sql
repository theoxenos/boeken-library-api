CREATE TABLE `users_to_books` (
	`user_id` integer,
	`book_id` integer,
	`status` text DEFAULT 'to-read' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	CONSTRAINT `fk_users_to_books_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_users_to_books_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
ALTER TABLE `notes` ADD `user_id` integer REFERENCES users(id);