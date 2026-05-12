import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import MaterialPanel from './MaterialPanel';
import CanvasPanel from './CanvasPanel';
import SettingsPanel from './SettingsPanel';
import { useDesignerStore } from '../store/useDesignerStore';
import { defaultInputNode, defaultSelectNode, defaultDateNode, defaultRadioNode } from '@my-sass/core';
import type { BaseNode } from '@my-sass/core';

export default function Designer() {
  const nodes = useDesignerStore((state) => state.nodes);
  const addNode = useDesignerStore((state) => state.addNode);
  const reorderNodes = useDesignerStore((state) => state.reorderNodes);
  const [activeDrag, setActiveDrag] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveDrag(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;

    // 从物料库拖入画布
    if (activeId.startsWith('material-') && over.id === 'canvas-droppable') {
      const type = (active.data.current as any)?.type || 'input';
      
      const defaults: Record<string, any> = {
        input: defaultInputNode,
        select: defaultSelectNode,
        date: defaultDateNode,
        radio: defaultRadioNode,
      };

      const baseNode = defaults[type] || defaultInputNode;

      const newNode: BaseNode = {
        ...baseNode,
        id: `${type}_${Date.now()}`,
        type: type as BaseNode['type'],
        props: {
          ...baseNode.props,
          modelKey: `field_${Date.now()}`
        }
      };
      addNode(newNode);
      return;
    }

    // 画布内排序
    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderNodes(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <MaterialPanel />
        <CanvasPanel activeDrag={activeDrag} onDragStart={setActiveDrag} onDragEnd={handleDragEnd} />
        <SettingsPanel />
      </div>
    </DndContext>
  );
}
