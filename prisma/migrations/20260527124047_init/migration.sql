-- CreateTable
CREATE TABLE "Server" (
    "ip" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFF',
    "url" TEXT NOT NULL,
    "deviceId" TEXT,
    "currentUrl" TEXT,
    "lastHeartbeat" DATETIME,
    "serviceVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ComputerStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "uptime" TEXT NOT NULL,
    "cpuUsage" REAL NOT NULL,
    "memoryUsage" REAL NOT NULL,
    "isScreenOn" BOOLEAN NOT NULL DEFAULT true,
    "isKioskMode" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComputerStatus_ip_fkey" FOREIGN KEY ("ip") REFERENCES "Server" ("ip") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "executeAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "executedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_ip_fkey" FOREIGN KEY ("ip") REFERENCES "Server" ("ip") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActionResult_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("actionId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ComputerStatus_ip_key" ON "ComputerStatus"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Action_actionId_key" ON "Action"("actionId");

-- CreateIndex
CREATE INDEX "Action_ip_idx" ON "Action"("ip");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ActionResult_actionId_key" ON "ActionResult"("actionId");
