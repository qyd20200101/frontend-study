var isValid = function (s) {
  const map = new Map({
    ")": "(",
    "}": "{",
    "]": "[",
  });

  const stack = [];
  for (let char of s) {
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
    } else {
      if (stack.length === 0) {
        return false;
      }
      if (stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
};
//map实现映射
var twoSum = function (nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
};
//obejct实现映射
var twoSum = function (nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  return [];
};
function maxDepth(root) {
  // ① 终止条件：空节点返回 0
  if (root === null) return 0;

  // ② 递归计算左右子树深度
  let left = maxDepth(root.left);
  let right = maxDepth(root.right);

  // ③ 当前节点的深度 = max(左, 右) + 1
  return Math.max(left, right) + 1;
}
//全排列组合
var permute = function (nums) {
  let result = [];
  const used = new Array(nums.length).fill(false);
  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }

      path.push(nums[i]);
      used[i] = true;

      backtrack(path, used);

      path.pop();
      usd[i] = false;
    }
  }
};
