import fetch from 'node-fetch';
import fs from 'fs';

async function login() {
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
      console.log('Received cookie:', setCookieHeader);
      const sessionCookie = setCookieHeader.split(';')[0];
      
      // Get outfits with the session cookie
      const outfitsResponse = await fetch('http://localhost:3000/api/outfits', {
        headers: {
          'Cookie': sessionCookie
        }
      });

      if (outfitsResponse.ok) {
        const outfits = await outfitsResponse.json();
        console.log(`Retrieved ${outfits.length} outfits`);
        console.log(outfits);
      } else {
        console.error('Failed to get outfits:', await outfitsResponse.text());
      }
    } else {
      console.error('No session cookie received');
    }
  } else {
    console.error('Login failed:', await loginResponse.text());
  }
}

login().catch(console.error);