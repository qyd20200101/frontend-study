import type { RouteRecordRaw } from "vue-router";

export function findPathNodes(
    routes: RouteRecordRaw[],
    targetPath: string,
    path:RouteRecordRaw[] =[]
): RouteRecordRaw[] | null {
    for (const route of routes) {
        const currentpath = [...path,route];
        if (route.path === targetPath) {
            return currentpath;
        }
        if (route.children) {
            const result = findPathNodes(route.children,targetPath,currentpath);
            if (result) return result;
        }
    }
    return null;
}