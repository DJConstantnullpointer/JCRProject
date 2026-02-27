import React, { useState } from 'react';
import { flexSpaceBetween } from '../styles';

export interface JcrNode {
  name: string;
  path: string;
  hasNodes: boolean;
  children?: JcrNode[];
}

interface NodeItemProps {
  node: JcrNode;
  onSelect: (path: string) => void;
  fetchChildren: (path: string) => Promise<JcrNode[]>;
  onAddNode: (parentPath: string, nodeName: string) => Promise<void>;
  onDeleteNode: (path: string) => Promise<void>;
  isRoot?: boolean;
  isAdmin?: boolean;
}

const NodeItem: React.FC<NodeItemProps> = ({ node, onSelect, fetchChildren, onAddNode, onDeleteNode, isRoot, isAdmin }) => {
  const [expanded, setExpanded] = useState(isRoot ? true : false);
  const [children, setChildren] = useState<JcrNode[]>(node.children || []);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchIfEmpty = async () => {
    if (!hasFetched && node.hasNodes) {
      setLoading(true);
      const fetchedChildren = await fetchChildren(node.path);
      setChildren(fetchedChildren);
      setLoading(false);
      setHasFetched(true);
    }
  };

  React.useEffect(() => {
    if (isRoot) {
      fetchIfEmpty();
    }
  }, [isRoot]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded) {
      await fetchIfEmpty();
    }
    setExpanded(!expanded);
  };

  const handleSelect = () => {
    onSelect(node.path);
  };

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt('Enter new node name:');
    if (name) {
      await onAddNode(node.path, name);
      // Refresh children after adding
      const fetchedChildren = await fetchChildren(node.path);
      setChildren(fetchedChildren);
      setHasFetched(true);
      setExpanded(true);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete node ${node.name}?`)) {
      await onDeleteNode(node.path);
      // We can't easily refresh the parent's children from here without a refresh callback
      // but App.tsx will likely handle a global refresh or the user can manually re-expand
      alert('Node deleted. Please refresh or re-expand parent.');
    }
  };

  return (
    <li className="node-item">
      <div className="node-row">
        {node.hasNodes ? (
          <button className="toggle-button" onClick={handleToggle}>
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="toggle-spacer" />
        )}
        <div
          className="node-link"
          role="button"
          tabIndex={0}
          onClick={handleSelect}
        >
          <span>{node.name}</span>
        </div>
        {isAdmin && (
          <button className="action-button add" onClick={handleAddChild} title="Add Child Node">+</button>
        )}
        {!isRoot && (
          <button className="action-button delete" onClick={handleDelete} title="Delete Node">×</button>
        )}
      </div>
      {expanded && (
        <ul className="nodes-list nested">
          {loading && <li className="node-item loading">Loading...</li>}
          {!loading && children.length === 0 && node.hasNodes && (
             <li className="node-item loading">No children found</li>
          )}
          {children.map((child) => (
            <NodeItem
              key={child.path}
              node={child}
              onSelect={onSelect}
              fetchChildren={fetchChildren}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

interface NodesProps {
  initialNodes: JcrNode[];
  onSelect: (path: string) => void;
  fetchChildren: (path: string) => Promise<JcrNode[]>;
  onAddNode: (parentPath: string, nodeName: string) => Promise<void>;
  onDeleteNode: (path: string) => Promise<void>;
  isAdmin?: boolean;
}

const Nodes: React.FC<NodesProps> = ({ initialNodes, onSelect, fetchChildren, onAddNode, onDeleteNode, isAdmin }) => {
  const styles = `
    .nodes-sidebar { flex: 0 0 300px; max-width: 400px; min-width: 250px; border-right: 1px solid #ccc; padding-right: 20px; overflow-x: auto; }
    .nodes-sidebar h3 { margin-top: 0; }
    .nodes-list { list-style: none; padding: 0; margin: 0; }
    .nodes-list.nested { padding-left: 20px; border-left: 1px dashed #ccc; margin-left: 10px; }
    .node-item { margin-bottom: 4px; }
    .node-row { display: flex; align-items: center; }
    .toggle-button { background: none; border: none; cursor: pointer; padding: 4px; font-size: 10px; color: #666; width: 20px; display: flex; justify-content: center; }
    .toggle-button:hover { color: #2e7d32; }
    .toggle-spacer { width: 20px; }
    .node-link { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; border: 1px solid transparent; color: #2e7d32; text-decoration: none; cursor: pointer; transition: all 0.15s ease; }
    .node-link:hover, .node-link:focus { background: #e8f5e9; border-color: #c8e6c9; outline: none; }
    .node-item.loading { padding-left: 28px; font-size: 12px; color: #888; font-style: italic; }
    .action-button { background: none; border: none; cursor: pointer; padding: 0 6px; font-size: 16px; visibility: hidden; }
    .node-row:hover .action-button { visibility: visible; }
    .action-button.add { color: #2e7d32; }
    .action-button.delete { color: #d32f2f; }
  `;

  return (
    <div className="nodes-sidebar">
      <style>{styles}</style>
      <div style={flexSpaceBetween}>
        <h3>Nodes</h3>
      </div>
      <ul className="nodes-list">
        <NodeItem
           node={{ name: 'oh', path: '/oh', hasNodes: true }}
           onSelect={onSelect}
           fetchChildren={fetchChildren}
           onAddNode={onAddNode}
           onDeleteNode={onDeleteNode}
           isRoot={true}
           isAdmin={isAdmin}
        />
      </ul>
    </div>
  );
};

export default Nodes;
