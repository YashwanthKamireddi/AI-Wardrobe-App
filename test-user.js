import fetch from 'node-fetch';

async function testUser() {
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
      
      // Get user information with the session cookie
      const userResponse = await fetch('http://localhost:3000/api/user', {
        headers: {
          'Cookie': sessionCookie
        }
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        console.log('User information:');
        // Hide sensitive information like password
        if (user.passwordHash) {
          user.passwordHash = '[REDACTED]';
        }
        console.log(user);
      } else {
        console.error('Failed to get user information:', await userResponse.text());
      }
    } else {
      console.error('No session cookie received');
    }
  } else {
    console.error('Login failed:', await loginResponse.text());
  }
}

testUser().catch(console.error);
