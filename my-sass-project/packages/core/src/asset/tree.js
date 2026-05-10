export function arrToTree(items) {
    const res = [];
    const map = {};
    items.forEach((i) => (map[i.id] = { ...i, children: [] }));
    items.forEach((i) => {
        if (i.pid === 0)
            res.push(map[i.id]);
        else if (map[i.pid])
            map[i.pid].children.push(map[i.id]);
    });
    return res;
}
