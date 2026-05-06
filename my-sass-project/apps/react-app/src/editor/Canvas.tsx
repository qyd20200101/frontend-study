import React from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BaseNode } from "@my-sass/core";
import FormRenderer from "../renderer/FormRenderer";
import {
  useDesignerStore,
  ROOT_CONTAINER_ID,
  groupContainerId,
} from "../store/designerStore";

function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_CONTAINER_ID });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? "2px dashed #1677ff" : "1px dashed #999",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        background: isOver ? "rgba(22,119,255,0.08)" : "transparent",
        fontSize: 12,
      }}
    >
      {isOver ? "松开：移动到顶层" : "拖到这里：移动到顶层"}
    </div>
  );
}

function GroupDropZone({
  groupId,
  children,
}: {
  groupId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: groupId });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? "2px dashed #52c41a" : "1px dashed #888",
        borderRadius: 8,
        padding: 8,
        marginTop: 6,
        background: isOver ? "rgba(82,196,26,0.08)" : "transparent",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
        {isOver ? "松开以放入该分组" : "可拖入该分组"}
      </div>
      {children}
    </div>
  );
}

function SortableItem({
  node,
  containerId,
  selected,
  onSelect,
  children,
}: {
  node: BaseNode;
  containerId: string;
  selected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: node.id,
      data: { containerId },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: selected ? "1px solid #4096ff" : "1px solid transparent",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    background: "#1f1f1f",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      <div
        style={{ fontSize: 12, opacity: 0.7, marginBottom: 6, cursor: "grab" }}
        {...attributes}
        {...listeners}
      >
        ⠿ 拖拽
      </div>
      {children}
    </div>
  );
}

function GroupChildren({
  groupNode,
  selectedId,
  setSelectedId,
}: {
  groupNode: BaseNode;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
}) {
  const children = groupNode.children ?? [];
  const containerId = groupContainerId(groupNode.id);

  return (
    <SortableContext
      items={children.map((c) => c.id)}
      strategy={verticalListSortingStrategy}
    >
      {children.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.65 }}>（分组内暂无字段）</div>
      ) : (
        children.map((child) => (
          <SortableItem
            key={child.id}
            node={child}
            containerId={containerId}
            selected={selectedId === child.id}
            onSelect={setSelectedId}
          >
            <FormRenderer nodes={[child]} value={{}} onChange={() => {}} />
          </SortableItem>
        ))
      )}
    </SortableContext>
  );
}

export default function Canvas() {
  const {
    nodes,
    selectedId,
    setSelectedId,
    findNodeById,
    reorderInContainer,
    moveBetweenContainers,
    moveBetweenContainers: moveNode, // 别名仅为可读性
  } = useDesignerStore();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromContainerId = active.data.current?.containerId as
      | string
      | undefined;

    // 1) 目标是 root 回收区
    if (String(over.id) === ROOT_CONTAINER_ID) {
      if (fromContainerId) {
        moveNode(fromContainerId, ROOT_CONTAINER_ID, String(active.id));
      }
      return;
    }

    // 2) 目标是 group 节点壳（droppable id = groupId）
    const overNode = findNodeById(String(over.id));
    if (overNode?.type === "group") {
      if (fromContainerId) {
        moveNode(
          fromContainerId,
          groupContainerId(overNode.id),
          String(active.id),
        );
      }
      return;
    }

    // 3) over 在 sortable item 上（可能是 root 容器、也可能是 group 容器）
    const toContainerId = over.data.current?.containerId as string | undefined;
    if (!fromContainerId || !toContainerId) return;

    if (fromContainerId === toContainerId) {
      // 同容器排序
      const list =
        toContainerId === ROOT_CONTAINER_ID
          ? nodes
          : (findNodeById(toContainerId.replace("group:", ""))?.children ?? []);

      const oldIndex = list.findIndex((n) => n.id === active.id);
      const newIndex = list.findIndex((n) => n.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        reorderInContainer(toContainerId, oldIndex, newIndex);
      }
    } else {
      // 跨容器移动（按 overId 插入）
      moveBetweenContainers(
        fromContainerId,
        toContainerId,
        String(active.id),
        String(over.id),
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <RootDropZone />

      <SortableContext
        items={nodes.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        {nodes.map((node) => (
          <SortableItem
            key={node.id}
            node={node}
            containerId={ROOT_CONTAINER_ID}
            selected={selectedId === node.id}
            onSelect={setSelectedId}
          >
            {node.type === "group" ? (
              <GroupDropZone groupId={node.id}>
                <FormRenderer
                  nodes={[{ ...node, children: [] }]}
                  value={{}}
                  onChange={() => {}}
                />
                <div style={{ marginTop: 8 }}>
                  <GroupChildren
                    groupNode={node}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                  />
                </div>
              </GroupDropZone>
            ) : (
              <FormRenderer nodes={[node]} value={{}} onChange={() => {}} />
            )}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
