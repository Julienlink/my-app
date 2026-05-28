# API Documentation - Kiosk Control Dashboard

## 🔐 Authentication

Tous les endpoints (sauf GET /api/servers) nécessitent une authentification via l'en-tête `X-API-Key`:

```bash
-H "X-API-Key: YOUR_API_KEY"
```

Récupérez votre API_KEY depuis le fichier `.env`.

## ⚠️ Important

**En développement**: API_KEY par défaut = `dev-key-change-in-production`
**En production**: Changez obligatoirement la valeur API_KEY dans les variables d'environnement!

Générez une clé forte:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Endpoints

### 1️⃣ GET /api/servers
Récupérer tous les serveurs avec leur statut et actions pending.

**Authentification**: Requise
**Réponse**: Array de serveurs avec `computerStatus` et `actions` inclus

```bash
curl -X GET http://localhost:3000/api/servers \
  -H "X-API-Key: dev-key-change-in-production"
```

**Réponse (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "ip": "192.168.1.100",
      "name": "KIOSK-01",
      "status": "ON",
      "deviceId": "KIOSK-01",
      "computerStatus": {
        "cpuUsage": 45.2,
        "memoryUsage": 65.8,
        "isScreenOn": true
      },
      "actions": [...]
    }
  ],
  "timestamp": "2026-05-27T10:30:45.123Z"
}
```

---

### 2️⃣ POST /api/servers
Créer un nouveau serveur.

**Authentification**: Requise
**Body**: 
- `ip` (string): Adresse IP valide
- `name` (string): Nom du serveur
- `status` (string): "ON" ou "OFF"
- `url` (string): URL valide (http://...)

```bash
curl -X POST http://localhost:3000/api/servers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-change-in-production" \
  -d '{
    "ip": "192.168.1.100",
    "name": "KIOSK-01",
    "status": "OFF",
    "url": "http://example.com"
  }'
```

**Réponse (201 Created)**:
```json
{
  "success": true,
  "data": { "ip": "192.168.1.100", ... },
  "timestamp": "2026-05-27T10:30:45.123Z"
}
```

---

### 3️⃣ GET /api/servers/[ip]
Récupérer les détails d'un serveur spécifique.

**Authentification**: Requise

```bash
curl -X GET http://localhost:3000/api/servers/192.168.1.100 \
  -H "X-API-Key: dev-key-change-in-production"
```

---

### 4️⃣ PUT /api/servers/[ip]
Mettre à jour un serveur.

**Authentification**: Requise
**Body** (optionnel):
- `name`, `status`, `url`

```bash
curl -X PUT http://localhost:3000/api/servers/192.168.1.100 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-change-in-production" \
  -d '{ "status": "ON" }'
```

---

### 5️⃣ DELETE /api/servers/[ip]
Supprimer un serveur.

**Authentification**: Requise

```bash
curl -X DELETE http://localhost:3000/api/servers/192.168.1.100 \
  -H "X-API-Key: dev-key-change-in-production"
```

---

### 6️⃣ PATCH /api/servers/[ip]/status
Mettre à jour le statut d'un serveur.

**Authentification**: Requise
**Body**: `{ "status": "ON" | "OFF" }`

```bash
curl -X PATCH http://localhost:3000/api/servers/192.168.1.100/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-change-in-production" \
  -d '{ "status": "ON" }'
