import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

const PORT = process.env.WS_PORT || 8080;

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  id?: string;
}

// Créer le serveur WebSocket
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`WebSocket serveur démarré sur ws://localhost:${PORT}`);

// Gestion de la connexion
wss.on('connection', (ws: ExtendedWebSocket, req: IncomingMessage) => {
  ws.id = `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  ws.isAlive = true;

  console.log(`Client connecté: ${ws.id}`);

  // Répondre à un ping
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Gérer les messages reçus
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Message reçu de ${ws.id}:`, message);

      // Echo du message à tous les clients
      wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              from: ws.id,
              timestamp: new Date().toISOString(),
              data: message,
            })
          );
        }
      });
    } catch (error) {
      console.error('Erreur parsing message:', error);
      ws.send(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });

  // Gérer la déconnexion
  ws.on('close', () => {
    console.log(`Client déconnecté: ${ws.id}`);
  });

  // Gérer les erreurs
  ws.on('error', (error) => {
    console.error(`Erreur WebSocket ${ws.id}:`, error);
  });
});

// Heartbeat pour détecter les connexions mortes
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws: ExtendedWebSocket) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Chaque 30 secondes

// Arrêt du serveur
wss.on('close', () => {
  clearInterval(heartbeat);
  console.log('Serveur WebSocket fermé');
});

export default wss;
