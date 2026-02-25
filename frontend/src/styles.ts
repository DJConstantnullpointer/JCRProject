import React from 'react';

export const commonStyles: Record<string, React.CSSProperties> = {
  tableHeader: {
    border: '1px solid black',
    textAlign: 'left',
    backgroundColor: '#f5f5f5'
  },
  tableCell: {
    border: '1px solid black'
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid black'
  },
  buttonPrimary: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDelete: {
    cursor: 'pointer',
    color: '#d32f2f'
  },
  buttonAction: {
    marginRight: '5px',
    cursor: 'pointer'
  },
  buttonSmallPrimary: {
    marginRight: '5px',
    cursor: 'pointer',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '2px 5px',
    borderRadius: '4px'
  },
  buttonSmallDelete: {
    cursor: 'pointer',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '2px 5px',
    borderRadius: '4px'
  },
  flexSpaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  containerWithPadding: {
    flex: 1,
    paddingLeft: '20px'
  },
  appContainer: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  flexAlignStart: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  mainContent: {
    flex: 1,
    marginLeft: '20px'
  },
  fullWidthInput: {
    width: '90%'
  }
};
