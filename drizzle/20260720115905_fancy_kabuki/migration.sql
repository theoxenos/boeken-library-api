ALTER TABLE `books` RENAME COLUMN `isbn` TO `isbn10`;--> statement-breakpoint
ALTER TABLE `books` ADD `isbn13` text;