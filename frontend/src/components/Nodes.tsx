import React from 'react';

export interface JcrNode {
  name: string;
  path: string;
  hasNodes: boolean;
}

interface NodesProps {
  nodes: JcrNode[];
  onNavigate: (path: string) => void;
}

const Nodes: React.FC<NodesProps> = ({ nodes, onNavigate }) => {
  const styles = `
    .nodes-sidebar { flex: 0 0 260px; max-width: 260px; min-width: 200px; border-right: 1px solid #ccc; padding-right: 20px; }
    .nodes-sidebar h3 { margin-top: 0; }
    .nodes-list { list-style: none; padding: 0; margin: 0; }
    .node-item { margin-bottom: 8px; }
    .node-link { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; border: 1px solid #c8e6c9; background: #ffffff; color: #2e7d32; text-decoration: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
    .node-link:hover, .node-link:focus { background: #2e7d32; color: #ffffff; border-color: #2e7d32; outline: none; }
    .node-child-indicator { font-weight: bold; margin-left: 8px; opacity: 0.8; }
  `;

  const onKeyActivate = (e: React.KeyboardEvent<HTMLDivElement>, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <div className="nodes-sidebar">
      <style>{styles}</style>
      <h3>Nodes</h3>
      <ul className="nodes-list">
        {nodes.map((node) => (
          <li key={node.path} className="node-item">
            <div
              className="node-link"
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(node.path)}
              onKeyDown={(e) => onKeyActivate(e, node.path)}
            >
              <span>{node.name}</span>
              {node.hasNodes && <span className="node-child-indicator">+</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nodes;
