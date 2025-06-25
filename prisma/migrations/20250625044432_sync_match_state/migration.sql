-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "currentTurnPlayerId" TEXT,
ADD COLUMN     "firstPlayerId" TEXT,
ADD COLUMN     "isStarted" BOOLEAN DEFAULT false,
ADD COLUMN     "timerDuration" INTEGER,
ADD COLUMN     "timerStart" TIMESTAMP(3);
