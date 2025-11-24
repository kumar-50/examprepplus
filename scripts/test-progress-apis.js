/**
 * Test Progress Dashboard API Endpoints
 */

async function testProgressAPIs() {
  console.log('🧪 Testing Progress Dashboard APIs...\n');

  const baseUrl = 'http://localhost:3000';
  const testUserId = '00000000-0000-0000-0000-000000000000'; // Replace with real user ID

  const tests = [
    {
      name: 'Readiness API',
      url: '/api/progress/readiness',
      method: 'GET'
    },
    {
      name: 'Streak API',
      url: '/api/progress/streak',
      method: 'GET'
    },
    {
      name: 'Goals API',
      url: '/api/progress/goals',
      method: 'GET'
    },
    {
      name: 'Achievements API',
      url: '/api/progress/achievements',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.url}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const status = response.status;
      const statusIcon = status === 200 ? '✅' : status === 401 ? '🔐' : '❌';
      
      console.log(`${statusIcon} ${test.name}: ${status} ${response.statusText}`);

      if (status === 200) {
        const data = await response.json();
        console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      } else if (status === 401) {
        console.log('   (Expected - requires authentication)');
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
    }
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Login to your application');
  console.log('2. Visit: http://localhost:3000/dashboard/progress');
  console.log('3. Complete a test to see data populate');
  console.log('4. Check achievements unlock automatically\n');
}

testProgressAPIs();
