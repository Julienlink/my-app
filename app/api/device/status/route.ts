export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, validateRequiredFields, errorResponse, isValidIp } from '@/lib/security';

interface ComputerStatusInput {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  isScreenOn: boolean;
  isKioskMode: boolean;
  lastHeartbeat: string;
}

interface DeviceStatusRequest {
  deviceId: string;
  currentUrl: string;
  computerStatus: ComputerStatusInput;
  timestamp: string;
  serviceVersion: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authentification et récupération de l'IP
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }
    
    const clientIp = auth.ip || '127.0.0.1';
    
    // Valider l'IP
    if (!isValidIp(clientIp)) {
      return errorResponse('Adresse IP invalide', 400);
    }
    
    const body: DeviceStatusRequest = await req.json();
    console.log("👉 [Status API] Received body:", JSON.stringify(body, null, 2));
    
    // Valider les données requises
    const validation = validateRequiredFields(body, ['deviceId', 'computerStatus', 'timestamp']);
    if (!validation.isValid) {
      console.log("❌ [Status API] Validation failed on required fields:", validation.error);
      return errorResponse(validation.error, 400);
    }
    
    // Valider la structure de computerStatus
    if (!body.computerStatus.uptime || typeof body.computerStatus.cpuUsage !== 'number' || 
        typeof body.computerStatus.memoryUsage !== 'number') {
      console.log("❌ [Status API] Validation failed on computerStatus properties:", {
        uptime: body.computerStatus.uptime,
        cpuUsage: body.computerStatus.cpuUsage,
        memoryUsage: body.computerStatus.memoryUsage,
        uptimeType: typeof body.computerStatus.uptime,
        cpuUsageType: typeof body.computerStatus.cpuUsage,
        memoryUsageType: typeof body.computerStatus.memoryUsage
      });
      return errorResponse('Format computerStatus invalide', 400);
    }
    
    // Upsert Server
    await prisma.server.upsert({
      where: { ip: clientIp },
      create: {
        ip: clientIp,
        name: body.deviceId,
        deviceId: body.deviceId,
        currentUrl: body.currentUrl,
        status: 'ON',
        url: body.currentUrl,
        serviceVersion: body.serviceVersion,
        lastHeartbeat: new Date(body.timestamp),
      },
      update: {
        deviceId: body.deviceId,
        currentUrl: body.currentUrl,
        lastHeartbeat: new Date(body.timestamp),
        status: 'ON',
      },
    });
    
    // Upsert ComputerStatus
    await prisma.computerStatus.upsert({
      where: { ip: clientIp },
      create: {
        ip: clientIp,
        uptime: body.computerStatus.uptime,
        cpuUsage: body.computerStatus.cpuUsage,
        memoryUsage: body.computerStatus.memoryUsage,
        isScreenOn: body.computerStatus.isScreenOn,
        isKioskMode: body.computerStatus.isKioskMode,
        lastHeartbeat: new Date(body.computerStatus.lastHeartbeat),
        timestamp: new Date(body.timestamp),
      },
      update: {
        uptime: body.computerStatus.uptime,
        cpuUsage: body.computerStatus.cpuUsage,
        memoryUsage: body.computerStatus.memoryUsage,
        isScreenOn: body.computerStatus.isScreenOn,
        isKioskMode: body.computerStatus.isKioskMode,
        lastHeartbeat: new Date(body.computerStatus.lastHeartbeat),
        updatedAt: new Date(body.timestamp),
      },
    });
    
    // Récupérer les actions pending
    const actions = await prisma.action.findMany({
      where: {
        ip: clientIp,
        status: 'pending',
        OR: [
          { executeAt: null },
          { executeAt: { lte: new Date() } },
        ],
      },
      orderBy: { priority: 'desc' },
      take: 10,
    });
    
    // Retourner la réponse
    return NextResponse.json(
      {
        success: true,
        message: 'Status reçu avec succès',
        actions: actions.map(a => ({
          id: a.actionId,
          type: a.type,
          parameters: a.parameters,
          priority: a.priority,
          executeAt: a.executeAt,
        })),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/device/status error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}
