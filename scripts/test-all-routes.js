// Test complet de toutes les routes API - v2 (avec codes attendus)
const BASE = 'http://localhost:3000';
const API_KEY = 'dev-api-key-change-in-production';
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

const TEST_IP = `10.99.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}`;
const results = [];

async function test(name, method, url, body, expectedStatus) {
  const start = Date.now();
  try {
    const opts = { method, headers, signal: AbortSignal.timeout(15000) };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    const elapsed = Date.now() - start;
    const ok = expectedStatus ? res.status === expectedStatus : (res.status >= 200 && res.status < 400);
    results.push({ name, status: res.status, expected: expectedStatus || '2xx', ok, elapsed });
    console.log(`${ok ? '✅' : '❌'} [${res.status}${expectedStatus ? ` expect ${expectedStatus}` : ''}] ${name} (${elapsed}ms)`);
    if (!ok) console.log('   Response:', JSON.stringify(data));
    return { status: res.status, data, ok };
  } catch (err) {
    const elapsed = Date.now() - start;
    results.push({ name, status: 'ERR', expected: expectedStatus, ok: false, elapsed });
    console.log(`❌ [ERR] ${name} (${elapsed}ms) - ${err.message}`);
    return { status: 'ERR', data: null, ok: false };
  }
}

async function testNoAuth(name, method, url, body, expectedStatus) {
  const start = Date.now();
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000) };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    const elapsed = Date.now() - start;
    const ok = res.status === expectedStatus;
    results.push({ name, status: res.status, expected: expectedStatus, ok, elapsed });
    console.log(`${ok ? '✅' : '❌'} [${res.status} expect ${expectedStatus}] ${name} (${elapsed}ms)`);
    return { status: res.status, data, ok };
  } catch (err) {
    const elapsed = Date.now() - start;
    results.push({ name, status: 'ERR', expected: expectedStatus, ok: false, elapsed });
    console.log(`❌ [ERR] ${name} (${elapsed}ms) - ${err.message}`);
    return { status: 'ERR', data: null, ok: false };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 TEST COMPLET DES ROUTES API');
  console.log(`   Test IP: ${TEST_IP}`);
  console.log('='.repeat(60));
  console.log('');

  // === 1. Health ===
  console.log('── 1. Health Check ──');
  await test('GET /api/health', 'GET', `${BASE}/api/health`, null, 200);
  console.log('');

  // === 2. Servers CRUD ===
  console.log('── 2. Servers CRUD ──');
  await test('GET /api/servers (list)', 'GET', `${BASE}/api/servers`, null, 200);

  await test('POST /api/servers (create)', 'POST', `${BASE}/api/servers`, {
    ip: TEST_IP, name: 'Test-Kiosk', status: 'ON', url: 'https://example.com',
  }, 201);

  await test('GET /api/servers/:ip', 'GET', `${BASE}/api/servers/${TEST_IP}`, null, 200);

  await test('PUT /api/servers/:ip (update)', 'PUT', `${BASE}/api/servers/${TEST_IP}`, {
    name: 'Test-Kiosk-Updated', status: 'OFF',
  }, 200);

  await test('PATCH /api/servers/:ip/status', 'PATCH', `${BASE}/api/servers/${TEST_IP}/status`, {
    status: 'ON',
  }, 200);
  console.log('');

  // === 3. Actions ===
  console.log('── 3. Actions ──');
  const actionRes = await test('POST /api/servers/:ip/actions (ChangeUrl)', 'POST', `${BASE}/api/servers/${TEST_IP}/actions`, {
    type: 'ChangeUrl', parameters: { url: 'https://new-url.com' }, priority: 5,
  }, 201);

  await test('POST /api/servers/:ip/actions (Reboot)', 'POST', `${BASE}/api/servers/${TEST_IP}/actions`, {
    type: 'Reboot', parameters: {},
  }, 201);

  await test('POST /api/servers/:ip/actions (Screenshot)', 'POST', `${BASE}/api/servers/${TEST_IP}/actions`, {
    type: 'Screenshot', parameters: {},
  }, 201);

  // Invalid type → expect 400
  await test('POST actions (invalid type → 400)', 'POST', `${BASE}/api/servers/${TEST_IP}/actions`, {
    type: 'InvalidType', parameters: {},
  }, 400);
  console.log('');

  // === 4. Device Heartbeat ===
  console.log('── 4. Device Heartbeat ──');
  await test('POST /api/device/status', 'POST', `${BASE}/api/device/status`, {
    deviceId: 'KIOSK-TEST-V2',
    currentUrl: 'https://example.com/page',
    timestamp: new Date().toISOString(),
    serviceVersion: '1.0.0-test',
    computerStatus: {
      uptime: '01:23:45', cpuUsage: 42.5, memoryUsage: 68.2,
      isScreenOn: true, isKioskMode: false,
      lastHeartbeat: new Date().toISOString(),
    },
  }, 200);
  console.log('');

  // === 5. Action Result ===
  console.log('── 5. Action Result ──');
  if (actionRes.ok && actionRes.data?.data?.actionId) {
    await test('POST /api/device/action-result', 'POST', `${BASE}/api/device/action-result`, {
      actionId: actionRes.data.data.actionId,
      success: true, message: 'URL changed OK',
      executedAt: new Date().toISOString(),
      data: { previousUrl: 'https://example.com' },
    }, 200);
  } else {
    console.log('⏭️  Skipped (no action created)');
  }
  console.log('');

  // === 6. Validation & Security ===
  console.log('── 6. Validation & Sécurité ──');
  await testNoAuth('POST /api/servers (no API key → 401)', 'POST', `${BASE}/api/servers`, {
    ip: '10.0.0.1', name: 'NoAuth', status: 'ON', url: 'https://x.com',
  }, 401);

  await test('POST /api/servers (invalid IP → 400)', 'POST', `${BASE}/api/servers`, {
    ip: '999.999.999.999', name: 'Bad', status: 'ON', url: 'https://x.com',
  }, 400);

  await test('POST /api/servers (missing fields → 400)', 'POST', `${BASE}/api/servers`, {
    ip: '10.0.0.1',
  }, 400);

  await test('POST /api/servers (bad status → 400)', 'POST', `${BASE}/api/servers`, {
    ip: '10.0.0.2', name: 'Bad', status: 'MAYBE', url: 'https://x.com',
  }, 400);

  await test('POST /api/servers (bad URL → 400)', 'POST', `${BASE}/api/servers`, {
    ip: '10.0.0.3', name: 'Bad', status: 'ON', url: 'not-a-url',
  }, 400);

  await test('GET /api/servers/:ip (not found → 404)', 'GET', `${BASE}/api/servers/10.254.254.254`, null, 404);

  await test('POST action-result (unknown action → 404)', 'POST', `${BASE}/api/device/action-result`, {
    actionId: 'ACT-nonexistent-99999', success: true, message: 'test', executedAt: new Date().toISOString(),
  }, 404);
  console.log('');

  // === 7. Cleanup ===
  console.log('── 7. Cleanup ──');
  await test('DELETE /api/servers/:ip', 'DELETE', `${BASE}/api/servers/${TEST_IP}`, null, 200);
  console.log('');

  // === Summary ===
  console.log('='.repeat(60));
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  const total = results.length;
  console.log(`📊 RÉSULTATS: ${passed}/${total} passés, ${failed} échoués`);
  if (failed === 0) {
    console.log('🎉 TOUS LES TESTS PASSENT !');
  } else {
    console.log('');
    console.log('⚠️  Tests échoués:');
    results.filter(r => !r.ok).forEach(r =>
      console.log(`   ❌ ${r.name} — got ${r.status}, expected ${r.expected}`)
    );
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
