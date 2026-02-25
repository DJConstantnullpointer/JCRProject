import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nodes, { JcrNode } from './components/Nodes';
import Properties from './components/Properties';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loadingProps, setLoadingProps] = useState(false);

  const fetchChildren = async (path: string): Promise<JcrNode[]> => {
    try {
      const response = await axios.get(`http://localhost:8080/api/nodes?path=${encodeURIComponent(path)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      return [];
    }
  };

  const fetchProperties = async (path: string) => {
    setLoadingProps(true);
    try {
      const propResponse = await axios.get(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}`);
      setProperties(propResponse.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
    setLoadingProps(false);
  };

  useEffect(() => {
    fetchProperties(currentPath);
  }, [currentPath]);

  const onNodeSelect = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JCR Browser</h1>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Path:</strong> {currentPath}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Nodes initialNodes={[]} onSelect={onNodeSelect} fetchChildren={fetchChildren} />
        <div style={{ flex: 1, marginLeft: '20px' }}>
          {loadingProps ? (
            <p>Loading properties...</p>
          ) : (
            <Properties properties={properties} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
