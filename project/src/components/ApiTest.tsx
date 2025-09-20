import React, { useState, useEffect } from 'react';
import api from '../api/config';

const ApiTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API connection...');
        const response = await api.get('/issues');
        console.log('API Response:', response.data);
        setIssues(Array.isArray(response.data) ? response.data : [response.data]);
        setApiStatus('✅ API Connected Successfully');
      } catch (error) {
        console.error('API Error:', error);
        setApiStatus(`❌ API Error: ${error.message}`);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
      <p className="mb-4">{apiStatus}</p>
      {issues.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Sample Issues:</h4>
          <ul className="space-y-2">
            {issues.map((issue, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded">
                <strong>{issue.title}</strong> - {issue.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiTest;