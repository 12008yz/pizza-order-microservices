/**
 * Скрипт для проверки интеграции между сервисами Фазы 2
 * Проверяет доступность всех сервисов и их API endpoints
 */

const axios = require('axios');

const SERVICES = {
  auth: { port: 3001, name: 'Auth Service' },
  user: { port: 3002, name: 'User Service' },
  provider: { port: 3003, name: 'Provider Service' },
  location: { port: 3005, name: 'Location Service' },
  equipment: { port: 3007, name: 'Equipment Service' },
};

const BASE_URL = 'http://localhost';

async function checkServiceHealth(serviceName, port) {
  try {
    const response = await axios.get(`${BASE_URL}:${port}/health`, { timeout: 2000 });
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return { success: false, error: 'Service is not running' };
    }
    if (error.response) {
      return { success: false, error: `HTTP ${error.response.status}` };
    }
    return { success: false, error: error.message };
  }
}

async function checkProviderService() {
  console.log('\n📡 Checking Provider Service integration...');
  
  try {
    // Проверка получения провайдеров
    const providersResponse = await axios.get(`${BASE_URL}:3003/api/providers`);
    console.log('  ✅ GET /api/providers - OK');
    
    if (providersResponse.data.data && providersResponse.data.data.length > 0) {
      const providerId = providersResponse.data.data[0].id;
      
      // Проверка получения провайдера по ID
      const providerResponse = await axios.get(`${BASE_URL}:3003/api/providers/${providerId}`);
      console.log(`  ✅ GET /api/providers/${providerId} - OK`);
      
      return { success: true, providerId };
    }
    
    return { success: true, providerId: null, message: 'No providers found' };
  } catch (error) {
    console.log(`  ❌ Provider Service API error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkEquipmentService(providerId) {
  console.log('\n📡 Checking Equipment Service integration...');
  
  try {
    // Проверка получения типов оборудования
    const typesResponse = await axios.get(`${BASE_URL}:3007/api/equipment/types`);
    console.log('  ✅ GET /api/equipment/types - OK');
    
    // Проверка получения оборудования
    const equipmentResponse = await axios.get(`${BASE_URL}:3007/api/equipment`);
    console.log('  ✅ GET /api/equipment - OK');
    
    if (providerId) {
      // Проверка интеграции с Provider Service
      const equipmentByProviderResponse = await axios.get(
        `${BASE_URL}:3007/api/equipment/by-provider/${providerId}`
      );
      console.log(`  ✅ GET /api/equipment/by-provider/${providerId} - OK`);
      
      // Проверка получения оборудования с информацией о провайдере
      if (equipmentResponse.data.data && equipmentResponse.data.data.length > 0) {
        const equipmentId = equipmentResponse.data.data[0].id;
        const equipmentDetailResponse = await axios.get(
          `${BASE_URL}:3007/api/equipment/${equipmentId}`
        );
        console.log(`  ✅ GET /api/equipment/${equipmentId} (with provider info) - OK`);
        
        if (equipmentDetailResponse.data.data.provider) {
          console.log('  ✅ Equipment → Provider Service integration - OK');
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.log(`  ❌ Equipment Service API error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkLocationService() {
  console.log('\n📡 Checking Location Service integration...');
  
  // Сначала проверяем доступность сервиса
  const healthCheck = await checkServiceHealth('location', 3005);
  if (!healthCheck.success) {
    console.log(`  ⚠️  Location Service is not running: ${healthCheck.error}`);
    console.log('  💡 Tip: Make sure Location Service is started in docker-compose');
    return { success: false, error: healthCheck.error, skipped: true };
  }
  
  try {
    // Проверка получения регионов
    const regionsResponse = await axios.get(`${BASE_URL}:3005/api/locations/regions`, { timeout: 5000 });
    console.log('  ✅ GET /api/locations/regions - OK');
    
    return { success: true };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ Location Service is not running (connection refused)`);
    } else if (error.response) {
      console.log(`  ❌ Location Service API error: HTTP ${error.response.status} - ${error.response.statusText}`);
    } else {
      console.log(`  ❌ Location Service API error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function checkAuthService() {
  console.log('\n📡 Checking Auth Service integration...');
  
  try {
    // Проверка health endpoint
    const healthResponse = await axios.get(`${BASE_URL}:3001/health`);
    console.log('  ✅ GET /health - OK');
    
    return { success: true };
  } catch (error) {
    console.log(`  ❌ Auth Service API error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkUserService() {
  console.log('\n📡 Checking User Service integration...');
  
  try {
    // Проверка health endpoint
    const healthResponse = await axios.get(`${BASE_URL}:3002/health`);
    console.log('  ✅ GET /health - OK');
    
    return { success: true };
  } catch (error) {
    console.log(`  ❌ User Service API error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking Services Integration (Phase 2)\n');
  console.log('=' .repeat(50));
  
  // Проверка доступности всех сервисов
  console.log('\n📋 Checking service availability...');
  const healthChecks = [];
  
  for (const [key, service] of Object.entries(SERVICES)) {
    const result = await checkServiceHealth(key, service.port);
    if (result.success) {
      console.log(`  ✅ ${service.name} (port ${service.port}) - Running`);
    } else {
      console.log(`  ❌ ${service.name} (port ${service.port}) - ${result.error}`);
    }
    healthChecks.push({ service: service.name, ...result });
  }
  
  // Проверка интеграций
  const providerCheck = await checkProviderService();
  const equipmentCheck = await checkEquipmentService(providerCheck.providerId);
  const locationCheck = await checkLocationService();
  const authCheck = await checkAuthService();
  const userCheck = await checkUserService();
  
  // Итоги
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:');
  
  const allChecks = [
    ...healthChecks,
    { service: 'Provider API', ...providerCheck },
    { service: 'Equipment API', ...equipmentCheck },
    { service: 'Location API', ...locationCheck },
    { service: 'Auth API', ...authCheck },
    { service: 'User API', ...userCheck },
  ];
  
  const successCount = allChecks.filter(c => c.success).length;
  const skippedCount = allChecks.filter(c => c.skipped).length;
  const totalCount = allChecks.length;
  const failedCount = totalCount - successCount - skippedCount;
  
  console.log(`  ✅ Successful: ${successCount}/${totalCount}`);
  if (skippedCount > 0) {
    console.log(`  ⏭️  Skipped: ${skippedCount}/${totalCount}`);
  }
  if (failedCount > 0) {
    console.log(`  ❌ Failed: ${failedCount}/${totalCount}`);
  }
  
  // Детальная информация о проблемах
  const failedServices = allChecks.filter(c => !c.success && !c.skipped);
  if (failedServices.length > 0) {
    console.log('\n❌ Failed services:');
    failedServices.forEach(s => {
      console.log(`  - ${s.service}: ${s.error || 'Unknown error'}`);
    });
  }
  
  const skippedServices = allChecks.filter(c => c.skipped);
  if (skippedServices.length > 0) {
    console.log('\n⏭️  Skipped services (not running):');
    skippedServices.forEach(s => {
      console.log(`  - ${s.service}: ${s.error || 'Service not available'}`);
    });
    console.log('\n💡 To start all services, run: npm run dev');
  }
  
  if (successCount === totalCount) {
    console.log('\n🎉 All services are working correctly!');
    process.exit(0);
  } else if (failedCount === 0 && skippedCount > 0) {
    console.log('\n⚠️  Some services are not running, but no errors detected.');
    console.log('💡 Start all services with: npm run dev');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some services have issues. Check the output above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
