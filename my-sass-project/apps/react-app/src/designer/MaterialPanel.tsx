import { useDesignerStore } from '../store/useDesignerStore';
import { defaultInputNode, defaultSelectNode, defaultDateNode, defaultRadioNode } from '@my-sass/core';
import { useDraggable } from '@dnd-kit/core';

function DraggableMaterial({ type, label }: { type: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `material-${type}`,
    data: { type, label },
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: '10px 16px',
    cursor: 'grab',
    textAlign: 'left' as const,
    backgroundColor: isDragging ? '#e6f7ff' : '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    transition: 'background-color 0.2s',
    userSelect: 'none' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      + {label}
    </div>
  );
}

export default function MaterialPanel() {
  const addNode = useDesignerStore((state) => state.addNode);

  const handleAddInput = () => {
    const newNode = {
      ...defaultInputNode,
      id: `input_${Date.now()}`,
      props: {
        ...defaultInputNode.props,
        modelKey: `field_${Date.now()}`
      }
    };
    addNode(newNode);
  };

  return (
    <div style={{ width: 260, borderRight: '1px solid #e8e8e8', padding: 16, backgroundColor: '#fafafa' }}>
      <h3 style={{ fontSize: 14, color: '#333', marginBottom: 16, fontWeight: 600 }}>组件库</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DraggableMaterial type="input" label="输入框 (Input)" />
        <DraggableMaterial type="select" label="选择器 (Select)" />
        <DraggableMaterial type="date" label="日期选择 (Date)" />
        <DraggableMaterial type="radio" label="单选框 (Radio)" />
      </div>
    </div>
  );
}
