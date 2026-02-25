import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nodes, { JcrNode } from './components/Nodes';
import Properties from './components/Properties';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedPath, setSelectedPath] = useState('/');

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
    fetchProperties(selectedPath);
  }, []);

  const onNodeSelect = (path: string) => {
    setSelectedPath(path);
    fetchProperties(path);
  };

  const handleAddNode = async (parentPath: string, nodeName: string) => {
    try {
      await axios.post(`http://localhost:8080/api/nodes?parentPath=${encodeURIComponent(parentPath)}&nodeName=${encodeURIComponent(nodeName)}`);
    } catch (error) {
      console.error('Error adding node:', error);
      alert('Failed to add node');
    }
  };

  const handleDeleteNode = async (path: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/nodes?path=${encodeURIComponent(path)}`);
      if (selectedPath === path) {
        setSelectedPath('/');
        fetchProperties('/');
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      alert('Failed to delete node');
    }
  };

  const handleSetProperty = async (path: string, name: string, value: string) => {
    try {
      await axios.post(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`);
      fetchProperties(path);
    } catch (error) {
      console.error('Error setting property:', error);
      alert('Failed to set property');
    }
  };

  const handleDeleteProperty = async (path: string, name: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`);
      fetchProperties(path);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JCR Browser</h1>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <Nodes 
          initialNodes={[]} 
          onSelect={onNodeSelect} 
          fetchChildren={fetchChildren}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
        />
        <div style={{ flex: 1, marginLeft: '20px' }}>
          {loadingProps ? (
            <p>Loading properties...</p>
          ) : (
            <Properties 
              path={selectedPath}
              properties={properties}
              onSetProperty={handleSetProperty}
              onDeleteProperty={handleDeleteProperty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
