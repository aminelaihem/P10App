-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "pictureAvatarUrl" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "sharedLink" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "avatarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLeague" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GP" (
    "id" TEXT NOT NULL,
    "idApiRace" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "GP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "idApiTrack" INTEGER NOT NULL,
    "countryName" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "pictureCountryUrl" TEXT,
    "pictureTrackUrl" TEXT,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilote" (
    "id" TEXT NOT NULL,
    "idApiPilote" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "nameAcronym" TEXT NOT NULL,

    CONSTRAINT "Pilote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ecurie" (
    "id" TEXT NOT NULL,
    "idApiEcurie" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "color" TEXT,

    CONSTRAINT "Ecurie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PiloteEcurie" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "piloteId" TEXT NOT NULL,
    "ecurieId" TEXT NOT NULL,

    CONSTRAINT "PiloteEcurie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GPPilote" (
    "id" TEXT NOT NULL,
    "gpId" TEXT NOT NULL,
    "piloteId" TEXT NOT NULL,
    "ecurieId" TEXT NOT NULL,

    CONSTRAINT "GPPilote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GPClassement" (
    "id" TEXT NOT NULL,
    "isDNF" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,
    "gpId" TEXT NOT NULL,
    "gpPiloteId" TEXT NOT NULL,

    CONSTRAINT "GPClassement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetSelectionResult" (
    "id" TEXT NOT NULL,
    "pointsP10" INTEGER,
    "pointsDNF" INTEGER,
    "userId" TEXT NOT NULL,
    "gpId" TEXT NOT NULL,
    "piloteP10Id" TEXT,
    "piloteDNFId" TEXT,

    CONSTRAINT "BetSelectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "League_sharedLink_key" ON "League"("sharedLink");

-- CreateIndex
CREATE UNIQUE INDEX "UserLeague_leagueId_userId_key" ON "UserLeague"("leagueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GP_idApiRace_key" ON "GP"("idApiRace");

-- CreateIndex
CREATE UNIQUE INDEX "Track_idApiTrack_key" ON "Track"("idApiTrack");

-- CreateIndex
CREATE UNIQUE INDEX "Pilote_idApiPilote_key" ON "Pilote"("idApiPilote");

-- CreateIndex
CREATE UNIQUE INDEX "Ecurie_idApiEcurie_key" ON "Ecurie"("idApiEcurie");

-- CreateIndex
CREATE UNIQUE INDEX "BetSelectionResult_userId_gpId_key" ON "BetSelectionResult"("userId", "gpId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeague" ADD CONSTRAINT "UserLeague_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeague" ADD CONSTRAINT "UserLeague_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GP" ADD CONSTRAINT "GP_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiloteEcurie" ADD CONSTRAINT "PiloteEcurie_piloteId_fkey" FOREIGN KEY ("piloteId") REFERENCES "Pilote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiloteEcurie" ADD CONSTRAINT "PiloteEcurie_ecurieId_fkey" FOREIGN KEY ("ecurieId") REFERENCES "Ecurie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPPilote" ADD CONSTRAINT "GPPilote_gpId_fkey" FOREIGN KEY ("gpId") REFERENCES "GP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPPilote" ADD CONSTRAINT "GPPilote_piloteId_fkey" FOREIGN KEY ("piloteId") REFERENCES "Pilote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPPilote" ADD CONSTRAINT "GPPilote_ecurieId_fkey" FOREIGN KEY ("ecurieId") REFERENCES "Ecurie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPClassement" ADD CONSTRAINT "GPClassement_gpId_fkey" FOREIGN KEY ("gpId") REFERENCES "GP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPClassement" ADD CONSTRAINT "GPClassement_gpPiloteId_fkey" FOREIGN KEY ("gpPiloteId") REFERENCES "GPPilote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSelectionResult" ADD CONSTRAINT "BetSelectionResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSelectionResult" ADD CONSTRAINT "BetSelectionResult_gpId_fkey" FOREIGN KEY ("gpId") REFERENCES "GP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSelectionResult" ADD CONSTRAINT "BetSelectionResult_piloteP10Id_fkey" FOREIGN KEY ("piloteP10Id") REFERENCES "Pilote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSelectionResult" ADD CONSTRAINT "BetSelectionResult_piloteDNFId_fkey" FOREIGN KEY ("piloteDNFId") REFERENCES "Pilote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
