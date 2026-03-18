CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`driverId` int NOT NULL,
	`tripId` varchar(64),
	`lastMessage` text,
	`lastMessageTime` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('user','driver') NOT NULL,
	`content` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`driverId` int,
	`pickupLocation` text NOT NULL,
	`dropoffLocation` text NOT NULL,
	`pickupLat` varchar(20),
	`pickupLng` varchar(20),
	`dropoffLat` varchar(20),
	`dropoffLng` varchar(20),
	`vehicleType` varchar(50),
	`estimatedPrice` int,
	`actualPrice` int,
	`status` enum('searching','accepted','arriving','in_progress','completed','cancelled') NOT NULL DEFAULT 'searching',
	`startTime` timestamp,
	`endTime` timestamp,
	`rating` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`),
	CONSTRAINT `trips_tripId_unique` UNIQUE(`tripId`)
);
