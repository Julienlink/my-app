export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test de connexion à la BDD
    const count = await prisma.server.count();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connexion à la BDD réussie',
        serverCount: count,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Database connection error:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur de connexion à la BDD',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
