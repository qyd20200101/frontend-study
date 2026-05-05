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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BaseNode } from "@my-sass/core";
import FormRenderer from "../renderer/FormRenderer";
import { useDesignerStore } from "../store/designerStore";

const ROOT_CONTAINER_ID = "__ROOT__";
const groupContainerId = (groupId: string) => `group:${groupId}`;

type SortableItemProps = {
  node: BaseNode;
  containerId: string;
  selected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
};

function SortableItem({
  node,
  containerId,
  selected,
  onSelect,
  children,
}: SortableItemProps) {
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

function GroupDropZone({
  groupId,
  children,
}: {
  groupId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: groupId, // 注意：仍用节点 id，便于“拖入 group”逻辑
  });

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

type GroupChildrenProps = {
  groupNode: BaseNode;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
};

function GroupChildren({
  groupNode,
  selectedId,
  setSelectedId,
}: GroupChildrenProps) {
  const children = groupNode.children ?? [];
  const containerId = groupContainerId(groupNode.id);

  return (
    <SortableContext
      items={children.map((n) => n.id)}
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
    setNodes,
    findNodeById,
    moveNodeToGroup,
    reorderInContainer, // 需要你在 store 里实现（之前已给）
  } = useDesignerStore();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromContainerId = active.data.current?.containerId as
      | string
      | undefined;
    const toContainerId = over.data.current?.containerId as string | undefined;

    // A. 同容器排序（顶层 / 同group）
    if (fromContainerId && toContainerId && fromContainerId === toContainerId) {
      const list =
        fromContainerId === ROOT_CONTAINER_ID
          ? nodes
          : (findNodeById(fromContainerId.replace("group:", ""))?.children ??
            []);

      const oldIndex = list.findIndex((n) => n.id === active.id);
      const newIndex = list.findIndex((n) => n.id === over.id);

      if (oldIndex >= 0 && newIndex >= 0) {
        // 用 store 方法（推荐）
        if (reorderInContainer) {
          reorderInContainer(fromContainerId, oldIndex, newIndex);
        } else if (fromContainerId === ROOT_CONTAINER_ID) {
          // 兜底：顶层直接 setNodes
          setNodes(arrayMove(nodes, oldIndex, newIndex));
        }
      }
      return;
    }

    // B. 拖入 group（跨容器先做 append）
    const overNode = findNodeById(String(over.id));
    if (overNode?.type === "group") {
      moveNodeToGroup(String(active.id), overNode.id);
      return;
    }

    // C. 顶层兜底排序（旧逻辑保留）
    const oldIndex = nodes.findIndex((n) => n.id === active.id);
    const newIndex = nodes.findIndex((n) => n.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) {
      setNodes(arrayMove(nodes, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* 顶层容器 */}
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
                {/* group 自身展示 */}
                <FormRenderer
                  nodes={[{ ...node, children: [] }]}
                  value={{}}
                  onChange={() => {}}
                />
                {/* group children 可排序区域 */}
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
