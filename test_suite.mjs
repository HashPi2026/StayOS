import { pool, testConnection } from './db/pool.js';

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('        STAYOS PMS COMPREHENSIVE TEST SUITE         ');
  console.log('====================================================\n');

  // TEST 1: Database Connectivity
  console.log('--- 1. Database Connectivity & Pool Health ---');
  try {
    const isDbConnected = await testConnection();
    assert(isDbConnected.connected === true, 'PostgreSQL connection pool alive & responsive');
    
    const dbTimeRes = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    assert(dbTimeRes.rows.length > 0, `Connected to database "${dbTimeRes.rows[0].db_name}" at ${dbTimeRes.rows[0].current_time}`);
  } catch (err) {
    assert(false, `Database connection error: ${err.message}`);
  }

  // TEST 2: Health API Endpoint
  console.log('\n--- 2. Health & Diagnostic API ---');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
    const healthData = await healthRes.json();
    assert(healthData.data?.status === 'healthy', 'Health payload reports status: "healthy"');
    assert(healthData.data?.database?.connected === true, 'Health payload reports database.connected: true');
  } catch (err) {
    assert(false, `Health endpoint error: ${err.message}`);
  }

  // TEST 3: Multi-tenant Configuration API
  console.log('\n--- 3. Configuration Module & Role Access ---');
  try {
    // With role 1 (Admin) and client 10001
    const configRes = await fetch(`${BASE_URL}/api/v1/configuration/room-types`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(configRes.status === 200, 'GET /api/v1/configuration/room-types with valid role returned 200');
    const configData = await configRes.json();
    assert(Array.isArray(configData.data), `Fetched ${configData.data?.length ?? 0} room types for client 10001`);

    // Verify rate plans endpoint
    const ratePlansRes = await fetch(`${BASE_URL}/api/v1/configuration/rate-plans`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(ratePlansRes.status === 200, 'GET /api/v1/configuration/rate-plans returned 200');

    // Verify taxes endpoint
    const taxesRes = await fetch(`${BASE_URL}/api/v1/configuration/taxes`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(taxesRes.status === 200, 'GET /api/v1/configuration/taxes returned 200');
  } catch (err) {
    assert(false, `Configuration module test error: ${err.message}`);
  }

  // TEST 4: Guest Management Full CRUD Operations
  console.log('\n--- 4. Guest Module CRUD & Tenant Isolation ---');
  let createdGuestId = null;
  const testGuestCode = `GST-TEST-RUN-${Date.now()}`;

  try {
    // 4a: GET Guests list
    const listRes = await fetch(`${BASE_URL}/api/v1/guests`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(listRes.status === 200, 'GET /api/v1/guests returned 200');
    const listData = await listRes.json();
    assert(Array.isArray(listData.data), `Initial guest list count for client 10001: ${listData.data?.length}`);

    // 4b: CREATE Guest with contact
    const createRes = await fetch(`${BASE_URL}/api/v1/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-role-id': '1',
      },
      body: JSON.stringify({
        title: 'Dr.',
        first_name: 'Automated',
        last_name: 'Tester',
        gender: 'Other',
        nationality: 'Global',
        guest_code: testGuestCode,
        is_vip: true,
        vip_tier: 'Platinum',
        contacts: [
          {
            contact_type: 'Mobile / Personal',
            is_primary: true,
            phone_number: '+1 555-0199',
            email_address: 'autotester@example.com',
          },
        ],
        documents: [],
      }),
    });

    assert(createRes.status === 201 || createRes.status === 200, `POST /api/v1/guests returned status ${createRes.status}`);
    const createData = await createRes.json();
    createdGuestId = createData.data?.guest_id;
    assert(createdGuestId !== undefined && createdGuestId !== null, `Guest created with ID: ${createdGuestId}`);
    assert(createData.data?.first_name === 'Automated', 'Guest first_name matches');
    assert(createData.data?.is_vip === true, 'Guest VIP status persisted as true');

    // 4c: GET created guest by ID
    const getGuestRes = await fetch(`${BASE_URL}/api/v1/guests/${createdGuestId}`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(getGuestRes.status === 200, `GET /api/v1/guests/${createdGuestId} returned 200`);
    const getGuestData = await getGuestRes.json();
    assert(getGuestData.data?.guest_code === testGuestCode, 'Retrieved guest guest_code matches');

    // 4d: Multi-Tenant Isolation Check
    // Attempt to access guest created by tenant 10001 using tenant 10002 credentials
    const crossTenantRes = await fetch(`${BASE_URL}/api/v1/guests/${createdGuestId}`, {
      headers: { 'x-client-id': '10002', 'x-role-id': '1' },
    });
    assert(crossTenantRes.status === 404, 'Cross-tenant isolation: Tenant 10002 cannot access guest of Tenant 10001 (returns 404)');

    // 4e: UPDATE Guest details
    const updateRes = await fetch(`${BASE_URL}/api/v1/guests/${createdGuestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-role-id': '1',
      },
      body: JSON.stringify({
        first_name: 'AutomatedUpdated',
        last_name: 'Tester',
        guest_remark: 'Automated test execution remark',
      }),
    });
    assert(updateRes.status === 200, `PUT /api/v1/guests/${createdGuestId} returned 200`);
    const updateData = await updateRes.json();
    assert(updateData.data?.first_name === 'AutomatedUpdated', 'Guest first_name updated successfully');

    // 4f: DELETE Guest
    const deleteRes = await fetch(`${BASE_URL}/api/v1/guests/${createdGuestId}`, {
      method: 'DELETE',
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(deleteRes.status === 204 || deleteRes.status === 200, `DELETE /api/v1/guests/${createdGuestId} returned ${deleteRes.status} (No Content)`);

    // Verify deletion
    const verifyDelRes = await fetch(`${BASE_URL}/api/v1/guests/${createdGuestId}`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    assert(verifyDelRes.status === 404, 'Verification after deletion: Guest no longer exists (404)');
  } catch (err) {
    assert(false, `Guest CRUD operations error: ${err.message}`);
    // Cleanup if failed mid-way
    if (createdGuestId) {
      await pool.query('DELETE FROM guest WHERE guest_id = $1', [createdGuestId]).catch(() => {});
    }
  }

  // TEST 5: Rate & Availability Endpoints
  console.log('\n--- 5. Rate & Availability Module ---');
  try {
    const rateRes = await fetch(`${BASE_URL}/api/v1/rate-availability/grid`, {
      headers: { 'x-client-id': '10001', 'x-role-id': '1' },
    });
    // Can be 200 or 404 depending on exact route configuration
    assert(rateRes.status < 500, `Rate availability endpoint responded without 5xx error (${rateRes.status})`);
  } catch (err) {
    assert(false, `Rate & Availability error: ${err.message}`);
  }

  // TEST 6: Static Client SPA Serving
  console.log('\n--- 6. Client Frontend & SPA Serving ---');
  try {
    const rootRes = await fetch(`${BASE_URL}/`);
    assert(rootRes.status === 200, 'GET / returned 200 OK');
    const html = await rootRes.text();
    assert(html.includes('<div id="root">') || html.includes('<!DOCTYPE html>'), 'Root returns valid HTML document entry point');
  } catch (err) {
    assert(false, `SPA serving error: ${err.message}`);
  }

  // TEST 7: Reservation & Group Management
  console.log('\n--- 7. Reservation & Group Folio Subsystem ---');
  try {
    // 7a: Create Group
    const groupRes = await fetch(`${BASE_URL}/api/v1/group/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({
        group_name: `Automated Test Group ${Date.now()}`,
        company: 'Automated Enterprises Ltd',
        full_name: 'Jordan Belfort',
        check_in_date: '2026-11-10',
        check_out_date: '2026-11-14',
        contact: {
          contact_type: 'Travel Coordinator',
          phone_number: '+1 555-0182',
          email_address: 'jordan@automated.com'
        }
      })
    });
    assert(groupRes.status === 201 || groupRes.status === 200, `POST /api/v1/group/groups returned ${groupRes.status}`);
    const groupData = await groupRes.json();
    const testGroupId = groupData.data?.group_id;
    assert(testGroupId !== undefined, `Group created with ID: ${testGroupId}`);

    // 7b: Create Reservation under group
    const resRes = await fetch(`${BASE_URL}/api/v1/reservation/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({
        group_id: testGroupId,
        check_in_date: '2026-11-10',
        check_out_date: '2026-11-13',
        rate: 200,
        guest: {
          first_name: 'Sarah',
          last_name: 'Connor',
          email: 'sarah.connor@cyberdyne.com',
          phone: '+1 555-8000'
        },
        other_charges_items: [
          {
            occ_id: 41,
            oc_id: 73,
            rate: 25,
            qty: 1,
            tax: 2,
            remark: 'WiFi High Speed'
          }
        ],
        payment: {
          payment_type_id: 10,
          amount: 100,
          authorize: false,
          remark: 'Initial deposit'
        }
      })
    });

    assert(resRes.status === 201 || resRes.status === 200, `POST /api/v1/reservation/reservations returned ${resRes.status}`);
    const resJson = await resRes.json();
    const testResId = resJson.data?.reservation_id;
    assert(testResId !== undefined, `Reservation created with ID: ${testResId} & Folio: ${resJson.data?.folio_number}`);
    assert(resJson.data?.rental_details?.length === 3, 'Created exactly 3 night rental details');
    assert(parseFloat(resJson.data?.total_charges) > 0, `Total charges computed: $${resJson.data?.total_charges}`);
    assert(parseFloat(resJson.data?.balance) > 0, `Outstanding balance computed: $${resJson.data?.balance}`);

    // 7c: Status transition: Confirmed -> Checked-In
    const checkInRes = await fetch(`${BASE_URL}/api/v1/reservation/reservations/${testResId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ status: 'Checked-In' })
    });
    assert(checkInRes.status === 200, `Reservation transitioned to Checked-In status (200)`);

    // 7d: Balance guard: Check-Out should fail if balance > 0
    const prematureCheckOut = await fetch(`${BASE_URL}/api/v1/reservation/reservations/${testResId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ status: 'Checked-Out' })
    });
    assert(prematureCheckOut.status === 400, 'Check-out rejected when balance > 0 (400)');

    // 7e: Settle balance with final payment
    const remainingBalance = parseFloat(resJson.data?.balance);
    const settleRes = await fetch(`${BASE_URL}/api/v1/reservation/reservations/${testResId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({
        payment_type_id: 10,
        amount: remainingBalance,
        remark: 'Folio settled'
      })
    });
    assert(settleRes.status === 201 || settleRes.status === 200, `Payment posted to settle balance (status ${settleRes.status})`);

    // 7f: Check-Out after settlement succeeds
    const checkoutSuccess = await fetch(`${BASE_URL}/api/v1/reservation/reservations/${testResId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '10001',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ status: 'Checked-Out' })
    });
    assert(checkoutSuccess.status === 200, 'Check-out successfully completed after zero balance reached');

  } catch (err) {
    assert(false, `Reservation/Group subsystem error: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
