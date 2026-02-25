import React from 'react';

interface PropertiesProps {
  properties: Record<string, string>;
}

const Properties: React.FC<PropertiesProps> = ({ properties }) => {
  return (
    <div style={{ flex: 1, paddingLeft: '20px' }}>
      <h3>Properties</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black' }} cellPadding={5}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([name, value]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Properties;
