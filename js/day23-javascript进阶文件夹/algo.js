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

      // 将下一层节点推入队尾
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

//盛水最多的容器
//双指针，贪心算法

var maxArea = function (height) {
  let left = 0; //左指针
  let right = height.length - 1;
  let res = 0; //最大面积

  while (left < right) {
    //计算当前面积
    let currentArea = Math.min(height[left], height[right]) * (right - left);

    //更新最大值
    res = Math.max(res, currentArea);

    //贪心：移动最短的那根柱子
    if (height[right] > height[left]) {
      left++;
    } else {
      right--;
    }
  }
  return res;
};

//翻转二叉树

var inverTree = function (root) {
  //终止条件
  if (root === null) return null;

  //单层逻辑，暂存左子节点,进行交换
  const temp = root.left;
  root.left = root.right;
  root.right = temp;

  //递归:去翻转子树

  inverTree(root.left);
  inverTree(root.right);

  return root;
};
