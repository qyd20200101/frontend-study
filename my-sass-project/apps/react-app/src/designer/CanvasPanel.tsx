import { useDesignerStore } from '../store/useDesignerStore';
import FormRenderer from '../renderer/FormRenderer';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BaseNode } from '@my-sass/core';

// 拖拽和选中的包装器
function SortableNodeWrapper({ node, children }: { node: BaseNode, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const selectedNodeId = useDesignerStore((state) => state.selectedId);
  const selectNode = useDesignerStore((state) => state.setSelectedId);

  const isSelected = selectedNodeId === node.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: isSelected ? '2px solid #1890ff' : '2px dashed transparent',
    padding: 8,
    marginBottom: 8,
    position: 'relative' as const,
    backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
    >
      {children}
    </div>
  );
}

export default function CanvasPanel() {
  const nodes = useDesignerStore((state) => state.nodes);
  const reorderNodes = useDesignerStore((state) => state.reorderNodes);
  const selectNode = useDesignerStore((state) => state.setSelectedId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 区分点击和拖拽
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);
      reorderNodes(oldIndex, newIndex);
    }
  };

  return (
    <div 
      style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 24, overflow: 'auto' }}
      onClick={() => selectNode(null)} // 点击空白处取消选中
    >
      <div style={{ backgroundColor: '#fff', minHeight: 600, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        {nodes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 100 }}>
            请从左侧点击添加组件
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={nodes.map((n: BaseNode) => n.id)} strategy={verticalListSortingStrategy}>
              <FormRenderer
                nodes={nodes}
                value={{}}
                onChange={() => {}}
                nodeWrapper={(node, element) => (
                  <SortableNodeWrapper key={node.id} node={node}>
                    {element}
                  </SortableNodeWrapper>
                )}
              />
            </SortableContext>
          </DndContext>
        )}
      </div>
      
      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#333', color: '#fff', borderRadius: 8 }}>
        <h4>当前 Schema 数据 (只读)</h4>
        <pre style={{ fontSize: 12 }}>{JSON.stringify(nodes, null, 2)}</pre>
      </div>
    </div>
  );
}
