// Simple server test script
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><body><h1>Cher\'s Closet Test Server</h1><p>Server is running successfully!</p></body></html>');
});

const port = 3001;
server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${port}`);
});