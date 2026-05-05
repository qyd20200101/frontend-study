function climbStairs(n) {
  if (n === 0) {
    return 1;
  }
  if (n === 1) {
    return 1;
  }
  //   const dp = new Array(n + 1).fill(0);
  //   dp[0] = 1;
  //   dp[1] = 1;

  //   for (let i = 2; i < n; i++) {
  //     //dp[i] = 到达第 i 级台阶的方法数
  //     dp[i] = dp[i - 1] + dp[i - 2];
  //   }
  //   return dp[n];
  //空间优化o(1)
  let a = 1;
  let b = 1;
  for (let i = 2; i < n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
//打家劫舍
//数组版
function robArr(nums) {
  const n = nums.length;
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return nums[0];
  }

  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0].nums[1]);

  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  return dp[n - 1];
}

//空间优化版
function rob(nums) {
  const n = nums.length;
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return nums[0];
  }
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);

  for (let i = 2; i < n; i++) {
    const cur = Math.max(prev1, prev2 + nums[1]);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}

//最长递增子序列长度集合
function lengthOfLIS(nums) {
  const n = nums.length;
  if (n === 0) {
    return 0;
  }
  const dp = new Array(n).fill(1);
  let maxLen = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  return maxLen;
}
//0-1背包
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < capacity; j--) {
      if (j < weights[i - 1]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          dp[i - 1][j - weights[i - 1]] + values[i - 1],
        );
      }
    }
  }
  return dp[n][capacity];
}
//硬币找零
function coinChange(cions, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 0; i < cions.length; i++) {
    for (let j = 0; j <= amount; j++) {
      dp[j] = Math.min(dp[j], dp[j - cions[i] + 1]);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
