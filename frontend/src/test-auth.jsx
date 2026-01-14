import React, { useState } from 'react';
import axios from 'axios';

const TestAuth = () => {
  const [status, setStatus] = useState('Loading...');
  const [result, setResult] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [axiosResult, setAxiosResult] = useState('');

  // Check current auth status on component mount
  React.useEffect(() => {
    // Show API URL for debugging
    const url = 'http://localhost:8000 (proxied via /api)';
    setApiUrl(url);
    console.log('Using proxy configuration - requests to /api/* will be proxied to backend');

    // Test basic connectivity first
    fetch('/api/health')
    .then(response => {
      console.log('Health check status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Health check data:', data);
    })
    .catch(error => {
      console.error('Health check failed:', error);
    });

    // Then check auth
    fetch('/api/auth/me', {
      credentials: 'include'
    })
    .then(response => {
      console.log('Auth check response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Auth check response data:', data);
      if (data.success) {
        setStatus('Authenticated as: ' + data.data.name);
      } else {
        setStatus('Not authenticated');
      }
    })
    .catch(error => {
      console.error('Auth check error:', error);
      setStatus('Error checking auth: ' + error.message);
    });
  }, []);

  const handleRegister = async () => {
    setResult('Registering...');
    try {
      const email = 'test' + Date.now() + '@example.com';
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Test User ' + Date.now(),
          email: email,
          password: 'password123'
        })
      });
      const data = await response.json();

      // Store the registered email for login
      if (data.success) {
        localStorage.setItem('lastRegisteredEmail', email);
      }

      setResult('Register result: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Register error: ' + error.message);
    }
  };

  const handleLogin = async () => {
    setResult('Logging in...');
    try {
      // Try to login with the last registered user, or fallback to a known working user
      const lastRegistered = localStorage.getItem('lastRegisteredEmail') || 'proxy@example.com';

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: lastRegistered,
          password: 'password123'
        })
      });
      const data = await response.json();
      setResult('Login result for ' + lastRegistered + ': ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Login error: ' + error.message);
    }
  };

  const handleDashboard = async () => {
    setResult('Loading dashboard...');
    try {
      const response = await fetch('/api/gigs/user/me', {
        credentials: 'include'
      });
      const data = await response.json();
      setResult('Dashboard result: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Dashboard error: ' + error.message);
    }
  };

  const handleCreateGig = async () => {
    setResult('Creating gig...');
    try {
      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Test Gig ' + Date.now(),
          description: 'This is a test gig created from the test component',
          budget: 100
        })
      });
      const data = await response.json();
      setResult('Gig creation result: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Gig creation error: ' + error.message);
    }
  };

  const handleTestAxios = async () => {
    setAxiosResult('Testing axios...');
    try {
      const response = await axios.get('/api/health');
      setAxiosResult('Axios health result: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Axios error:', error);
      setAxiosResult('Axios error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p className="text-gray-600">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <p className="text-sm text-gray-600">API URL: <code>{apiUrl}</code></p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleRegister}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register Test User
            </button>
            <button
              onClick={handleLogin}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Login Test User
            </button>
            <button
              onClick={handleDashboard}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Dashboard
            </button>
            <button
              onClick={handleCreateGig}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Create Gig
            </button>
            <button
              onClick={handleTestAxios}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Test Axios
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Fetch Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {result || 'Click a button to test...'}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Axios Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {axiosResult || 'Click "Test Axios" to test...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;