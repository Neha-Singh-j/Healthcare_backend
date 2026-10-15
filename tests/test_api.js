/**
 * Tests all endpoints:
 * 1. Authentication (Register, Login, Duplicate handling)
 * 2. Patient Management (Create, List, GetById, Update, Delete)
 * 3. Doctor Management (Create, List, GetById, Update, Delete)
 * 4. Patient-Doctor Mappings (Assign, List, GetByPatientId, Delete)
 * 5. Authorization & Permissions
 */

const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');

let server;
let baseUrl;

const results = [];

function recordResult(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`${icon}: ${name} ${detail ? '(' + detail + ')' : ''}`);
}

async function request(method, path, body = null, token = null) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

async function runTests() {
  console.log('🩺 STARTING HEALTHCARE BACKEND API TESTS');

  // Start app on random available port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  const timestamp = Date.now();
  const testUser = {
    name: 'Dr. John Watson',
    email: `john.watson.${timestamp}@example.com`,
    password: 'password123'
  };

  let authToken = null;
  let testPatientId = null;
  let testDoctorId = null;
  let testMappingId = null;

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    recordResult('GET /api/health', health.status === 200 && health.data.success);

    // 2. Auth: Register new user
    const regRes = await request('POST', '/api/auth/register', testUser);
    recordResult(
      'POST /api/auth/register',
      regRes.status === 201 && regRes.data.success && regRes.data.data.token,
      `User ID: ${regRes.data?.data?.user?.id}`
    );
    authToken = regRes.data?.data?.token;

    // 3. Auth: Duplicate register prevention
    const dupRegRes = await request('POST', '/api/auth/register', testUser);
    recordResult(
      'POST /api/auth/register (Duplicate check)',
      dupRegRes.status === 409 && !dupRegRes.data.success
    );

    // 4. Auth: Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    recordResult(
      'POST /api/auth/login',
      loginRes.status === 200 && loginRes.data.success && loginRes.data.data.token
    );
    if (loginRes.data?.data?.token) {
      authToken = loginRes.data.data.token;
    }

    // 5. Auth: Login with wrong password
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'wrongpassword'
    });
    recordResult(
      'POST /api/auth/login (Invalid password check)',
      badLoginRes.status === 401 && !badLoginRes.data.success
    );

    // 6. Security: Unauthorized access to patients
    const unauthRes = await request('GET', '/api/patients');
    recordResult(
      'GET /api/patients without token (401 check)',
      unauthRes.status === 401 && !unauthRes.data.success
    );

    // 7. Patient: Create Patient
    const newPatient = {
      name: 'Alice Cooper',
      age: 29,
      gender: 'Female',
      address: '221B Baker St',
      phone: '+1-555-0199'
    };
    const createPatientRes = await request('POST', '/api/patients', newPatient, authToken);
    recordResult(
      'POST /api/patients',
      createPatientRes.status === 201 && createPatientRes.data.success && createPatientRes.data.data.id,
      `Patient ID: ${createPatientRes.data?.data?.id}`
    );
    testPatientId = createPatientRes.data?.data?.id;

    // 8. Patient: Retrieve all patients
    const getPatientsRes = await request('GET', '/api/patients', null, authToken);
    recordResult(
      'GET /api/patients',
      getPatientsRes.status === 200 &&
        getPatientsRes.data.success &&
        Array.isArray(getPatientsRes.data.data.patients) &&
        getPatientsRes.data.data.patients.length > 0
    );

    // 9. Patient: Get details of specific patient
    const getPatientRes = await request('GET', `/api/patients/${testPatientId}`, null, authToken);
    recordResult(
      `GET /api/patients/${testPatientId}`,
      getPatientRes.status === 200 && getPatientRes.data.data.name === 'Alice Cooper'
    );

    // 10. Patient: Update patient details
    const updatePatientRes = await request(
      'PUT',
      `/api/patients/${testPatientId}`,
      { name: 'Alice Cooper Updated', age: 30 },
      authToken
    );
    recordResult(
      `PUT /api/patients/${testPatientId}`,
      updatePatientRes.status === 200 && updatePatientRes.data.data.age === 30
    );

    // 11. Doctor: Create Doctor
    const newDoctor = {
      name: 'Dr. Gregory House',
      specialty: 'Diagnostic Medicine',
      email: `house.${timestamp}@hospital.com`,
      phone: '+1-555-0800'
    };
    const createDocRes = await request('POST', '/api/doctors', newDoctor, authToken);
    recordResult(
      'POST /api/doctors',
      createDocRes.status === 201 && createDocRes.data.success && createDocRes.data.data.id,
      `Doctor ID: ${createDocRes.data?.data?.id}`
    );
    testDoctorId = createDocRes.data?.data?.id;

    // 12. Doctor: Retrieve all doctors
    const getDoctorsRes = await request('GET', '/api/doctors', null, authToken);
    recordResult(
      'GET /api/doctors',
      getDoctorsRes.status === 200 &&
        getDoctorsRes.data.success &&
        Array.isArray(getDoctorsRes.data.data.doctors)
    );

    // 13. Doctor: Get specific doctor
    const getDocRes = await request('GET', `/api/doctors/${testDoctorId}`, null, authToken);
    recordResult(
      `GET /api/doctors/${testDoctorId}`,
      getDocRes.status === 200 && getDocRes.data.data.name === 'Dr. Gregory House'
    );

    // 14. Doctor: Update doctor details
    const updateDocRes = await request(
      'PUT',
      `/api/doctors/${testDoctorId}`,
      { specialty: 'Infectious Disease & Nephrology' },
      authToken
    );
    recordResult(
      `PUT /api/doctors/${testDoctorId}`,
      updateDocRes.status === 200 &&
        updateDocRes.data.data.specialty === 'Infectious Disease & Nephrology'
    );

    // 15. Mapping: Assign doctor to patient
    const mapRes = await request(
      'POST',
      '/api/mappings',
      {
        patientId: testPatientId,
        doctorId: testDoctorId
      },
      authToken
    );
    recordResult(
      'POST /api/mappings (Assign Doctor)',
      mapRes.status === 201 && mapRes.data.success && mapRes.data.data.id,
      `Mapping ID: ${mapRes.data?.data?.id}`
    );
    testMappingId = mapRes.data?.data?.id;

    // 16. Mapping: Prevent duplicate assignment
    const dupMapRes = await request(
      'POST',
      '/api/mappings',
      {
        patientId: testPatientId,
        doctorId: testDoctorId
      },
      authToken
    );
    recordResult(
      'POST /api/mappings (Duplicate prevention check)',
      dupMapRes.status === 409 && !dupMapRes.data.success
    );

    // 17. Mapping: Retrieve all mappings
    const allMappingsRes = await request('GET', '/api/mappings', null, authToken);
    recordResult(
      'GET /api/mappings',
      allMappingsRes.status === 200 &&
        allMappingsRes.data.success &&
        Array.isArray(allMappingsRes.data.data.mappings) &&
        allMappingsRes.data.data.mappings.length > 0
    );

    // 18. Mapping: Get all doctors assigned to a specific patient
    const patientDocsRes = await request(
      'GET',
      `/api/mappings/${testPatientId}`,
      null,
      authToken
    );
    recordResult(
      `GET /api/mappings/${testPatientId} (Assigned doctors for patient)`,
      patientDocsRes.status === 200 &&
        patientDocsRes.data.success &&
        Array.isArray(patientDocsRes.data.data.assignedDoctors) &&
        patientDocsRes.data.data.assignedDoctors.length > 0
    );

    // 19. Mapping: Remove a doctor from a patient (delete mapping)
    const deleteMapRes = await request('DELETE', `/api/mappings/${testMappingId}`, null, authToken);
    recordResult(
      `DELETE /api/mappings/${testMappingId}`,
      deleteMapRes.status === 200 && deleteMapRes.data.success
    );

    // 20. Patient: Delete patient record
    const deletePatientRes = await request(
      'DELETE',
      `/api/patients/${testPatientId}`,
      null,
      authToken
    );
    recordResult(
      `DELETE /api/patients/${testPatientId}`,
      deletePatientRes.status === 200 && deletePatientRes.data.success
    );

    // 21. Doctor: Delete doctor record
    const deleteDocRes = await request(
      'DELETE',
      `/api/doctors/${testDoctorId}`,
      null,
      authToken
    );
    recordResult(
      `DELETE /api/doctors/${testDoctorId}`,
      deleteDocRes.status === 200 && deleteDocRes.data.success
    );

    // 22. Error Handling: 404 for unknown route
    const notFoundRes = await request('GET', '/api/nonexistent-route');
    recordResult(
      'GET /api/nonexistent-route (404 check)',
      notFoundRes.status === 404 && !notFoundRes.data.success
    );

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    // Cleanup test user
    try {
      if (testUser.email) {
        await prisma.user.deleteMany({
          where: { email: testUser.email }
        });
      }
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }

    if (server) {
      server.close();
    }

    console.log('TEST SUMMARY');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);

    if (failedCount > 0) {
      console.log('\nFailed Tests:');
      results.filter((r) => !r.passed).forEach((r) => console.log(` - ${r.name}: ${r.detail}`));
      process.exit(1);
    } else {
      console.log('\n ALL TESTS PASSED SUCCESSFULLY!\n');
      process.exit(0);
    }
  }
}

runTests();
