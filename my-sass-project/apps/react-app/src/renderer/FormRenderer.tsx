import type { BaseNode } from '@my-sass/core';
import { evaluateVisibleExpression } from '@my-sass/core';  // ← 新增导入
import { componentMap } from './componentMap';

interface Props {
    nodes: BaseNode[];
    value: Record<string, any>;
    onChange: (key: string, val: any) => void;
    nodeWrapper?: (node: BaseNode, element: React.ReactNode) => React.ReactNode;
}

export default function FormRenderer(props: Props) {
    const checkVisible = (node: BaseNode) => {
        const visibleOn = node.props?.visibleOn;
        if (!visibleOn) return true;
        return evaluateVisibleExpression(visibleOn, props.value);
    };

    const renderNode = (node: BaseNode) => {
        if (!checkVisible(node)) return null;

        const Comp = componentMap[node.type as keyof typeof componentMap];
        if (!Comp) {
            console.warn(`组件类型 ${node.type} 未在 componentMap 中注册`);
            return null;
        }

        if (node.type === 'group') {
            return (
                <Comp key={node.id} label={node.label}>
                    {node.children?.map((child) => renderNode(child))}
                </Comp>
            );
        }

        const modelKey = node.props?.modelKey;

        const element = (
            <Comp
                key={node.id}
                label={node.label}
                placeholder={node.props?.placeholder}
                options={node.props?.options}
                value={modelKey ? props.value[modelKey] : undefined}
                onChange={(val: any) => {
                    if (!modelKey) return;
                    props.onChange(modelKey, val);
                }}
            />
        );

        return props.nodeWrapper ? props.nodeWrapper(node, element) : element;
    };

    return <div>{props.nodes.map((node) => renderNode(node))}</div>;
}
