function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = Array(n).fill(0);
  const stack = [];
  for (let i = 0; i < n; i++) {
    //当前温度比栈顶温度高->弹出栈顶，计算结果
    while (
      stack.length > 0 &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const index = stack.pop();
      result[index] = i - index;
    }
    stack.push(i);
  }
  return result;
}

//和为 K 的子数组
function subarraySum(nums, k) {
  const map = new Map();
  let sum = 0;
  let diff = 0;
  let count = 0;
  for (const num of nums) {
    sum += num;
    diff = sum - k;
    if (map.has(diff)) {
      count += map.get(diff);
    }
    map[sum] = (map.get(sum) || 0) + 1;
  }

  return count;
}
var lowestCommonAncestor = function (root, p, q) {
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
  if (left !== null) {
    return left;
  }
  if (right !== null) {
    return right;
  }
  return null;
};
//子集
function subsets(nums) {
  const result = [];
  function backtrack(start, path) {
    result.push([...path]);

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0);
  return result;
}
