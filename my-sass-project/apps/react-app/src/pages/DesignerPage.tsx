import { useDesignerStore } from '../store/designerStore';
import { defaultInputNode } from '@my-sass/core';
import Canvas from '../editor/Canvas';
import PropsPanel from '../editor/PropsPanel';

export default function DesignerPage() {
  const { addNode } = useDesignerStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid #ddd', padding: 16 }}>
        <h3>物料区</h3>
        <button
          onClick={() =>
            addNode({
              ...defaultInputNode,
              id: `input_${Date.now()}`,
              label: '输入框'
            })
          }
        >
          添加输入框
        </button>
      </aside>

      <main style={{ padding: 16, overflow: 'auto' }}>
        <Canvas />
      </main>

      <aside style={{ borderLeft: '1px solid #ddd', padding: 16 }}>
        <PropsPanel />
      </aside>
    </div>
  );
}
