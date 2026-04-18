function treeToArrBFC(tree) {
    if (! tree || tree.length === 0) return 0;

    const result =[];
    //初始化队列，将第一层节点放入其中
    const queue = [...tree];
    
    //只要队列里还有东西，就继续跑
    while (queue.length >0) {
        //出队：取出第一个节点
        const node = queue.shift();
        //结构赋值:取出需要的数据,剥离children
        const { children,...rest} = node;        
        result.push(rest);

        //入队：如果该节点有子节点，把所有的子节点推入队列末尾
        if (children && children.length > 0) {
            queue.push(...children);
        }
    }
    return result;
}

//测试运行
const myTree = [
    {
        id: 1, name: "总部", parentId: 0,
        children: [
            { id: 2, name: "财务部", parentId: 1 },
            { id: 3, name: "技术部", parentId: 1, children: [
                { id: 4, name: "前端", parentId: 3 }
            ]}
        ]
    }
];
console.log('扁平化结果：',treeToArrBFC(myTree));
