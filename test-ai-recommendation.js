import fetch from 'node-fetch';

async function testAIRecommendations() {
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
      
      // Get AI outfit recommendations with the session cookie
      const aiResponse = await fetch('http://localhost:3000/api/ai-outfit-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify({
          occasion: 'casual',
          weather: 'sunny',
          mood: 'happy'
        })
      });

      if (aiResponse.ok) {
        const recommendations = await aiResponse.json();
        console.log('AI Outfit Recommendations:');
        console.log(JSON.stringify(recommendations, null, 2));
      } else {
        console.error('Failed to get AI recommendations:', await aiResponse.text());
      }
    } else {
      console.error('No session cookie received');
    }
  } else {
    console.error('Login failed:', await loginResponse.text());
  }
}

testAIRecommendations().catch(console.error);
