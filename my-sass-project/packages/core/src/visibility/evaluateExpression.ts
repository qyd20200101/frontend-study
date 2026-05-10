import type { VisibleExpressionVars } from './types.js';

/**
 * 支持形如 "{user.role} === 'admin'" 的表达式
 * @param expr   schema 中配置的 visibleOn 表达式
 * @param vars   表单当前值（也是表达式上下文）
 */
export function evaluateVisibleExpression(expr: string, vars: VisibleExpressionVars): boolean {
    if (!expr) return true;

    try {
        const expression = expr.replace(/\{([\w.]+)\}/g, (_, path) => {
            const val = getProp(vars, path);
            return typeof val === 'string' ? `'${val}'` : val;
        });

        // ⚠️ 目前仍使用 new Function，后续可替换成安全解析器
        // eslint-disable-next-line no-new-func
        return new Function(`return ${expression}`)();
    } catch (error) {
        console.warn('[visibleOn] 表达式解析失败：', expr, error);
        return true; // 出错时默认展示，避免影响主流程
    }
}

/**
 * 简单的点路径取值（支持 a.b.c）
 */
function getProp(obj: VisibleExpressionVars, path: string) {
    return path.split('.').reduce((acc: any, key) => {
        if (acc == null) return acc;
        return acc[key];
    }, obj);
}
