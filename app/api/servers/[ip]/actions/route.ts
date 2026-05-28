export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, validateRequiredFields, errorResponse, isValidIp } from '@/lib/security';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ip: string }> }
) {
  try {
    // Authentification
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }

    const ip = decodeURIComponent((await params).ip);
    
    // Valider l'IP
    if (!isValidIp(ip)) {
      return errorResponse('Adresse IP invalide', 400);
    }
    
    const body = await req.json();
    
    // Valider les données requises
    const validation = validateRequiredFields(body, ['type']);
    if (!validation.isValid) {
      return errorResponse(validation.error, 400);
    }
    
    // Valider le type d'action
    const validTypes = ['ChangeUrl', 'Reboot', 'Screenshot', 'ToggleKioskMode', 'UpdateConfig'];
    if (!validTypes.includes(body.type)) {
      return errorResponse(`Type d'action invalide. Valides: ${validTypes.join(', ')}`, 400);
    }
    
    // Vérifier que le Server existe
    const server = await prisma.server.findUnique({
      where: { ip },
    });
    
    if (!server) {
      return errorResponse('Serveur non trouvé', 404);
    }
    
    // Créer l'action
    const action = await prisma.action.create({
      data: {
        ip,
        actionId: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: body.type,
        parameters: body.parameters || {},
        priority: Math.min(Math.max(body.priority || 0, 0), 100),
        executeAt: body.executeAt ? new Date(body.executeAt) : null,
        status: 'pending',
        createdBy: auth.ip,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        data: action,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/servers/[ip]/actions error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}
