CREATE TABLE IF NOT EXISTS `smart_home_devices` (
	`deviceKey` varchar(32) NOT NULL,
	`lightOn` boolean NOT NULL DEFAULT false,
	`climateOn` boolean NOT NULL DEFAULT false,
	`temperature` int NOT NULL DEFAULT 22,
	`hoodOn` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smart_home_devices_deviceKey` PRIMARY KEY(`deviceKey`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `smart_home_sync` (
	`id` int NOT NULL,
	`revision` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smart_home_sync_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT IGNORE INTO `smart_home_devices` (`deviceKey`, `lightOn`, `climateOn`, `temperature`, `hoodOn`) VALUES
	('sala', true, true, 22, false),
	('jantar', false, false, 23, false),
	('cozinha', true, false, 23, false),
	('escritorio', true, true, 22, false),
	('lavanderia', false, false, 24, false),
	('garagem', false, false, 25, false),
	('suite', false, true, 21, false),
	('quarto2', false, false, 22, false),
	('quarto3', false, false, 22, false),
	('churrasqueira', false, false, 24, false),
	('lavabo', false, false, 23, false),
	('banheiro', false, false, 23, false),
	('banhoSuite', false, false, 22, false),
	('jardim', false, false, 24, false);
--> statement-breakpoint
INSERT IGNORE INTO `smart_home_sync` (`id`, `revision`) VALUES (1, 0);
