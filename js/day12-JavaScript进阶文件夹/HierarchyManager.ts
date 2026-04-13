/*
场景三：无限层级架构的自动化转化（架构能力）
涉及知识点：arrayToTree(扁平转树)，递归组件，TypeScript接口定义
*/
export interface BaseTreeNode {
  id: number|string;
  pid: number| string;
  children?: BaseTreeNode[];
  [key:string]: any;
}

//手写复习o(n)时间复杂度算法
function arrayToTree<T extends BaseTreeNode>(list: T[], rootPid:number | string = 0):T[] {
    const nodeMap: Record<string|number,T & Required<Pick<BaseTreeNode,'children'>>> = {};
    const result: T[] = [];

    //第一轮变量：把所有节点存入map,提前初始化children空数组
    list.forEach(item =>{
        nodeMap[item.id] = {
            ...item,
            children: []//确保每个节点都有children数组，避免可选链报错
        };
    });

    //第二轮遍历：组装父子关系
    list.forEach(item =>{
        const currentNode = nodeMap[item.id];
        //根节点:直接推入结果数组
        if (item.pid === rootPid) {
            result.push(currentNode);
        }else{
        // 非根节点：找到夫节点，推入父节点的children
        const parentNode = nodeMap[item.pid];
        //边界处理: 找到父节点，推入父节点的children
        if (parentNode) {
            parentNode.children.push(currentNode);
        }
        }
    });
    return result;
}

// 测试场景：四级深度结构测试
interface MenuItem extends BaseTreeNode{
    baseurl: string;
    title: string;
    icon?: string;
}

// 带baseurl的扁平菜单数据（和你后台返回的格式完全匹配）
const flatMenuList: MenuItem[] = [
  { id: 1, pid: 0, baseurl: '/', title: '首页', icon: 'HomeFilled' },
  { id: 2, pid: 1, baseurl: '/dashboard', title: '资产管理面板', roles: ['admin', 'editor'] },
  { id: 3, pid: 1, baseurl: '/system', title: '系统管理', icon: 'Setting', roles: ['admin'] },
  { id: 4, pid: 3, baseurl: '/system/setting', title: '系统设置', roles: ['admin'] },
  { id: 5, pid: 3, baseurl: '/system/user', title: '用户管理', roles: ['admin'] }
];

// 调用函数，TS会自动推导类型，保留所有业务字段的类型提示
const menuTree = arrayToTree(flatMenuList);

// 测试验证
console.log('树形结构生成成功：', menuTree);
console.log('baseurl字段完整保留：', menuTree[0]?.children?.[1]?.children?.[0]?.baseurl);
console.log('TS类型提示正常：', menuTree[0].title); // 会自动提示title/baseurl等字段