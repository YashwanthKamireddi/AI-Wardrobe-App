import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

/**
 * API Test Component
 * 
 * This component provides a simple interface to test API endpoints without
 * running the full application. It can be used in both Replit and VS Code
 * environments.
 * 
 * To run: 
 * 1. In Replit: Add an index.html file that loads this component
 * 2. In VS Code: Run with `npx vite` and add an import for this component
 */
function TestComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [endpoint, setEndpoint] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const apiEndpoints = [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'Weather (NY)', path: '/api/weather?location=New+York', method: 'GET' },
    { name: 'Database Check', path: '/api/health?check=database', method: 'GET' },
    { name: 'All Inspirations', path: '/api/inspirations', method: 'GET' }
  ];

  async function fetchData() {
    setLoading(true);
    setError(null);
    setData(null);
    setStatusCode(null);
    setResponseTime(null);
    
    const startTime = performance.now();
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (method !== 'GET' && method !== 'HEAD' && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch (e) {
          setError('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch(endpoint, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.message || `API responded with status ${response.status}`;
        } catch (e) {
          errorText = `API responded with status ${response.status}`;
        }
        throw new Error(errorText);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const handleSelectEndpoint = (path: string, method: string) => {
    setEndpoint(path);
    setMethod(method);
    // Clear request body for GET requests
    if (method === 'GET') {
      setRequestBody('');
    }
  };

  // Simple styling for the component
  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' },
    form: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc' },
    select: { padding: '8px', marginBottom: '12px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '8px 16px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    quickLinks: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
    quickLink: { padding: '6px 12px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    responseContainer: { border: '1px solid #e2e8f0', borderRadius: '4px', padding: '16px', background: '#f8fafc' },
    responseHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    responseTitle: { fontWeight: 'bold' },
    responseDetails: { fontSize: '14px', color: '#64748b' },
    pre: { background: '#1e293b', color: '#e2e8f0', padding: '12px', borderRadius: '4px', overflow: 'auto', maxHeight: '400px' },
    error: { color: '#e53e3e', padding: '12px', background: '#fee2e2', borderRadius: '4px', marginBottom: '16px' },
    textarea: { width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px', fontFamily: 'monospace' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>API Tester</h1>
      
      <div style={styles.form}>
        <div style={styles.quickLinks}>
          {apiEndpoints.map((ep, index) => (
            <div 
              key={index} 
              style={styles.quickLink}
              onClick={() => handleSelectEndpoint(ep.path, ep.method)}
            >
              {ep.name}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={styles.select}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <input 
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="API endpoint (e.g. /api/health)"
            style={{ ...styles.input, flex: 1 }}
          />
          
          <button 
            onClick={fetchData}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Send Request'}
          </button>
        </div>
        
        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div>
            <label style={styles.label}>Request Body (JSON):</label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder='{"key": "value"}'
              style={styles.textarea}
            />
          </div>
        )}
      </div>
      
      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={styles.responseContainer}>
        <div style={styles.responseHeader}>
          <div style={styles.responseTitle}>Response</div>
          <div style={styles.responseDetails}>
            {statusCode && `Status: ${statusCode}`}
            {responseTime && ` • Time: ${responseTime}ms`}
          </div>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : data ? (
          <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>No data available. Send a request to see results.</p>
        )}
      </div>
      
      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '16px' }}>
        Note: This component only works when the API server is running. Protected endpoints may require authentication.
      </p>
    </div>
  );
}

// Export the component so it can be imported elsewhere
export default TestComponent;

// You can uncomment this to run the component directly in development
/*
if (typeof document !== 'undefined') {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <TestComponent />
      </React.StrictMode>
    );
  }
}
*/