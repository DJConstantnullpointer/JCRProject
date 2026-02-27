import React, { useState } from 'react';
import { 
  containerWithPadding, 
  flexSpaceBetween, 
  buttonPrimary, 
  table, 
  tableHeader, 
  tableCell, 
  buttonAction, 
  buttonDelete, 
  fullWidthInput, 
  buttonSmallPrimary, 
  buttonSmallDelete 
} from '../styles';

interface PropertiesProps {
  path: string;
  username: string;
  properties: Record<string, string>;
  onSetProperty: (path: string, name: string, value: string) => Promise<void>;
  onDeleteProperty: (path: string, name: string) => Promise<void>;
}

const Properties: React.FC<PropertiesProps> = ({ path, username, properties, onSetProperty, onDeleteProperty }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  const getAuthLevel = (accessValue: string, user: string): string => {
    if (user === 'admin') return 'ALL';
    const parts = accessValue.split(';');
    for (const part of parts) {
      const [u, auth] = part.split(':');
      if (u === user) return auth.toUpperCase();
    }
    return '';
  };

  const authLevel = path === '/oh' 
    ? (username === 'admin' ? 'ALL' : 'VIEW')
    : getAuthLevel(properties['access'] || '', username);

  const canAdd = authLevel === 'ADD' || authLevel === 'EDIT' || authLevel === 'ALL';
  const canEdit = authLevel === 'EDIT' || authLevel === 'ALL';
  const canDelete = authLevel === 'ALL';

  const handleAddProperty = () => {
    setIsAdding(true);
    setNewName('');
    setNewValue('');
  };

  const handleSaveNewProperty = async () => {
    if (!newName.trim() || !newValue.trim()) {
      alert('Please fill in both property name and value.');
      return;
    }
    await onSetProperty(path, newName, newValue);
    setIsAdding(false);
    setNewName('');
    setNewValue('');
  };

  const handleCancelAddProperty = () => {
    setIsAdding(false);
    setNewName('');
    setNewValue('');
  };

  const handleEditProperty = async (name: string, currentValue: string) => {
    const newValue = prompt(`Edit value for ${name}:`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
      await onSetProperty(path, name, newValue);
    }
  };

  const handleDeleteProperty = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete property ${name}?`)) {
      await onDeleteProperty(path, name);
    }
  };

  return (
    <div style={containerWithPadding}>
      <div style={flexSpaceBetween}>
        <h3>Properties for {path}</h3>
        {canAdd && (
          <button 
            onClick={handleAddProperty}
            style={buttonPrimary}
          >
            Add Property
          </button>
        )}
      </div>
      <table style={table} cellPadding={5}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={tableHeader}>Name</th>
            <th style={tableHeader}>Value</th>
            <th style={tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([name, value]) => (
            <tr key={name}>
              <td style={tableCell}>{name}</td>
              <td style={tableCell}>{value}</td>
              <td style={tableCell}>
                {canEdit && (
                  <button 
                    onClick={() => handleEditProperty(name, value)}
                    style={buttonAction}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => handleDeleteProperty(name)}
                    style={buttonDelete}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
          {isAdding && (
            <tr>
              <td style={tableCell}>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Property Name"
                  style={fullWidthInput}
                />
              </td>
              <td style={tableCell}>
                <input 
                  type="text" 
                  value={newValue} 
                  onChange={(e) => setNewValue(e.target.value)} 
                  placeholder="Property Value"
                  style={fullWidthInput}
                />
              </td>
              <td style={tableCell}>
                <button 
                  onClick={handleSaveNewProperty}
                  style={buttonSmallPrimary}
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelAddProperty}
                  style={buttonSmallDelete}
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Properties;
