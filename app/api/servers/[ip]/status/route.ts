export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, validateRequiredFields, errorResponse, isValidIp } from '@/lib/security';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { ip: string } }
) {
  try {
    // Authentification
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }

    const ip = decodeURIComponent(params.ip);

    // Valider l'IP
    if (!isValidIp(ip)) {
      return errorResponse('Adresse IP invalide', 400);
    }

    const body = await req.json();

    // Valider les champs requis
    const validation = validateRequiredFields(body, ['status']);
    if (!validation.isValid) {
      return errorResponse(validation.error, 400);
    }

    const { status } = body;

    if (!['ON', 'OFF'].includes(status)) {
      return errorResponse('Status invalide. Doit être ON ou OFF', 400);
    }

    const server = await prisma.server.update({
      where: { ip },
      data: { status },
    });

    return NextResponse.json(
      {
        success: true,
        data: server,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH /api/servers/[ip]/status error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}
