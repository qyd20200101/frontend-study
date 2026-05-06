import { jsx as _jsx } from "react/jsx-runtime";
import { evaluateVisibleExpression } from '@my-sass/core'; // ← 新增导入
import { componentMap } from './componentMap';
export default function FormRenderer(props) {
    const checkVisible = (node) => {
        const visibleOn = node.props?.visibleOn;
        if (!visibleOn)
            return true;
        return evaluateVisibleExpression(visibleOn, props.value);
    };
    const renderNode = (node) => {
        if (!checkVisible(node))
            return null;
        const Comp = componentMap[node.type];
        if (!Comp) {
            console.warn(`组件类型 ${node.type} 未在 componentMap 中注册`);
            return null;
        }
        if (node.type === 'group') {
            return (_jsx(Comp, { label: node.label, children: node.children?.map((child) => renderNode(child)) }, node.id));
        }
        const modelKey = node.props?.modelKey;
        const element = (_jsx(Comp, { label: node.label, placeholder: node.props?.placeholder, options: node.props?.options, value: modelKey ? props.value[modelKey] : undefined, onChange: (val) => {
                if (!modelKey)
                    return;
                props.onChange(modelKey, val);
            } }, node.id));
        return props.nodeWrapper ? props.nodeWrapper(node, element) : element;
    };
    return _jsx("div", { children: props.nodes.map((node) => renderNode(node)) });
}
