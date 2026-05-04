import { useMemo } from 'react';
import { useDesignerStore } from '../store/designerStore';

export default function PropsPanel() {
  const { nodes, selectedId, updateNode } = useDesignerStore();

  const current = useMemo(() => {
    const walk = (list: any[]): any | null => {
      for (const n of list) {
        if (n.id === selectedId) return n;
        if (n.children?.length) {
          const f = walk(n.children);
          if (f) return f;
        }
      }
      return null;
    };
    return walk(nodes);
  }, [nodes, selectedId]);

  if (!current) return <div>请选择一个节点</div>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h3>属性面板</h3>

      <label>
        标题
        <input
          value={current.label || ''}
          onChange={(e) => updateNode(current.id, { label: e.target.value })}
          style={{ width: '100%', marginTop: 4 }}
        />
      </label>

      <label>
        Placeholder
        <input
          value={current.props?.placeholder || ''}
          onChange={(e) =>
            updateNode(current.id, {
              props: { placeholder: e.target.value }
            } as any)
          }
          style={{ width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
