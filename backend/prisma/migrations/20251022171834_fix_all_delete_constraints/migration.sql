-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_venueId_fkey`;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `Venue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