```

---

### 7️⃣ POST /api/device/status
Le Service C# envoie son statut toutes les 10 secondes.

**Authentification**: Requise (via X-API-Key)
**Body**:
```json
{
  "deviceId": "KIOSK-01",
  "currentUrl": "http://example.com",
  "computerStatus": {
    "uptime": "00:05:30.1234567",
    "cpuUsage": 45.2,
    "memoryUsage": 65.8,
    "isScreenOn": true,
    "isKioskMode": true,
    "lastHeartbeat": "2026-05-27T10:30:45.123Z"
  },
  "timestamp": "2026-05-27T10:30:45.123Z",
  "serviceVersion": "1.0.0"
}
```

**Réponse (200 OK)**:
```json
{
  "success": true,
  "message": "Status reçu avec succès",
  "actions": [
    {
      "id": "ACT-1234567890-abc123",
      "type": "ChangeUrl",
      "parameters": { "url": "http://newsite.com" },
      "priority": 10,
      "executeAt": null
    }
  ],
  "timestamp": "2026-05-27T10:30:45.123Z"
}
```

**Exemple (depuis le Service C#)**:
```bash
curl -X POST http://dashboard-ip:3000/api/device/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-change-in-production" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{ ... }'
```

---

### 8️⃣ POST /api/device/action-result
Le Service C# rapporte le résultat d'une action exécutée.

**Authentification**: Requise
**Body**:
```json
{
  "actionId": "ACT-1234567890-abc123",
  "success": true,
  "message": "URL changée avec succès",
  "executedAt": "2026-05-27T10:31:05.456Z",
  "data": {
    "previousUrl": "http://example.com",
    "newUrl": "http://newsite.com"
  }
}
```

**Réponse (200 OK)**:
```json
{
  "success": true,
  "message": "Résultat reçu",
  "timestamp": "2026-05-27T10:31:05.456Z"
}
```

---

### 9️⃣ POST /api/servers/[ip]/actions
Créer une action pour un serveur (depuis le Dashboard).

**Authentification**: Requise
**Body**:
- `type` (string): Type d'action valide
- `parameters` (object): Paramètres spécifiques à l'action
- `priority` (number): 0-100 (optionnel, défaut: 0)
- `executeAt` (string): DateTime ISO 8601 (optionnel)

**Types d'actions valides**:
- `ChangeUrl`: Changer l'URL affichée
- `Reboot`: Redémarrer le device
- `Screenshot`: Prendre une capture d'écran
- `ToggleKioskMode`: Activer/désactiver le mode kiosque
- `UpdateConfig`: Mettre à jour la configuration

```bash
curl -X POST http://localhost:3000/api/servers/192.168.1.100/actions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-change-in-production" \
  -d '{
    "type": "ChangeUrl",
    "parameters": { "url": "http://newsite.com" },
    "priority": 10
  }'
```

**Réponse (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "ACT-1234567890-abc123",
    "actionId": "ACT-1234567890-abc123",
    "ip": "192.168.1.100",
    "type": "ChangeUrl",
    "parameters": { "url": "http://newsite.com" },
    "priority": 10,
    "status": "pending",
    "createdAt": "2026-05-27T10:30:45.123Z"
  },
  "timestamp": "2026-05-27T10:30:45.123Z"
}
```

---

## 🧪 Tests Quick

### Scénario complet:

**1. Créer un serveur**
```bash
API_KEY="dev-key-change-in-production"

curl -X POST http://localhost:3000/api/servers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "ip": "127.0.0.1",
    "name": "TEST-DEVICE",
    "status": "OFF",
    "url": "http://example.com"
  }'
```

**2. Simuler un heartbeat (Service)**
```bash
curl -X POST http://localhost:3000/api/device/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Forwarded-For: 127.0.0.1" \
  -d '{
    "deviceId": "TEST-DEVICE",
    "currentUrl": "http://example.com",
    "computerStatus": {
      "uptime": "00:05:30.1234567",
      "cpuUsage": 45.2,
      "memoryUsage": 65.8,
      "isScreenOn": true,
      "isKioskMode": true,
      "lastHeartbeat": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "serviceVersion": "1.0.0"
  }'
```

**3. Créer une action (Dashboard)**
```bash
ACTION_RESPONSE=$(curl -X POST http://localhost:3000/api/servers/127.0.0.1/actions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "type": "ChangeUrl",
    "parameters": { "url": "http://newsite.com" },
    "priority": 10
  }')

ACTION_ID=$(echo $ACTION_RESPONSE | grep -o '"actionId":"[^"]*' | cut -d'"' -f4)
echo "Action créée: $ACTION_ID"
```

**4. Reporter un résultat (Service)**
```bash
curl -X POST http://localhost:3000/api/device/action-result \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "actionId": "'$ACTION_ID'",
    "success": true,
    "message": "URL changée avec succès",
    "executedAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "data": { "previousUrl": "http://example.com", "newUrl": "http://newsite.com" }
  }'
```

---

## 📊 Voir les données en Base de Données

```bash
cd Proj/my-app
npx prisma studio
```

Ouvre http://localhost:5555 avec une interface visuelle pour:
- Serveurs
- ComputerStatus
- Actions
- ActionResults

---

## ⚠️ Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `401 Authentification requise` | API_KEY manquante ou incorrecte | Vérifier le header `X-API-Key` |
| `400 Champ requis manquant` | Données incomplètes | Vérifier le body JSON |
| `404 Serveur non trouvé` | IP inexistante | Créer le serveur d'abord (POST /api/servers) |
| `400 Format IP invalide` | IP mal formatée | Format: 192.168.1.1 ou localhost |

---

## 🔒 Bonnes pratiques

✅ **À faire**:
- Générer une API_KEY forte en production
- Stocker API_KEY dans les variables d'environnement
- Utiliser HTTPS en production (SSL/TLS)
- Valider les adresses IP du client
- Logger les opérations sensibles

❌ **À éviter**:
- Commiter la vraie API_KEY dans Git
- Utiliser HTTP en production
- Accepter les actions non validées
- Stocker les mots de passe en clair

---

**Dernière mise à jour**: 27 mai 2026
