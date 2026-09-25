-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NULL,
    `password_hash` VARCHAR(255) NULL,
    `role` ENUM('READER', 'ADMIN') NOT NULL DEFAULT 'READER',
    `status` ENUM('PENDING', 'ACTIVE') NOT NULL DEFAULT 'PENDING',
    `activated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
