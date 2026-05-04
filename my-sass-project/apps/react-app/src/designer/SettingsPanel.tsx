import { useDesignerStore } from '../store/useDesignerStore';

export default function SettingsPanel() {
  const selectedNodeId = useDesignerStore((state) => state.selectedNodeId);
  const schema = useDesignerStore((state) => state.schema);
  const updateNode = useDesignerStore((state) => state.updateNode);

  // 递归查找选中的节点
  const findNode = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNode(schema, selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div style={{ width: 300, borderLeft: '1px solid #eee', padding: 16 }}>
        <h3>属性设置 (右侧面板)</h3>
        <div style={{ marginTop: 20, color: '#999', textAlign: 'center' }}>
          请在画布中选中一个节点
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    updateNode(selectedNode.id, { props: { [key]: value } });
  };

  const handleBaseChange = (key: string, value: string) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  return (
    <div style={{ width: 300, borderLeft: '1px solid #eee', padding: 16 }}>
      <h3>属性设置</h3>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>类型 (Type)</label>
          <input disabled value={selectedNode.type} style={{ width: '100%', padding: 6, backgroundColor: '#f5f5f5' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>唯一标识 (ID)</label>
          <input disabled value={selectedNode.id} style={{ width: '100%', padding: 6, backgroundColor: '#f5f5f5' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>标题 (Label)</label>
          <input 
            value={selectedNode.label || ''} 
            onChange={(e) => handleBaseChange('label', e.target.value)}
            style={{ width: '100%', padding: 6 }} 
          />
        </div>

        {selectedNode.props && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>绑定字段 (ModelKey)</label>
              <input 
                value={selectedNode.props.modelKey || ''} 
                onChange={(e) => handlePropChange('modelKey', e.target.value)}
                style={{ width: '100%', padding: 6 }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>占位提示 (Placeholder)</label>
              <input 
                value={selectedNode.props.placeholder || ''} 
                onChange={(e) => handlePropChange('placeholder', e.target.value)}
                style={{ width: '100%', padding: 6 }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>显隐条件 (VisibleOn)</label>
              <input 
                value={selectedNode.props.visibleOn || ''} 
                onChange={(e) => handlePropChange('visibleOn', e.target.value)}
                style={{ width: '100%', padding: 6 }} 
                placeholder="例如: {role} === 'admin'"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
