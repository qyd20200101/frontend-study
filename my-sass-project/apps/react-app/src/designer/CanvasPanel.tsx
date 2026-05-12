import { useDesignerStore } from '../store/useDesignerStore';
import FormRenderer from '../renderer/FormRenderer';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BaseNode } from '@my-sass/core';
import { defaultInputNode } from '@my-sass/core';

function SortableNodeWrapper({ node, children }: { node: BaseNode, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const selectedNodeId = useDesignerStore((state) => state.selectedId);
  const selectNode = useDesignerStore((state) => state.setSelectedId);

  const isSelected = selectedNodeId === node.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: isSelected ? '2px solid #1890ff' : '2px dashed transparent',
    padding: 12,
    marginBottom: 8,
    position: 'relative' as const,
    backgroundColor: isSelected ? '#e6f7ff' : '#fafafa',
    cursor: 'move',
    borderRadius: 8,
    boxShadow: isSelected ? '0 0 0 2px rgba(24,144,255,0.2)' : 'none',
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

function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable' });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 500,
        padding: 24,
        borderRadius: 12,
        border: isOver ? '3px dashed #1890ff' : '3px dashed #d9d9d9',
        backgroundColor: isOver ? 'rgba(24,144,255,0.04)' : '#fff',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

interface CanvasPanelProps {
  activeDrag: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function CanvasPanel({ activeDrag, onDragStart, onDragEnd }: CanvasPanelProps) {
  const nodes = useDesignerStore((state) => state.nodes);
  const selectNode = useDesignerStore((state) => state.setSelectedId);

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #f0f5ff 0%, #f5f0ff 50%, #f0f5f5 100%)',
        padding: 24,
        overflow: 'auto',
      }}
      onClick={() => selectNode(null)}
    >
      <DroppableCanvas>
        {nodes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bfbfbf', marginTop: 120, fontSize: 16, userSelect: 'none' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⬇️</div>
            从左侧拖拽组件到此处，或点击添加
          </div>
        ) : (
          <SortableContext items={nodes.filter(Boolean).map((n: BaseNode) => n.id)} strategy={verticalListSortingStrategy}>
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
        )}
      </DroppableCanvas>

      <DragOverlay>
        {activeDrag?.startsWith('material-') ? (
          <div style={{ padding: '10px 16px', backgroundColor: '#e6f7ff', borderRadius: 6, border: '2px solid #1890ff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            + {activeDrag.replace('material-', '').toUpperCase()}
          </div>
        ) : null}
      </DragOverlay>

      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#1a1a2e', color: '#a8d8ea', borderRadius: 8 }}>
        <h4 style={{ color: '#fff', fontSize: 13, marginBottom: 8 }}>当前 Schema 数据（只读）</h4>
        <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(nodes, null, 2)}</pre>
      </div>
    </div>
  );
}
