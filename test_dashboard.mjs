import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-client-id': '10001',
  'x-user-id': '1',
};

test('Dashboard Module End-to-End Tests', async (t) => {
  await t.test('1. GET /api/v1/dashboard/working-date returns property official working date', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dashboard/working-date`, { headers: HEADERS });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.workingDate);
    assert.equal(json.data.workingDate, '2026-06-29');
  });

  await t.test('2. GET /api/v1/dashboard/summary calculates 7 KPIs and 4 revenue metrics from real database', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dashboard/summary?date=2026-06-29`, { headers: HEADERS });
    assert.equal(res.status, 200);
    const json = await res.json();
    const data = json.data;

    assert.equal(data.workingDate, '2026-06-29');
    assert.ok(typeof data.kpis.expectedArrivals === 'number');
    assert.ok(typeof data.kpis.expectedDepartures === 'number');
    assert.ok(typeof data.kpis.checkouts === 'number');
    assert.ok(typeof data.kpis.vacantRooms === 'number');
    assert.ok(typeof data.kpis.inhouseGuests === 'number');
    assert.ok(typeof data.kpis.maintenanceRooms === 'number');
    assert.ok(typeof data.kpis.otaCount === 'number');
    assert.ok(typeof data.kpis.cancelCount === 'number');

    assert.ok(typeof data.revenue.roomSold === 'number');
    assert.ok(typeof data.revenue.roomRevenue === 'number');
    assert.ok(typeof data.revenue.adr === 'number');
    assert.ok(typeof data.revenue.occupancyPercent === 'number');
    assert.ok(typeof data.revenue.revpar === 'number');
    assert.ok(typeof data.revenue.availableRooms === 'number');
  });

  await t.test('3. Dynamic KPI lists endpoints return correct data', async () => {
    const arrivalsRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/expected-arrivals?date=2026-06-29`, { headers: HEADERS });
    assert.equal(arrivalsRes.status, 200);
    const arrivals = await arrivalsRes.json();
    assert.ok(Array.isArray(arrivals.data));

    const departuresRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/expected-departures?date=2026-06-29`, { headers: HEADERS });
    assert.equal(departuresRes.status, 200);
    const departures = await departuresRes.json();
    assert.ok(Array.isArray(departures.data));

    const checkoutsRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/checkouts?date=2026-06-29`, { headers: HEADERS });
    assert.equal(checkoutsRes.status, 200);

    const vacantRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/vacant-rooms?date=2026-06-29`, { headers: HEADERS });
    assert.equal(vacantRes.status, 200);

    const inhouseRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/inhouse-guests?date=2026-06-29`, { headers: HEADERS });
    assert.equal(inhouseRes.status, 200);

    const maintRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/maintenance-rooms`, { headers: HEADERS });
    assert.equal(maintRes.status, 200);

    const otaRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/ota-cancel?kind=ota`, { headers: HEADERS });
    assert.equal(otaRes.status, 200);

    const cancelRes = await fetch(`${BASE_URL}/api/v1/dashboard/lists/ota-cancel?kind=cancel`, { headers: HEADERS });
    assert.equal(cancelRes.status, 200);
  });

  await t.test('4. Room Status breakdown and Housekeeping endpoints', async () => {
    const brkRes = await fetch(`${BASE_URL}/api/v1/dashboard/room-status-breakdown`, { headers: HEADERS });
    assert.equal(brkRes.status, 200);
    const brk = await brkRes.json();
    assert.ok(Array.isArray(brk.data));

    const hkRes = await fetch(`${BASE_URL}/api/v1/dashboard/housekeeping`, { headers: HEADERS });
    assert.equal(hkRes.status, 200);
    const hk = await hkRes.json();
    assert.ok(Array.isArray(hk.data));
    if (hk.data.length > 0) {
      assert.ok(['Done', 'Pending'].includes(hk.data[0].status));
    }
  });

  await t.test('5. Profile Details & Access Matrix endpoints', async () => {
    const profRes = await fetch(`${BASE_URL}/api/v1/dashboard/me/profile`, { headers: HEADERS });
    assert.equal(profRes.status, 200);
    const prof = await profRes.json();
    assert.equal(prof.data.userId, 1);
    assert.ok(prof.data.userName);

    const accRes = await fetch(`${BASE_URL}/api/v1/dashboard/me/access`, { headers: HEADERS });
    assert.equal(accRes.status, 200);
    const acc = await accRes.json();
    assert.equal(acc.data.property.clientId, 10001);
    assert.ok(Array.isArray(acc.data.modules));
  });
});
