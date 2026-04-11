/*
扁平化转树形结构(时间复杂度o(n))
场景：部门管理，分类菜单
*/
function arratToTree(items) {
    // 存放根节点
    const result = [];
    //映射表,用于快速查找
    const itemMap = {};
    //1.先将所有项存入map,并初始化children
    for (const item of items) {
        itemMap[item.id] = { ...item, children: [] }
    }
    //2.遍历map,寻找父子关系
    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];
        //如果没有父ID，说明是根节点
        //找到父节点，并把组件塞进父节点的children
        if (pid === 0 || pid === null) {
            result.push(treeItem);
        }
        else {
            if (itemMap[pid]) {
                itemMap[pid].children.push(treeItem);
            }
        }
    }

}

//测试数据
const flatData = [
    { id: 1, pid: 0, name: '西安总部' },
    { id: 2, pid: 1, name: '研发组' },
    { id: 3, pid: 2, name: '市场部' },
    { id: 4, pid: 1, name: '前端组' },
];

console.log(arratToTree(flatData));

function arratToTree() {
    // 存放根节点

    //映射表,用于快速查找

    //1.先将所有项存入map,并初始化children

    //2.遍历map,寻找父子关系

    //如果没有父ID，说明是根节点

    //找到父节点，并把组件塞进父节点的children
}
