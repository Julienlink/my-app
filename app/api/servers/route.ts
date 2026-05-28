export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, validateRequiredFields, errorResponse, isValidIp } from '@/lib/security';



export async function GET(req: NextRequest) {
  try {
    // Authentification optionnelle pour GET
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }

    const servers = await prisma.server.findMany({
      include: {
        computerStatus: true,
        actions: {
          where: { status: 'pending' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: servers,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/servers error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentification
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }

    const body = await req.json();

    // Valider les champs requis
    const validation = validateRequiredFields(body, ['ip', 'name', 'status', 'url']);
    if (!validation.isValid) {
      return errorResponse(validation.error, 400);
    }

    const { ip, name, status, url } = body;

    // Valider le format IP
    if (!isValidIp(ip)) {
      return errorResponse('Format IP invalide', 400);
    }

    // Valider le status
    if (!['ON', 'OFF'].includes(status)) {
      return errorResponse('Status doit être ON ou OFF', 400);
    }

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return errorResponse('Format URL invalide', 400);
    }

    const server = await prisma.server.create({
      data: {
        ip,
        name,
        status,
        url,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: server,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/servers error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}
