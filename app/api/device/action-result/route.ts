export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest, validateRequiredFields, errorResponse } from '@/lib/security';

interface ActionResultRequest {
  actionId: string;
  success: boolean;
  message: string;
  executedAt: string;
  data?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    // Authentification
    const auth = validateRequest(req);
    if (!auth.isValid) {
      return errorResponse(auth.error || 'Non autorisé', 401);
    }
    
    const body: ActionResultRequest = await req.json();
    
    // Valider les données requises
    const validation = validateRequiredFields(body, ['actionId', 'success', 'message', 'executedAt']);
    if (!validation.isValid) {
      return errorResponse(validation.error, 400);
    }
    
    // Trouver l'action
    const action = await prisma.action.findUnique({
      where: { actionId: body.actionId },
    });
    
    if (!action) {
      return errorResponse('Action non trouvée', 404);
    }
    
    // Créer le résultat
    await prisma.actionResult.create({
      data: {
        actionId: body.actionId,
        success: body.success,
        message: body.message,
        executedAt: new Date(body.executedAt),
        data: body.data || {},
      },
    });
    
    // Mettre à jour le statut de l'action
    await prisma.action.update({
      where: { actionId: body.actionId },
      data: {
        status: body.success ? 'completed' : 'failed',
        executedAt: new Date(body.executedAt),
      },
    });
    
    // Retourner la réponse
    return NextResponse.json(
      { 
        success: true, 
        message: 'Résultat reçu',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/device/action-result error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur serveur',
      500
    );
  }
}
