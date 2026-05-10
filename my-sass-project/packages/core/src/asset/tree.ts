import type { TreeNode } from "./types.js";

export function arrToTree(items: TreeNode[]): TreeNode[] {
    const res: TreeNode[] = [];
    const map: Record<number, TreeNode> = {};

    items.forEach((i) => (map[i.id] = { ...i, children: [] }));
    items.forEach((i) => {
        if (i.pid === 0) res.push(map[i.id]);
        else if (map[i.pid]) map[i.pid].children!.push(map[i.id]);
    });

    return res;
}
