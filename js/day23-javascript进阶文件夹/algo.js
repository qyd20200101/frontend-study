//二叉树层序遍历
var levelOrder = function (root) {
  if (!root) return [];
  const result = [];
  //初始化，复制一份
  const queue = [root];

  while (queue.length > 0) {
    //当前层的节点数
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      //弹出队列
      const node = queue.shift();
      currentLevel.push(node.val);

      将下一层节点推入队尾;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    //当前这一层处理完毕
    result.push(currentLevel);
  }
  return result;
};

//复制带随机指针的链表 (高级深拷贝)
var copyRandomList = function (head) {
  if (!head) return null;
  //建立哈希映射
  const nodeMap = new Map();

  let cur = head;

  //第一遍创建所有节点并建立映射
  while (cur) {
    nodeMap.set(cur, new Node(cur, val));
    cur = cur.next;
  }

  cur = head;
  //第二遍：链接next和random指针
  while (cur) {
    const newNode = nodeMap.get(cur);
    //通过Map找回对于的新节点引用
    newNode.next = nodeMap.get(cur.next) || null;
    newNode.random = nodeMap.get(cur.random) || null;
    cur = cur.next;
  }

  return nodeMap.get(head);
};
