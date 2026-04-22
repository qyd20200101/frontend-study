//递归调用
function findDepts(tree,keyword) {
    const result = [];
    function dfs(nodes) {
        for (const node of nodes) {
            if (node.name.includes(keyword)) result.push(node.id);
            if (node.children) dfs(node.children);
        }
    }

    dfs(tree);
    return result;
}

//数据
const treeData = [
  {
    id: 1,
    name: "西安某集团总部",
    children: [
      { id: 2, name: "研发技术中心", children: [
          { id: 5, name: "前端开发部" },
          { id: 6, name: "后端开发部" }
      ]},
      { id: 3, name: "行政管理中心" }
    ]
  }
];

// 深度优先
function searchTreeDFS(nodes,keyword) {
    const result =[];

    //辅助递归函数
    function traverse(list) {
        for (const node of list) {
            if (node.name.includes(keyword)) {
                result.push(node.id);
            }

            //如果有子节点，递归深入
            if (node.children && node.children.length > 0) {
                traverse(node.children);
            }
        }
    }

    traverse(nodes);
    return result;
}

console.log(searchTreeDFS(treeData,"研发"));


function findPath(tree,targetId,path= []) {
    for (const node of tree) {
        //当前节点加入路径快照
        const currentpath = [...path,node.name];
        if (node.id === targetId) {
            return currentpath;
        }
        if (node.children) {
            const res = findPath(node.children,targetId,currentpath);
            if (res) {
                return res;
            }
        }
    }
    return null;
}

console.log(findPath(treeData,6));