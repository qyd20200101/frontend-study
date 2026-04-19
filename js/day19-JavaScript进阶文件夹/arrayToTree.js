//扁平数组转树形
//双重for循环复杂度O(n*2)
const list = [
    {id: 1,name: '总部', pid: 0},
    {id: 2,name: '西安分店', pid: 1},
    {id: 3,name: '高新门店', pid: 2},
    {id: 4,name: '北京分部', pid: 1},
];

function arrToTree(tiems) {
    const result = [];//存放根节点
    const itemMap = {};//哈希表映射

    //第一次遍历：把所有的项存入Map
    for (const item of items) {
        itemMap[item.id] = {...item,children:[]};
    }

    //第二次遍历：根据pid寻找父亲
    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];

        if (pid === 0) {
            //它是爷爷节点
            result.push(treeItem);
        }else{
            if (itemMap[pid]) {
                //如果它有父亲，把它塞进父亲的children里
                itemMap[pid].children.push(treeItem);
            }
        }
    }
    return result;
}

function arrToTree(items) {
    const result =[];
    const itemMap ={};

    for (const item of items) {
        itemMap[item.id] = {...item,children:[]};
    }

    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];
        
        if (pid === 0) {
            result.push(treeItem);
        }else{
            if (itemMap[pid]) {
                item[pid].children.push(treeItem);
            }
        }
    }
    return result;
}

function arrToTree(items) {
    const result = [];
    const itemMap = {};

    for (const item of items) {
        itemMap[item.id] = {...item,children: []};
    }

    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem = itemMap[id];

        if (pid === 0) {
            result.push(treeItem);
        }else{
            if (itemMap[pid]) {
                itemMap[pid].children.push(treeItem);
            }
        }
    }
    return result;
}
