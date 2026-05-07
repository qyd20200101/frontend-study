function reverseOrder(root) {
  const result = [];
  const queue = [root];
  if (root === null) {
    return result;
  }
  while (queue.length) {
    let size = queue.length;
    let level = [];
    for (let i = 0; i < size; i++) {
      let node = queue.shift(); //出队当前层节点
      level.push(node.val); //收集当前层级

      if (node.left) queue.push(node.left); //入队下一层
      if (node.right) queue.push(node.right); //入队下一层
    }
    result.push(level);
  }
}
