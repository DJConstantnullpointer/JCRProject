import React from 'react';

interface PropertiesProps {
  path: string;
  properties: Record<string, string>;
  onSetProperty: (path: string, name: string, value: string) => Promise<void>;
  onDeleteProperty: (path: string, name: string) => Promise<void>;
}

const Properties: React.FC<PropertiesProps> = ({ path, properties, onSetProperty, onDeleteProperty }) => {
  const handleAddProperty = async () => {
    const name = prompt('Enter property name:');
    if (name) {
      const value = prompt('Enter property value:');
      if (value !== null) {
        await onSetProperty(path, name, value);
      }
    }
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
    <div style={{ flex: 1, paddingLeft: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Properties for {path}</h3>
        <button 
          onClick={handleAddProperty}
          style={{ 
            backgroundColor: '#2e7d32', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Add Property
        </button>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black' }} cellPadding={5}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ border: '1px solid black', textAlign: 'left' }}>Name</th>
            <th style={{ border: '1px solid black', textAlign: 'left' }}>Value</th>
            <th style={{ border: '1px solid black', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([name, value]) => (
            <tr key={name}>
              <td style={{ border: '1px solid black' }}>{name}</td>
              <td style={{ border: '1px solid black' }}>{value}</td>
              <td style={{ border: '1px solid black' }}>
                <button 
                  onClick={() => handleEditProperty(name, value)}
                  style={{ marginRight: '5px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteProperty(name)}
                  style={{ cursor: 'pointer', color: '#d32f2f' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Properties;
