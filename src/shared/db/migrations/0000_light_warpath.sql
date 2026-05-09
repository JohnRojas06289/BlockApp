CREATE TABLE `coin_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`current_price` real NOT NULL,
	`market_cap` real,
	`market_cap_rank` integer,
	`price_change_24h` real,
	`price_change_percentage_24h` real,
	`high_24h` real,
	`low_24h` real,
	`total_volume` real,
	`circulating_supply` real,
	`cached_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `coin_rank_idx` ON `coin_assets` (`market_cap_rank`);--> statement-breakpoint
CREATE TABLE `sync_metadata` (
	`resource_key` text PRIMARY KEY NOT NULL,
	`last_synced_at` integer NOT NULL,
	`ttl_ms` integer DEFAULT 300000 NOT NULL,
	`status` text DEFAULT 'success' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wallet_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`blockchain` text NOT NULL,
	`label` text,
	`balance_native` text,
	`balance_usd` real,
	`total_received` text,
	`total_sent` text,
	`transaction_count` integer,
	`cached_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_addresses_address_unique` ON `wallet_addresses` (`address`);--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`hash` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`blockchain` text NOT NULL,
	`block_number` integer,
	`timestamp` integer NOT NULL,
	`direction` text NOT NULL,
	`from_address` text,
	`to_address` text,
	`value_native` text NOT NULL,
	`value_usd` real,
	`fee_native` text,
	`fee_usd` real,
	`status` text NOT NULL,
	`cached_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `wallet_addresses`(`address`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tx_wallet_idx` ON `wallet_transactions` (`wallet_address`);--> statement-breakpoint
CREATE INDEX `tx_timestamp_idx` ON `wallet_transactions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `tx_wallet_timestamp_idx` ON `wallet_transactions` (`wallet_address`,`timestamp`);