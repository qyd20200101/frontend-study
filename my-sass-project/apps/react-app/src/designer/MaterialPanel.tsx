import { useDesignerStore } from '../store/useDesignerStore';
import { defaultInputNode } from '@my-sass/core';

export default function MaterialPanel() {
  const addNode = useDesignerStore((state) => state.addNode);

  const handleAddInput = () => {
    // 模拟拖拽/点击添加节点，生成唯一ID
    const newNode = {
      ...defaultInputNode,
      id: `input_${Date.now()}`,
      props: {
        ...defaultInputNode.props,
        modelKey: `field_${Date.now()}` // 防止重复
      }
    };
    addNode(newNode);
  };

  return (
    <div style={{ width: 260, borderRight: '1px solid #eee', padding: 16 }}>
      <h3>组件库 (物料区)</h3>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button 
          onClick={handleAddInput}
          style={{ padding: '8px 16px', cursor: 'pointer', textAlign: 'left' }}
        >
          + 添加输入框 (Input)
        </button>
        {/* TODO: 添加更多基础物料 */}
      </div>
    </div>
  );
}
