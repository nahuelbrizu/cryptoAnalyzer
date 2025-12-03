CREATE TABLE `cryptocurrencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`cmcId` int,
	`marketCap` decimal(20,2),
	`volume24h` decimal(20,2),
	`dominance` decimal(5,2),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cryptocurrencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `cryptocurrencies_symbol_unique` UNIQUE(`symbol`),
	CONSTRAINT `cryptocurrencies_cmcId_unique` UNIQUE(`cmcId`)
);
--> statement-breakpoint
CREATE TABLE `investmentScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cryptocurrencyId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`technicalScore` decimal(5,2),
	`momentumScore` decimal(5,2),
	`volatilityScore` decimal(5,2),
	`riskScore` decimal(5,2),
	`overallScore` decimal(5,2),
	`recommendation` enum('strong_buy','buy','hold','sell','strong_sell') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investmentScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cryptocurrencyId` int NOT NULL,
	`quantity` decimal(20,8) NOT NULL,
	`averageBuyPrice` decimal(18,8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cryptocurrencyId` int NOT NULL,
	`targetPrice` decimal(18,8) NOT NULL,
	`alertType` enum('above','below') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`triggered` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `priceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cryptocurrencyId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`open` decimal(18,8) NOT NULL,
	`high` decimal(18,8) NOT NULL,
	`low` decimal(18,8) NOT NULL,
	`close` decimal(18,8) NOT NULL,
	`volume` decimal(20,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technicalIndicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cryptocurrencyId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`rsi14` decimal(5,2),
	`macdValue` decimal(10,6),
	`macdSignal` decimal(10,6),
	`macdHistogram` decimal(10,6),
	`sma20` decimal(18,8),
	`sma50` decimal(18,8),
	`sma200` decimal(18,8),
	`bollingerUpper` decimal(18,8),
	`bollingerMiddle` decimal(18,8),
	`bollingerLower` decimal(18,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `technicalIndicators_id` PRIMARY KEY(`id`)
);
