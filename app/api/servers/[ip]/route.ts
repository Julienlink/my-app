export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, errorResponse, isValidIp } from '@/lib/security';

export async function GET(req: NextRequest, { params }: { params: { ip: string } }) {
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

    const server = await prisma.server.findUnique({
      where: { ip },
      include: {
        computerStatus: true,
        actions: { take: 10 },
        _count: {
          select: { actions: true },
        },
      },
    });

    if (!server) {
      return errorResponse('Serveur non trouvé', 404);
    }

    return NextResponse.json(
      {
        success: true,
        data: server,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/servers/[ip] error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { ip: string } }) {
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
    const { name, status, url } = body;

    // Valider le status s'il est fourni
    if (status && !['ON', 'OFF'].includes(status)) {
      return errorResponse('Status doit être ON ou OFF', 400);
    }

    // Valider l'URL s'il est fourni
    if (url) {
      try {
        new URL(url);
      } catch {
        return errorResponse('Format URL invalide', 400);
      }
    }

    const server = await prisma.server.update({
      where: { ip },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(url && { url }),
      },
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
    console.error('PUT /api/servers/[ip] error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { ip: string } }) {
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
    
    await prisma.server.delete({
      where: { ip },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Serveur supprimé',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/servers/[ip] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}
