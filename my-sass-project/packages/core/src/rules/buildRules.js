export function buildRules(node) {
    const rules = [];
    if (node.props?.required) {
        rules.push({
            required: true,
            message: `${node.label || node.type}不能为空`
        });
    }
    return rules;
}
