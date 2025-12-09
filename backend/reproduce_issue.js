
const API_BASE_URL = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`Sending ${method} request to ${url}`);
    if(body) console.log('Body:', JSON.stringify(body));

    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      console.error('Response Status:', response.status);
      console.error('Response Body:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    // 1. Get Users
    console.log('Fetching users...');
    const users = await apiRequest('/users');
    console.log(`Found ${users.length} users.`);
    if (users.length === 0) throw new Error('No users found');

    const ownerId = users[0].user_id;
    console.log('Using Owner ID:', ownerId);

    // 2. Create Inventory
    console.log('Creating Inventory...');
    const result = await apiRequest('/inventories', 'POST', {
        address: 'Test Address 123',
        owner_id: ownerId,
        name: 'Test Warehouse',
        status: 'Public' 
    });
    console.log('Success:', result);

  } catch (error) {
    console.error('FAILED:', error);
  }
}

main();
