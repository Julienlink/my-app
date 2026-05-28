#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Fonction pour récupérer l'IP locale
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les adresses IPv6 et les adresses de boucle locale
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const args = process.argv.slice(2);
let serverIp = args[0];

// Si aucune IP n'est fournie, la récupérer automatiquement
if (!serverIp) {
  serverIp = getLocalIp();
  console.log(`📍 IP détectée automatiquement: ${serverIp}`);
}

// Valider l'IP
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^localhost$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!ipRegex.test(serverIp)) {
  console.error('Format IP invalide. Exemples valides:');
  console.error('  - 192.168.1.100');
  console.error('  - localhost');
  console.error('  - dashboard.local');
  process.exit(1);
}

// Créer la configuration pour chaque Kiosk
const baseConfig = {
  serverUrl: `http://${serverIp}:3000`,
  kioskUrl: 'http://localhost:8080',
  heartbeatInterval: 10000,
  maxRetries: 3,
  retryDelay: 5000,
  logLevel: 'Info'
};

// Créer le dossier de sortie
const outputDir = path.join(__dirname, '../public/configs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les configurations pour 5 Kiosks
for (let i = 1; i <= 5; i++) {
  const config = {
    ...baseConfig,
    deviceId: `KIOSK-${String(i).padStart(2, '0')}`
  };
  
  const filename = path.join(outputDir, `config-kiosk-${i}.json`);
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));
  console.log(`✓ Généré: public/configs/config-kiosk-${i}.json`);
}

console.log('\n--- INSTRUCTIONS ---');
console.log(`\nServeur Dashboard configuré sur: http://${serverIp}:3000\n`);
console.log('Copier les fichiers config-kiosk-*.json sur chaque PC Kiosk à:');
console.log('  C:\\ProgramData\\KioskControlService\\config.json\n');
console.log('Puis redémarrer le Service Windows:');
console.log('  net stop KioskControlService');
console.log('  net start KioskControlService\n');
