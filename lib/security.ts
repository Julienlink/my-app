import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY || 'default-dev-key';

export interface ValidatedRequest {
  isValid: boolean;
  error?: string;
  ip?: string;
}

/**
 * Valider la requête (authentification + IP)
 */
export function validateRequest(req: NextRequest): ValidatedRequest {
  // Vérifier l'API key
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
    return {
      isValid: false,
      error: 'Authentification requise: fournir X-API-Key header key: '+ apiKey,
    };
  }

  // Récupérer l'IP du client
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  return {
    isValid: true,
    ip,
  };
}

/**
 * Valider le format d'une adresse IP
 */
export function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const localhostRegex = /^localhost$|^127\.0\.0\.1$|^::1$|^::ffff:127\.0\.0\.1$/;
  
  if (localhostRegex.test(ip)) return true;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }
  
  return false;
}

/**
 * Valider le format d'une chaîne JSON
 */
export function isValidJson(obj: unknown): boolean {
  return obj !== null && typeof obj === 'object';
}

/**
 * Valider les champs requis dans un objet
 */
export function validateRequiredFields(data: object, fields: string[]): { isValid: boolean; error?: string } {
  const record = data as Record<string, unknown>;
  for (const field of fields) {
    if (record[field] === undefined || record[field] === null || record[field] === '') {
      return {
        isValid: false,
        error: `Champ requis manquant: ${field}`,
      };
    }
  }
  return { isValid: true };
}

/**
 * Nettoyer une chaîne de caractères
 */
export function sanitizeString(str: string): string {
  return str.replace(/[^\w\s-]/g, '').substring(0, 255);
}

/**
 * Créer une réponse d'erreur standard
 */
export function errorResponse(message: string = 'Requête invalide', status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Créer une réponse de succès standard
 */
export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
