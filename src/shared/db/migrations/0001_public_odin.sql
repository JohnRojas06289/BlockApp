CREATE TABLE `asset_history_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` text NOT NULL,
	`range` text NOT NULL,
	`metric` text NOT NULL,
	`timestamp` integer NOT NULL,
	`value` real NOT NULL,
	`cached_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `coin_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `history_asset_idx` ON `asset_history_points` (`asset_id`);--> statement-breakpoint
CREATE INDEX `history_asset_range_metric_idx` ON `asset_history_points` (`asset_id`,`range`,`metric`);--> statement-breakpoint
CREATE INDEX `history_asset_timestamp_idx` ON `asset_history_points` (`asset_id`,`timestamp`);--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `price_change_percentage_1h` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `price_change_percentage_7d` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `price_change_percentage_30d` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `market_cap_change_percentage_24h` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `total_supply` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `max_supply` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `fully_diluted_valuation` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `ath` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `ath_change_percentage` real;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `ath_date` text;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `sparkline_7d` text;--> statement-breakpoint
ALTER TABLE `coin_assets` ADD `last_updated` text;