/*
  Warnings:

  - You are about to drop the column `notes` on the `MatchEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MatchEvent` DROP COLUMN `notes`,
    MODIFY `minute` INTEGER NOT NULL DEFAULT 0;

-- RenameIndex
ALTER TABLE `MatchEvent` RENAME INDEX `MatchEvent_matchId_fkey` TO `MatchEvent_matchId_idx`;

-- RenameIndex
ALTER TABLE `MatchEvent` RENAME INDEX `MatchEvent_playerId_fkey` TO `MatchEvent_playerId_idx`;

-- RenameIndex
ALTER TABLE `MatchEvent` RENAME INDEX `MatchEvent_teamId_fkey` TO `MatchEvent_teamId_idx`;
