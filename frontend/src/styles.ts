import React from 'react';

export const tableHeader: React.CSSProperties = {
  border: '1px solid black',
  textAlign: 'left',
  backgroundColor: '#f5f5f5'
};

export const tableCell: React.CSSProperties = {
  border: '1px solid black'
};

export const table: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  border: '1px solid black'
};

export const buttonPrimary: React.CSSProperties = {
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

export const buttonDelete: React.CSSProperties = {
  cursor: 'pointer',
  color: '#d32f2f'
};

export const buttonAction: React.CSSProperties = {
  marginRight: '5px',
  cursor: 'pointer'
};

export const buttonSmallPrimary: React.CSSProperties = {
  marginRight: '5px',
  cursor: 'pointer',
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  padding: '2px 5px',
  borderRadius: '4px'
};

export const buttonSmallDelete: React.CSSProperties = {
  cursor: 'pointer',
  backgroundColor: '#d32f2f',
  color: 'white',
  border: 'none',
  padding: '2px 5px',
  borderRadius: '4px'
};

export const flexSpaceBetween: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export const containerWithPadding: React.CSSProperties = {
  flex: 1,
  paddingLeft: '20px'
};

export const appContainer: React.CSSProperties = {
  padding: '20px',
  fontFamily: 'Arial, sans-serif'
};

export const flexAlignStart: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start'
};

export const mainContent: React.CSSProperties = {
  flex: 1,
  marginLeft: '20px'
};

export const fullWidthInput: React.CSSProperties = {
  width: '90%'
};
