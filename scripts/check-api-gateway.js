/**
 * Скрипт для проверки всех API routes через Next.js API Gateway (Фаза 4)
 * Проверяет доступность всех endpoints и показывает ответы
 */

const axios = require('axios');

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const BASE_URL = API_GATEWAY_URL;

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow');
}

// Функция для безопасного вывода JSON (ограничение размера)
function formatResponse(data, maxLength = 500) {
  const json = JSON.stringify(data, null, 2);
  if (json.length > maxLength) {
    return json.substring(0, maxLength) + '... (truncated)';
  }
  return json;
}

async function testEndpoint(name, method, url, options = {}) {
  try {
    const config = {
      method,
      url,
      timeout: 5000,
      validateStatus: () => true, // Не выбрасывать ошибку на любой статус
      ...options,
    };

    const response = await axios(config);
    
    const result = {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      headers: response.headers,
    };

    if (result.success) {
      logSuccess(`${name} - Status: ${response.status}`);
      if (options.showResponse !== false) {
        logInfo(`Response: ${formatResponse(response.data)}`);
      }
    } else {
      logError(`${name} - Status: ${response.status}`);
      logInfo(`Error: ${formatResponse(response.data)}`);
    }

    return result;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logError(`${name} - Connection refused (service not running?)`);
      return { success: false, error: 'Connection refused' };
    } else if (error.code === 'ETIMEDOUT') {
      logError(`${name} - Timeout`);
      return { success: false, error: 'Timeout' };
    } else if (error.response) {
      logError(`${name} - Status: ${error.response.status}`);
      logInfo(`Error: ${formatResponse(error.response.data)}`);
      return {
        success: false,
        status: error.response.status,
        data: error.response.data,
      };
    } else {
      logError(`${name} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Проверка Location Service API
async function checkLocationAPI() {
  log('\n📍 Location Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // GET /api/locations?endpoint=regions
  results.push(await testEndpoint(
    'GET /api/locations?endpoint=regions',
    'GET',
    `${BASE_URL}/api/locations?endpoint=regions`
  ));

  // GET /api/locations?endpoint=cities&region_id=1
  results.push(await testEndpoint(
    'GET /api/locations?endpoint=cities&region_id=1',
    'GET',
    `${BASE_URL}/api/locations?endpoint=cities&region_id=1`
  ));

  // GET /api/locations?endpoint=street-types
  results.push(await testEndpoint(
    'GET /api/locations?endpoint=street-types',
    'GET',
    `${BASE_URL}/api/locations?endpoint=street-types`
  ));

  return results;
}

// Проверка Availability Service API
async function checkAvailabilityAPI() {
  log('\n🔍 Availability Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // POST /api/availability/check
  results.push(await testEndpoint(
    'POST /api/availability/check',
    'POST',
    `${BASE_URL}/api/availability/check`,
    {
      data: {
        city: 'Москва',
        street: 'Тверская',
        house: '1',
      },
    }
  ));

  // GET /api/availability/1
  results.push(await testEndpoint(
    'GET /api/availability/1',
    'GET',
    `${BASE_URL}/api/availability/1?type=building`
  ));

  // GET /api/availability/providers/1
  results.push(await testEndpoint(
    'GET /api/availability/providers/1',
    'GET',
    `${BASE_URL}/api/availability/providers/1?type=building`
  ));

  return results;
}

// Проверка Provider Service API
async function checkProviderAPI() {
  log('\n🏢 Provider Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // GET /api/providers
  results.push(await testEndpoint(
    'GET /api/providers',
    'GET',
    `${BASE_URL}/api/providers`
  ));

  // GET /api/tariffs
  results.push(await testEndpoint(
    'GET /api/tariffs',
    'GET',
    `${BASE_URL}/api/tariffs`
  ));

  return results;
}

// Проверка Equipment Service API
async function checkEquipmentAPI() {
  log('\n🔧 Equipment Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // GET /api/equipment
  results.push(await testEndpoint(
    'GET /api/equipment',
    'GET',
    `${BASE_URL}/api/equipment`
  ));

  // GET /api/equipment?endpoint=types
  results.push(await testEndpoint(
    'GET /api/equipment?endpoint=types',
    'GET',
    `${BASE_URL}/api/equipment?endpoint=types`
  ));

  return results;
}

// Проверка Order Service API
async function checkOrderAPI() {
  log('\n📦 Order Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // POST /api/orders/calculate
  results.push(await testEndpoint(
    'POST /api/orders/calculate',
    'POST',
    `${BASE_URL}/api/orders/calculate`,
    {
      data: {
        tariffId: 1,
        routerOption: 'rent',
        tvSettopOption: 'none',
        simCardOption: 'none',
      },
    }
  ));

  // GET /api/orders/by-phone?phone=+79991234567
  results.push(await testEndpoint(
    'GET /api/orders/by-phone?phone=+79991234567',
    'GET',
    `${BASE_URL}/api/orders/by-phone?phone=+79991234567`
  ));

  // GET /api/orders/1 (может вернуть 404 если заявки нет - это нормально)
  const orderResult = await testEndpoint(
    'GET /api/orders/1',
    'GET',
    `${BASE_URL}/api/orders/1`,
    { showResponse: false }
  );
  // 404 - это нормальное поведение если заявки нет, считаем успехом
  if (orderResult.status === 404 && orderResult.data?.error === 'Order not found') {
    orderResult.success = true;
  }
  results.push(orderResult);

  // GET /api/orders/1/status-history
  results.push(await testEndpoint(
    'GET /api/orders/1/status-history',
    'GET',
    `${BASE_URL}/api/orders/1/status-history`
  ));

  // GET /api/orders/my (требует авторизацию - ожидаем 401, это правильное поведение)
  const myOrdersResult = await testEndpoint(
    'GET /api/orders/my (без авторизации)',
    'GET',
    `${BASE_URL}/api/orders/my`,
    { showResponse: false }
  );
  // 401 - это ожидаемое поведение, считаем успехом
  if (myOrdersResult.status === 401) {
    myOrdersResult.success = true;
  }
  results.push(myOrdersResult);

  return results;
}

// Проверка Notification Service API
async function checkNotificationAPI() {
  log('\n🔔 Notification Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // POST /api/notifications
  results.push(await testEndpoint(
    'POST /api/notifications',
    'POST',
    `${BASE_URL}/api/notifications`,
    {
      data: {
        type: 'order_created',
        email: 'test@example.com',
        phone: '+79991234567',
        metadata: {
          orderId: 1,
        },
      },
    }
  ));

  // GET /api/notifications/user/1
  results.push(await testEndpoint(
    'GET /api/notifications/user/1',
    'GET',
    `${BASE_URL}/api/notifications/user/1`
  ));

  return results;
}

// Проверка Auth Service API
async function checkAuthAPI() {
  log('\n🔐 Auth Service API', 'blue');
  log('='.repeat(60));

  const results = [];

  // POST /api/auth/register
  results.push(await testEndpoint(
    'POST /api/auth/register',
    'POST',
    `${BASE_URL}/api/auth/register`,
    {
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123456!',
        phone: `+7999${Date.now().toString().slice(-7)}`,
      },
      showResponse: false, // Не показывать полный ответ (может содержать токены)
    }
  ));

  return results;
}

async function main() {
  log('\n🚀 API Gateway Testing Script (Phase 4)', 'cyan');
  log('='.repeat(60));
  log(`Testing API Gateway at: ${BASE_URL}`, 'cyan');
  log('='.repeat(60));

  // Проверка доступности API Gateway
  log('\n🔍 Checking API Gateway availability...', 'yellow');
  try {
    await axios.get(`${BASE_URL}/api/locations?endpoint=regions`, { timeout: 3000 });
    logSuccess('API Gateway is accessible');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logError('API Gateway is not running!');
      logWarning('Make sure Next.js frontend is running on port 3000');
      logWarning('Run: cd frontend && npm run dev');
      process.exit(1);
    } else {
      logWarning(`API Gateway responded with error: ${error.message}`);
    }
  }

  // Запуск всех проверок
  const allResults = {
    location: await checkLocationAPI(),
    availability: await checkAvailabilityAPI(),
    provider: await checkProviderAPI(),
    equipment: await checkEquipmentAPI(),
    order: await checkOrderAPI(),
    notification: await checkNotificationAPI(),
    auth: await checkAuthAPI(),
  };

  // Итоговая статистика
  log('\n' + '='.repeat(60));
  log('📊 Summary', 'cyan');
  log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const [service, results] of Object.entries(allResults)) {
    const servicePassed = results.filter(r => r.success).length;
    const serviceFailed = results.filter(r => !r.success).length;
    const serviceTotal = results.length;

    totalTests += serviceTotal;
    passedTests += servicePassed;
    failedTests += serviceFailed;

    const status = serviceFailed === 0 ? '✅' : '⚠️';
    log(`\n${status} ${service.toUpperCase()}: ${servicePassed}/${serviceTotal} passed`);

    if (serviceFailed > 0) {
      results
        .filter(r => !r.success)
        .forEach(r => {
          const errorMsg = r.error || `HTTP ${r.status}` || 'Unknown error';
          logWarning(`  - ${errorMsg}`);
        });
    }
  }

  log('\n' + '='.repeat(60));
  log(`Total: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');

  if (failedTests > 0) {
    log(`Failed: ${failedTests} tests`, 'red');
    logWarning('\n💡 Some endpoints may require:');
    logWarning('   - Running services in docker-compose');
    logWarning('   - Valid data in database');
    logWarning('   - Authentication tokens');
  } else {
    log('\n🎉 All API endpoints are working correctly!', 'green');
  }

  log('\n' + '='.repeat(60));
}

main().catch((error) => {
  logError(`\n❌ Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
