function fib(n) {
    if (n < 1) return n;
    //初始化dp数组
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;
    //线性递归
    for (let i = 0; i < n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
//空间优化版本
function fibOptimized(n) {
    if (n < 1) {
        return n;
    };
    let prevPrev = 0;
    let prev = 1;
    for (let i = 2; i < n; i++) {
        const curr = prevPrev + prev;
        prevPrev = prev;
        prev = curr;
    }
    return prev;
}

//爬楼梯
function climbStairs(n) {
    if (n <= 1) return 1;
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;
    for (let i = 0; i < n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
//空间优化版

function climbStairsOptimized(n) {
    if (n <= 1) return 1;
    let a = 1;
    let b = 1;
    for (let i = 2; i < n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

//打家劫舍
function rob(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (let i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 1], dp[i - 2]);
    }
    return dp[n - 1];
}

function robOptimized(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    let prePrev = nums[0];
    let prev = Math.max(nums[0], nums[1]);
    for (let i = 2; i < n; i++) {
        const curr = Math.max(prev, prePrev + nums[i]);
        prePrev = prev;
        prev = curr;
    }
    return prev;
}

//不同路径
function uniquePaths(m, n) {
    //初始化m,n的二维数组，所有元素初始为1
    const dp = new Array(m).fill(0).map(() => new Array(0).fill());
    //按行递推
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}

//空间优化版
function uniquePathsOptimized(m, n) {
    const dp = new Array(n).fill(1);
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}