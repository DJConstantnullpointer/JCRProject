import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nodes, { JcrNode } from './components/Nodes';
import Properties from './components/Properties';
import Login from './components/Login';
import { appContainer, flexAlignStart, mainContent, buttonPrimary } from './styles';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedPath, setSelectedPath] = useState('/oh');
  const [auth, setAuth] = useState<string | null>(localStorage.getItem('auth'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  const axiosConfig = {
    headers: {
      Authorization: auth ? `Basic ${auth}` : '',
    },
  };

  const fetchChildren = async (path: string): Promise<JcrNode[]> => {
    try {
      const response = await axios.get(`http://localhost:8080/api/nodes?path=${encodeURIComponent(path)}`, axiosConfig);
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
      return [];
    }
  };

  const fetchProperties = async (path: string) => {
    setLoadingProps(true);
    try {
      const propResponse = await axios.get(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}`, axiosConfig);
      setProperties(propResponse.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
    }
    setLoadingProps(false);
  };

  useEffect(() => {
    if (auth) {
      fetchProperties(selectedPath);
    }
  }, [auth]);

  const onNodeSelect = (path: string) => {
    setSelectedPath(path);
    fetchProperties(path);
  };

  const handleAddNode = async (parentPath: string, nodeName: string) => {
    try {
      await axios.post(`http://localhost:8080/api/nodes?parentPath=${encodeURIComponent(parentPath)}&nodeName=${encodeURIComponent(nodeName)}`, {}, axiosConfig);
    } catch (error) {
      console.error('Error adding node:', error);
      alert('Failed to add node');
    }
  };

  const handleDeleteNode = async (path: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/nodes?path=${encodeURIComponent(path)}`, axiosConfig);
      if (selectedPath === path) {
        setSelectedPath('/oh');
        fetchProperties('/oh');
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      alert('Failed to delete node');
    }
  };

  const handleSetProperty = async (path: string, name: string, value: string) => {
    try {
      await axios.post(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`, {}, axiosConfig);
      fetchProperties(path);
    } catch (error) {
      console.error('Error setting property:', error);
      alert('Failed to set property');
    }
  };

  const handleDeleteProperty = async (path: string, name: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/properties?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`, axiosConfig);
      fetchProperties(path);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleLogin = (credentials: string, username: string) => {
    setAuth(credentials);
    setUsername(username);
    localStorage.setItem('auth', credentials);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setAuth(null);
    setUsername(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('username');
  };

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={appContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>JCR Browser</h1>
        <button onClick={handleLogout} style={buttonPrimary}>Logout</button>
      </div>

      <div style={flexAlignStart}>
        <Nodes 
          initialNodes={[]} 
          onSelect={onNodeSelect} 
          fetchChildren={fetchChildren}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          isAdmin={username === 'admin'}
        />
        <div style={mainContent}>
          {loadingProps ? (
            <p>Loading properties...</p>
          ) : (
            <Properties 
              path={selectedPath}
              username={username || ''}
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
