import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDesignerStore } from '../store/designerStore';
import FormRenderer from '../renderer/FormRenderer';
import type { BaseNode } from '@my-sass/core';

function SortableItem({
  node,
  children,
  onSelect,
  selected
}: {
  node: BaseNode;
  children: React.ReactNode;
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: node.id
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: selected ? '1px solid #4096ff' : '1px solid transparent',
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
    background: '#1f1f1f'
  };

  return (
    <div ref={setNodeRef} style={style} onClick={() => onSelect(node.id)}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4, cursor: 'grab' }} {...attributes} {...listeners}>
        ⠿ 拖拽
      </div>
      {children}
    </div>
  );
}

export default function Canvas() {
  const { nodes, selectedId, setSelectedId, setNodes } = useDesignerStore();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = nodes.findIndex((n) => n.id === active.id);
    const newIndex = nodes.findIndex((n) => n.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setNodes(arrayMove(nodes, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.map((node) => (
          <SortableItem
            key={node.id}
            node={node}
            selected={selectedId === node.id}
            onSelect={setSelectedId}
          >
            <FormRenderer
              nodes={[node]}
              value={{}}
              onChange={() => {}}
            />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
