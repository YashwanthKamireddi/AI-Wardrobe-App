import fetch from 'node-fetch';

async function testWardrobe() {
  // First login to get the session cookie
  const loginResponse = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'fashionuser',
      password: 'password123'
    })
  });

  if (loginResponse.ok) {
    console.log('Login successful');
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const sessionCookie = setCookieHeader.split(';')[0];
      
      // Get wardrobe items with the session cookie
      const wardrobeResponse = await fetch('http://localhost:3000/api/wardrobe', {
        headers: {
          'Cookie': sessionCookie
        }
      });

      if (wardrobeResponse.ok) {
        const wardrobeItems = await wardrobeResponse.json();
        console.log(`Retrieved ${wardrobeItems.length} wardrobe items`);
        console.log('Sample items:');
        console.log(wardrobeItems.slice(0, 5)); // Show first 5 items
      } else {
        console.error('Failed to get wardrobe items:', await wardrobeResponse.text());
      }
    } else {
      console.error('No session cookie received');
    }
  } else {
    console.error('Login failed:', await loginResponse.text());
  }
}

testWardrobe().catch(console.error);
