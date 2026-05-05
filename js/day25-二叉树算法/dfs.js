//二叉树最大深度
function maxDepth(root) {
  if (root === null) {
    return 0;
  }
  //   核心：左右子树都算一遍，谁深取谁，当前节点再加1,左右子树深度不一样直接取较大的
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  return Math.max(leftDepth, rightDepth) + 1;
}
//bfs实现求二叉树最大深度，通过逐层遍历层级
//层序遍历一层一层扫树：每遍历完一层，深度 +1最后遍历了多少层，树的最大深度就是多少
function maxDepthBFS(root) {
  if (!root) {
    return 0;
  }
  const queue = [root];
  let depth = 0;
  while (queue.length) {
    const size = queue.length;
    depth++;

    for (let i = 0; i < queue.length; i++) {
      const node = queue.shift();
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
  }
  return depth;
}

//对称二叉树
function isSymmetric(root) {
  if (root === null) {
    return true;
  }

  function isMirror(left, right) {
    if (left === null && right === null) {
      return true;
    }
    if (left === null || right === null) {
      return false;
    }

    return isMirror(left.left, right.right) && isMirror(left.right, right.left);
  }

  return isMirror(root.left, root.right);
}

//BFC实现对称树判断
//判断每一层是否为回文
function isSymmetricBFC(root) {
  if (!root) {
    return true;
  }

  const queue = [root];

  while (queue.length) {
    const size = queue.length;
    const level = [];

    for (let i = 0; i < queue.length; i++) {
      const node = queue.shift();

      if (node) {
        level.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        level.push(null);
      }
    }

    //判断这一层是否是回文
    let l = 0,
      r = level.length - 1;
    while (l < r) {
      if (level[l] !== level[r]) {
        return false;
      }
      l++;
      r--;
    }
  }
  return true;
}

//层序遍历
function levelOrder(root) {
  if (!root) {
    return [];
  }
  const res = [];
  const queue = [root];

  while (queue.length) {
    const size = queue.length;
    const level = [];

    for (let i = 0; i < queue.length; i++) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    res.push(level);
  }
  return res;
}
//DFS实现
//递归时带一个层级参数depth:
//第depth层的节点值，放到res[depth],递归访问左子树和右子树,每到一个节点，就把它放到对应层的数组里
function levelDFS(root) {
  const res = [];
  function dfs(node, depth) {
    if (!node) {
      return;
    }
    if (!res[depth]) {
      res[depth] = [];
    }

    res[depth].push(node.val);

    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }
  dfs(root, 0);
  return res;
}
//目标值路径
function hasPathSum(root, targetSum) {
  if (root === null) {
    return false;
  }

  //叶子节点
  if ((root.left === null && root, right === null)) {
    return root.val === targetSum;
  }

  const newTarget = targetSum - root.val;

  return hasPathSum(root.left, newTarget) || hasPathSum(root.right, newTarget);
}
//最近公共祖先
function lowestCommonAncestor(root, p, q) {
  if (root === null) {
    return null;
  }
  if (root === p || root === q) {
    return root;
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left !== null && right !== null) {
    return root;
  }

  return left !== null ? left : right;
}
//回溯
// 全排列是典型的回溯题。
// 我会维护一个路径 path，每次从剩余元素中选择一个未使用的数字加入路径，并通过 used 数组避免重复使用。
// 当路径长度等于数组长度时，说明找到了一种完整排列，把它加入结果集。
// 回溯结束后要撤销选择，继续尝试其他分支。
function permute(nums) {
  const res = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }
      used[i] = true;
      path.push(nums[i]);

      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return res;
}

// 子集
// 子集题和全排列一样都属于回溯，但思路不一样。
// 全排列关注的是顺序，所以需要 used 数组避免重复使用元素；子集不关注顺序，只要通过 start 控制每次只能往后选，就不会重复。
// 回溯过程中，每到一个节点都可以把当前路径加入结果集，因为当前路径本身就是一个合法子集。
function subsets(nums) {
  const res = [];
  const path = [];
  function backtrack(start) {
    res.push([...path]);

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  }

  backtrack(0);
  return res;
}

// 组合题和子集很像，但子集是把所有可能都收集，组合是限制固定长度 k。
// 我会用回溯从 1 到 n 枚举数字，每次只从当前数字往后选，避免重复。
// 当路径长度等于 k 时就把结果加入结果集。
// 如果做剪枝，还可以提前判断剩余可选数字是否足够，减少无效搜索。
//时间复杂度O(C(n, k) * k),空间复杂度O(k)
function combine(n, k) {
  const res = [];
  const path = [];
  function backtrack(start) {
    if (path.length === k) {
      res.push([...path]);
      return;
    }

    //剪枝：判断剩余数字集合是否足够
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  }

  backtrack(1);
  return res;
}

/*
括号生成是典型的回溯题，因为它需要在所有可能的选择中，找出所有合法结果。
我们在构造字符串时，左括号和右括号都可以选择，但必须满足两个约束：左括号数量不能超过 n，右括号数量不能超过左括号数量。
也就是说，只有当前缀中左括号数量大于右括号数量时，才允许继续添加右括号。
当路径长度等于 2 * n 时，说明已经生成了一组合法括号，可以加入结果集。
*/

function generateParenthesis(n) {
  const res = [];
  const path = [];
  function backtrack(left, right) {
    if (path.length === 2 * n) {
      (res, push(path.join("")));
      return;
    }
    if (left < n) {
      path.push("(");
      backtrack(left + 1, right);
      path.pop();
    }
    if (right < left) {
      path.push(")");
      backtrack(left, right + 1);
      path.pop();
    }
  }

  backtrack(0, 0);
  return res;
}
