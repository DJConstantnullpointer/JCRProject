import React, { useState } from 'react';
import { commonStyles } from '../styles';

interface PropertiesProps {
  path: string;
  properties: Record<string, string>;
  onSetProperty: (path: string, name: string, value: string) => Promise<void>;
  onDeleteProperty: (path: string, name: string) => Promise<void>;
}

const Properties: React.FC<PropertiesProps> = ({ path, properties, onSetProperty, onDeleteProperty }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

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
    <div style={commonStyles.containerWithPadding}>
      <div style={commonStyles.flexSpaceBetween}>
        <h3>Properties for {path}</h3>
        <button 
          onClick={handleAddProperty}
          style={commonStyles.buttonPrimary}
        >
          Add Property
        </button>
      </div>
      <table style={commonStyles.table} cellPadding={5}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={commonStyles.tableHeader}>Name</th>
            <th style={commonStyles.tableHeader}>Value</th>
            <th style={commonStyles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([name, value]) => (
            <tr key={name}>
              <td style={commonStyles.tableCell}>{name}</td>
              <td style={commonStyles.tableCell}>{value}</td>
              <td style={commonStyles.tableCell}>
                <button 
                  onClick={() => handleEditProperty(name, value)}
                  style={commonStyles.buttonAction}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteProperty(name)}
                  style={commonStyles.buttonDelete}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {isAdding && (
            <tr>
              <td style={commonStyles.tableCell}>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Property Name"
                  style={commonStyles.fullWidthInput}
                />
              </td>
              <td style={commonStyles.tableCell}>
                <input 
                  type="text" 
                  value={newValue} 
                  onChange={(e) => setNewValue(e.target.value)} 
                  placeholder="Property Value"
                  style={commonStyles.fullWidthInput}
                />
              </td>
              <td style={commonStyles.tableCell}>
                <button 
                  onClick={handleSaveNewProperty}
                  style={commonStyles.buttonSmallPrimary}
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelAddProperty}
                  style={commonStyles.buttonSmallDelete}
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
