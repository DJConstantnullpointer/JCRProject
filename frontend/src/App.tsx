import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nodes, { JcrNode } from './components/Nodes';
import Properties from './components/Properties';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [nodes, setNodes] = useState<JcrNode[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchNodes = async (path: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/nodes?path=${encodeURIComponent(path)}`);
      setNodes(response.data);
      
      const propResponse = await axios.get(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}`);
      setProperties(propResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNodes(currentPath);
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/') || '/';
    setCurrentPath(parentPath);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JCR Browser</h1>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Path:</strong> {currentPath}
        {currentPath !== '/' && (
          <button onClick={goUp} style={{ marginLeft: '10px' }}>Go Up</button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'flex' }}>
          <Nodes nodes={nodes} onNavigate={navigateTo} />
          <Properties properties={properties} />
        </div>
      )}
    </div>
  );
};

export default App;
