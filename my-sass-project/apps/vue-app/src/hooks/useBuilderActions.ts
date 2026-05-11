import { inject, type Ref, type ComputedRef } from 'vue';
import type { FormComponent } from '../types/lowcode';

export interface BuilderContext {
    activeComponentId: Ref<string | null>;
    labelWidth: ComputedRef<string>;
    selectComponent: (id: string) => void;
    deleteComponent: (id: string) => void;
    handleCanvasDragStart: (e: DragEvent, id: string) => void;
    handleDrop: (e: DragEvent, targetList: FormComponent[], index: number) => void;
}

export const BUILDER_CONTEXT_KEY = 'builderContext';

/**
 * 通过 inject 获取 FormBuilder 提供的共享上下文
 * 暴露统一的 actions 与 state，避免 props/emit 层层传递
 */
export function useBuilderActions() {
    const ctx = inject<BuilderContext>(BUILDER_CONTEXT_KEY);
    if (!ctx) {
        throw new Error('useBuilderActions 必须在 FormBuilder 内使用');
    }

    return {
        // state
        activeComponentId: ctx.activeComponentId,
        labelWidth: ctx.labelWidth,
        // actions
        onSelect: ctx.selectComponent,
        onDelete: ctx.deleteComponent,
        onDragStart: ctx.handleCanvasDragStart,
        onDrop: ctx.handleDrop,
    };
}
