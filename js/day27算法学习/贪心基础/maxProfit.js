function maxProfit(prices) {
  if (!prices || prices.length < 2) {
    return 0;
  }
  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
    } else {
      maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
  }
  return maxProfit;
}
//股票交易
let maxProfit = function (prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  return profit;
};

//跳格子
var caJump = function (nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    //如果当前位置已经超出能到达的最远距离——>卡住了
    if (i > maxReach) {
      return false;
    }
    //更新最远到达距离
    maxReach = Math.max(maxReach, i + nums[i]);
    //如果已经能到达重点->提前返回
    if (maxReach >= nums.length - 1) {
      return true;
    }
  }
  return true;
};

//饼干喂饱孩子
var findContentChildren = function (g, s) {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  let i = 0;
  let j = 0;
  while (i < g.length && j < s.length) {
    if (s[j] >= g[i]) {
      i++;
    }
    j++;
  }
  return i;
};
var jump = function (nums) {
  let maxReach = 0,
    curEnd = 0,
    jump = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    maxReach = Math.max(maxReach, i + nums[i]);
    if (i === curEnd) {
      jump++;
      curEnd = maxReach;
      if (curEnd >= nums.length - 1) {
        break;
      }
    }
  }
  return jump;
};
